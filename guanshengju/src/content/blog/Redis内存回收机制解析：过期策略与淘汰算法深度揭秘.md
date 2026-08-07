---
title: "Redis内存回收机制解析：过期策略与淘汰算法深度揭秘"
date: 2025-05-08
summary: "Redis作为内存数据库，其高性能的也得益于其内存的高效管理。本文深入解析Redis的内存回收机制，涵盖两大关键策略——过期策略和淘汰策略。"
tags:
  - "Redis"
source: "https://www.cnblogs.com/vksfeng/p/18865876"
---
# 内存回收

Redis之所以性能强，最主要的原因就是基于内存存储。然而单节点的Redis其内存大小不宜过大，会影响持久化或主从同步性能。

我们可以通过修改配置文件来设置Redis的最大内存：

```

# 格式：
# maxmemory <bytes>
# 例如：
maxmemory 1gb

```

当内存使用达到上限时，就无法存储更多数据了。为了解决这个问题，Redis提供了一些策略实现内存回收：

- 内存过期策略

- 内存淘汰策略

# 内存过期策略

在学习Redis缓存的时候我们说过，可以通过expire命令给Redis的key设置TTL（存活时间）：

![设置ttl.png](/blog-assets/cnblogs-18865876/image-1.png)

可以发现，当key的TTL到期以后，再次访问name返回的是nil，说明这个key已经不存在了，对应的内存也得到释放。从而起到内存回收的目的。

思考：

1. Redis是如何知道一个key是否过期呢？

2. 是不是TTL到期就立即删除了呢？

## DB结构

Redis本身是一个典型的key-value内存存储数据库，因此所有的key、value都保存在之前学习过的Dict结构中。不过在其database结构体中，有两个Dict：一个用来记录key-value；另一个用来记录key-TTL。

```

typedef struct redisDb {
    dict *dict;                 /* 存放所有key及value的地方，也被称为keyspace*/
    dict *expires;              /* 存放每一个key及其对应的TTL存活时间，只包含设置了TTL的key*/
    dict *blocking_keys;        /* Keys with clients waiting for data (BLPOP)*/
    dict *ready_keys;           /* Blocked keys that received a PUSH */
    dict *watched_keys;         /* WATCHED keys for MULTI/EXEC CAS */
    int id;                     /* Database ID，0~15 */
    long long avg_ttl;          /* 记录平均TTL时长 */
    unsigned long expires_cursor; /* expire检查时在dict中抽样的索引位置. */
    list *defrag_later;         /* 等待碎片整理的key列表. */
} redisDb;

```

![DB结构内存图.png](/blog-assets/cnblogs-18865876/image-2.png)

Redis是如何知道一个key是否过期呢？

- 利用两个Dict分别记录key-value对及key-ttl对

## 删除

是不是TTL到期就立即删除了呢？

- 若实现立即删除，需监视每一个key，key过多会给cpu带来很大的压力

- 实际应用采用：惰性删除、周期删除

### 惰性删除

惰性删除：顾明思议并不是在TTL到期后就立刻删除，而是在访问一个key的时候，检查该key的存活时间，如果已经过期才执行删除。

```

// 查找一个key执行写操作
robj *lookupKeyWriteWithFlags(redisDb *db, robj *key, int flags) {
    // 检查key是否过期
    expireIfNeeded(db,key);
    return lookupKey(db,key,flags);
}
// 查找一个key执行读操作
robj *lookupKeyReadWithFlags(redisDb *db, robj *key, int flags) {
    robj *val;
    // 检查key是否过期    if (expireIfNeeded(db,key) == 1) {
        // ...略
    }
    return NULL;
}

```

```

int expireIfNeeded(redisDb *db, robj *key) {
    // 判断是否过期，如果未过期直接结束并返回0
    if (!keyIsExpired(db,key)) return 0;
    // ... 略
    // 删除过期key
    deleteExpiredKeyAndPropagate(db,key);
    return 1;
}

```

存在的问题：若有很多key都已经过期，且再它们也不被访问，那么它们就再也不会被删除了

### 周期删除

**周期删除**：顾明思议是通过一个定时任务，周期性的**抽样部分过期的key**，然后执行删除。执行周期有两种：

- Redis服务初始化函数initServer()中设置定时任务，按照server.hz的频率来执行过期key清理，模式为SLOW

- Redis的每个事件循环前会调用beforeSleep()函数，执行过期key清理，模式为FAST

```

// server.c
void initServer(void){
    // ...
    // 创建定时器，关联回调函数serverCron，处理周期取决于server.hz，默认10
    aeCreateTimeEvent(server.el, 1, serverCron, NULL, NULL)
}

```

```

// server.c
int serverCron(struct aeEventLoop *eventLoop, long long id, void *clientData) {
    // 更新lruclock到当前时间，为后期的LRU和LFU做准备
    unsigned int lruclock = getLRUClock();
    atomicSet(server.lruclock,lruclock);
    // 执行database的数据清理，例如过期key处理
    databasesCron();
}

```

```

void databasesCron(void) {
    // 尝试清理部分过期key，清理模式默认为SLOW
    activeExpireCycle(
          ACTIVE_EXPIRE_CYCLE_SLOW);
}

```

```

void beforeSleep(struct aeEventLoop *eventLoop){
    // ...
    // 尝试清理部分过期key，清理模式默认为FAST
    activeExpireCycle(
         ACTIVE_EXPIRE_CYCLE_FAST);

```

```

void aeMain(aeEventLoop *eventLoop) {
	eventLoop->stop = 0;
	while (!eventLoop->stop) {
		// beforeSleep()-->Fast模式清理
		// n = aeApiPoll()
		// 如果n > 0，FD就绪，处理IO事件
		// 如果到了执行时间，则调用serverCron-->SLOW模式清理
	}
}

```

#### SLOW模式规则：

1. 执行频率受server.hz影响，默认为10，即每秒执行10次，每个执行周期100ms。

2. 执行清理耗时不超过一次执行周期的25%.默认slow模式耗时不超过25ms

3. 逐个遍历db，逐个遍历db中的bucket，抽取20个key判断是否过期

4. 如果没达到时间上限（25ms）并且过期key比例大于10%，再进行一次抽样，否则结束

#### FAST模式规则

（过期key比例小于10%不执行 ）：

1. 执行频率受beforeSleep()调用频率影响，但两次FAST模式间隔不低于2ms

2. 执行清理耗时不超过1ms

3. 逐个遍历db，逐个遍历db中的bucket，抽取20个key判断是否过期

4. 如果没达到时间上限（1ms）并且过期key比例大于10%，再进行一次抽样，否则结束

## 总结

RedisKey的TTL记录方式：

- 在RedisDB中通过一个Dict记录每个Key的TTL时间

过期key的删除策略：

- 惰性清理：每次查找key时判断是否过期，如果过期则删除

- 定期清理：定期抽样部分key，判断是否过期，如果过期则删除。

定期清理的两种模式：

- SLOW模式执行频率默认为10，每次不超过25ms

- FAST模式执行频率不固定，但两次间隔不低于2ms，每次耗时不超过1ms

# 淘汰策略

## 内存淘汰

**内存淘汰**：就是当Redis内存使用达到设置的上限时，主动挑选**部分key**删除以释放更多内存的流程。

Redis会在处理客户端命令的方法processCommand()中尝试做内存淘汰：

```

int processCommand(client *c) {
    // 如果服务器设置了server.maxmemory属性，并且并未有执行lua脚本
    if (server.maxmemory && !server.lua_timedout) {
        // 尝试进行内存淘汰performEvictions
        int out_of_memory = (performEvictions() == EVICT_FAIL);
        // ...
        if (out_of_memory && reject_cmd_on_oom) {
            rejectCommand(c, shared.oomerr);
            return C_OK;
        }
        // ....
    }
}

```

## 淘汰策略

Redis支持8种不同策略来选择要删除的key：

- noeviction：不淘汰任何key，但是内存满时不允许写入新数据，默认就是这种策略。

- volatile-ttl：对设置了TTL的key，比较key的剩余TTL值，TTL越小越先被淘汰

- allkeys-random：对全体key ，随机进行淘汰。也就是直接从db->dict中随机挑选

- volatile-random：对设置了TTL的key ，随机进行淘汰。也就是从db->expires中随机挑选。

- allkeys-lru：对全体key，基于LRU算法进行淘汰

- volatile-lru：对设置了TTL的key，基于LRU算法进行淘汰

- allkeys-lfu：对全体key，基于LFU算法进行淘汰

- volatile-lfu：对设置了TTL的key，基于LFI算法进行淘汰

比较容易混淆的有两个：

- **LRU**（Least Recently Used），最少最近使用。用当前时间减去最后一次访问时间，这个值越大则淘汰优先级越高。

- **LFU**（Least Frequently Used），最少频率使用。会统计每个key的访问频率，值越小淘汰优先级越高。

## LRU与LFU实现

Redis的数据都会被封装为RedisObject结构：

```

typedef struct redisObject {
    unsigned type:4;        // 对象类型
    unsigned encoding:4;    // 编码方式
    unsigned lru:LRU_BITS;  // LRU：以秒为单位记录最近一次访问时间，长度24bit
			  // LFU：高16位以分钟为单位记录最近一次访问时间，低8位记录逻辑访问次数
    int refcount;           // 引用计数，计数为0则可以回收
    void *ptr;              // 数据指针，指向真实数据
} robj;

```

`lru:LRU_BITS`：会根据配置的不同存储不同的内容

LFU的访问次数之所以叫做**逻辑访问次数**，是因为并不是每次key被访问都计数，而是通过运算：

1. 生成0~1之间的随机数R

2. 计算 (旧次数 * lfu_log_factor + 1)，记录为P

3. 如果 R < P ，则计数器 + 1，且最大不超过255

4. 访问次数会随时间衰减，距离上一次访问时间每隔 lfu_decay_time 分钟，计数器 -1

## 淘汰流程

![淘汰策略.png](/blog-assets/cnblogs-18865876/image-3.png)
