---
title: "Redis核心数据结构全解析"
date: 2025-05-06
summary: "本文深入解析了Redis的六大核心数据结构，涵盖动态字符串（SDS）如何解决C字符串的性能瓶颈、整数集合（IntSet）的类型升级机制、字典（Dict）的渐进式rehash策略、压缩列表（ZipList）的连锁更新挑战，以及快速列表（QuickList）和跳跃表（SkipList）在空间与效率间的平衡设计。通过源码分析与实际案例，揭示Redis如何在不同场景下实现高性能存储，为开发者提供调优参考。"
tags:
  - "Redis"
source: "https://www.cnblogs.com/vksfeng/p/18863344"
---
# 动态字符串SDS

字符串是Redis中最常用的一种数据结构

- Redis中的Key是字符串

- value往往是字符串或者字符串的集合

## C语言字符串的缺点

Redis没有直接用C语言中的字符串，因为C语言字符串存在一些问题：

- **获取长度**：需要\(O(n)\)遍历数组

- **非二进制安全**：以`\0`为结束符，则字符串中不能包含`\0`，不能保存像图片、音频、视频文化这样的二进制数据

- **操作不便**：不可修改。进行拼接等操作时，需要考虑内存管理，存在风险

## SDS

Redis构建了一种新的字符串结构，称为**简单动态字符串**（**S**imple **D**ynamic **S**tring），简称**SDS**

### SDS结构

Redis 是 C 语言实现的，其中 SDS 是一个结构体，源码如下：

```

struct **attribute** ((**packed**)) sdshdr8 {
	uint8_t len; /* buf 已保存的字符串字节数，不包含结束标示 */
	uint8_t alloc; /* buf 申请的总的字节数，不包含结束标示 */
	unsigned char flags; /* 不同 SDS 的头类型，用来控制 SDS 的头大小 */
	char buf [];
};

```

- 注意：为满足不同大小的存储需求，还有`sdshdr16`、`sdshdr32`、`sdshdr64`，数字与int的bit长度相同（`sdshdr5`已弃用）

| 成员变量 | 描述 |
| --- | --- |
| `len` | 记录字符串长度 |
| `alloc` | 分配给字符数组的空间长度 |
| `flags` | 用来表示不同类型的SDS |
| `buf[]` | 字节数组，用于保存实际数据 |

例如，一个包含字符串“name”的sds结构如下：

![SDS结构示例.png](/blog-assets/cnblogs-18863344/image-1.png)

### 动态扩容

SDS之所以叫做动态字符串，是因为它具备**动态扩容**的能力。

SDS API通过`alloc-len`计算出可用的剩余空间，从而判断缓冲区大小是否支持操作正常进行。

当缓冲区大小不够时，Redis会自动扩大SDS的空间大小

```

hisds hi_sdsMakeRoomFor(hisds s, size_t addlen)
{
	...
	// s目前的剩余空间已足够，无需扩展，直接返回
	if (avail >= addlen) return s;
	//获取目前s的长度
	len = hi_sdslen(s);
	sh = (char *)s - hi_sdsHdrSize(oldtype);
	//扩展之后 s 至少需要的长度
	newlen = (len + addlen);
	//根据新长度，为s分配新空间所需要的大小
	if (newlen < HI_SDS_MAX_PREALLOC)
		//新长度<HI_SDS_MAX_PREALLOC 则分配所需空间*2的空间
		newlen *= 2;
	else
		//否则，分配长度为目前长度+1MB
		newlen += HI_SDS_MAX_PREALLOC;
		...
	}

```

扩容规则：

- 所需sds长度小于1MB，扩容按照**翻倍扩容**进行。扩容长度：两倍的sds长度

- 所需sds长度超过1MB，会进行**内存预分配**。扩容长度：是sds长度+1MB

  - 预分配减少了在平凡追加时的内存分配次数（其中涉及用户态内核态的切换，性能消耗较高），优化了性能

## 解决了C字符串的问题

| 问题 | 解决 |
| --- | --- |
| 获取长度 | 使用`len`记录长度，实现\(O(1)\)获取长度 |
| 二进制安全 | 遍历方式从“遇到`\0`”改为了遍历`len`个字符 |
| 方便操作 | 支持动态扩容，减少内存分配次数 |

# IntSet

IntSet是Redis中set集合的一种实现方式，基于整数数组来实现，并且具备长度可变、有序等特征。

## 结构

```

typedef struct intset {
	uint32_t encoding;/*编码方式，支持存放16位、32位、64位整数*/
	uint32_t length;/*元素个数 */
	int8_t contents[];/* 整数数组，保存集合数据*/
} intset;

```

其中的encoding包含三种模式，表示存储的整数大小不同:

```

/* Note that these encodings are ordered, so:
*INTSET ENC INT16 < INTSET ENC INT32 < INTSET ENC INT64. */
#define INTSET_ENC_INT16(sizeof(int16_t))/* 2字节整数，范围类似iava的short*/
#define INTSET_ENC_INT32(sizeof(int32_t))/*4字节整数，范围类似java的int */
#define INTSET_ENC_INT64(sizeof(int64_t))/* 8字节整，范围类似java的long */

```

- 由于数据元素的大小取决于其编码方式，所以成员变量`content[]`相当于作为一个首元素的指针，后续遍历也跟编码方式匹配

- 虽然有的数据元素用不上那么大的存储空间，但是统一的编码方式，有利于寻址访问特定元素

### 示例

为了方便查找，Redis会将intset中所有的整数按照**升序**依次保存在contents数组中，结构如图：

![IntSet结构.png](/blog-assets/cnblogs-18863344/image-2.png)

如上例，每个数字都在`int16_t`的范围内，因此采用的编码方式是INTSET_ENC_INT16，每部分占用的字节大小为：

- encoding：4字节

- length：4字节

- contents：2字节*3=6字节

## IntSet升级

现在假设有一个intset，元素为`[5,10,20]`，采用的编码是`INTSET_ENC_INT16`，则每个整数占2字节：

![intset升级-1.png](/blog-assets/cnblogs-18863344/image-3.png)

向其中添加一个数字：50000，超过了`int16_t`的范围，intset会自动**升级**编码方式到合适的大小

以此例分析升级流程

1.

升级编码为`INTSET_ENC_INT32`，即每个整数占4字节，并按照新的编码方式及元素个数扩容数组

  - 此时所需空间：\(元素个数\times int大小=4\times4=16\)

  - ![intset升级-2.png](/blog-assets/cnblogs-18863344/image-4.png)

2.

**倒序**依次将数组中的元素拷贝到扩容后的正确位置

  -

扩容肯定“整体后移”，如果正序进行，前面的元素扩容后会覆盖掉后面的元素，所以倒叙进行

  -

![intset升级-3.png](/blog-assets/cnblogs-18863344/image-5.png)

  -

![intset升级-4.png](/blog-assets/cnblogs-18863344/image-6.png)

  -

![intset升级-5.png](/blog-assets/cnblogs-18863344/image-7.png)

3.

将待添加的元素放入数组末尾![intset升级-6.png](/blog-assets/cnblogs-18863344/image-8.png)

4.

最后，将intset的encoding属性改为`INTSET_ENC_INT32`，将length属性改为4![intset升级-7.png](/blog-assets/cnblogs-18863344/image-9.png)

### 部分源码

```

intset *intsetAdd(intset *is,int64_t value,uint8_t *success) {
	uint8_t valenc = _intsetValueEncoding(value);// 获取当前值编码
	uint32_t pos;// 要插入的位置
	if(success) *success=1;
	//判断编码是不是超过了当前intset的编码
	if(valenc >intrev32ifbe(is->encoding)) {
		//超出编码，需要升级
		return intsetUpgradeAndAdd(is,value);
	} else {
		// 在当前intset中查找值与value一样的元素的角标pos
		if(intsetSearch(is,value,&pos)) {
			if(success) *success =0;//如果找到了，则无需插入，直接结束并返回失败
			return is;
		//数组扩容
		is = intsetResize(is,intrev32ifbe(is->length)+1);
		//移动数组中pos之后的元素到pos+1，给新元素腾出空间
		if(pos <intrev32ifbe(is->length)) intsetMoveTail(is,pos,pos+1);
	}
	//插入新元素
	intsetSet(is,pos,value);
	//重置元素长度
	is->length = intrev32ifbe(intrev32ifbe(is->length)+1);
	return is;

```

```

static intset *intsetUpgradeAndAdd(intset *is, int64_t value) {
	// 获取当前intset编码
    uint8_t curenc = intrev32ifbe(is->encoding);
	// 获取新编码
    uint8_t newenc = _intsetValueEncoding(value);
	// 获取元素个数
    int length = intrev32ifbe(is->length);
	// 判断元素是大于还是小于0，大于0则最大，插入队尾，小于0则最小，插入队首
    int prepend = value < 0 ? 1 : 0;
	// 重置编码为新编码
    is->encoding = intrev32ifbe(newenc);
	// 重置数组大小
    is = intsetResize(is,intrev32ifbe(is->length)+1);

    /* Upgrade back-to-front so we don't overwrite values.
     * Note that the "prepend" variable is used to make sure we have an empty
     * space at either the beginning or the end of the intset. */
    while(length--)
	  _intsetSet(is,length+prepend,_intsetGetEncoded(is,length,curenc));

    /* Set the value at the beginning or the end. */
    if (prepend)
        _intsetSet(is,0,value);
    else
        _intsetSet(is,intrev32ifbe(is->length),value);
    //修改数组长度
    is->length = intrev32ifbe(intrev32ifbe(is->length)+1);
    return is;
}

```

## 总结

Intset可以看做是特殊的整数数组，具备一些特点：

1. Redis会确保Intset中的元素唯一、有序

2. 具备类型升级机制，可以节省内存空间

3. 底层采用二分查找方式来查询

# Dict

Redis是一个键值型(Key-Value Pair)的数据库，我们可以根据键实现快速的增删改查，而键与值的映射关系正是通过**Dict**来实现的

## 结构

Dict由三部分组成，分别是：哈希表（DictHashTable）、哈希节点（DictEntry）、字典（Dict）

```

typedef struct dictht {
	// entry数组
	// 数组中保存的是指向entry的指针
	dictEntry **table;
	// 哈希表大小(总是2的n次方)
	unsigned long size;
	// 哈希表大小的掩码，总等于size -1
	unsigned long sizemask;
	// entry个数
	unsigned long used;
} dictht;

```

```

typedef struct dictEntry {
	void *key;// 键
	union {
		void *val:
		uint64 t u64;
		int64_t s64;
		double d;
	} v;//值
	//下一个Entry的指针
	struct dictEntry *next;
} dictEntry;

```

- `*next`：哈希冲突时使用，拉链法

```

typedef struct dict {
	dictType *type;//dict类型，内置不同的hash函数
	void *privdata;//私有数据，在做特殊hash运算时用
	dictht ht[2];//一个Dict包含两个哈希表，其中一个是当前数据，另一个一般是空，rehash时使用
	long rehashidx; //rehash的进度，-1表示未进行
	int16 t pauserehash:// rehash是否暂停，1则暂停，0则继续
} dict;

```

![Dict结构示例.png](/blog-assets/cnblogs-18863344/image-10.png)

## 添加元素

当我们向Dict添加键值对时，Redis首先根据key计算出hash值(h)，然后利用h & sizemask（实际上等效于取余，位运算的性能好）来计算元素应该存储到数组中的哪个索引位置。

-

假设k1的哈希值h=1，则1&3=1，因此k1=v1要存储到数组角标1位置![dict添加元素-1.png](/blog-assets/cnblogs-18863344/image-11.png)

-

如果发生哈希冲突，采用头插法（便于操作，如果尾插则需遍历到结尾再插入）![dict新增元素-2.png](/blog-assets/cnblogs-18863344/image-12.png)

## Dict的扩容

Dict中的HashTable就是数组结合单向链表的实现，当集合中元素较多时，必然导致哈希冲突增多，链表过长，则查询效率会大大降低

Dict在每次新增键值对时都会检查**负载因子(LoadFactor=used/size)**，满足以下两种情况时会触发**哈希表扩容**:

- 哈希表的 LoadFactor>=1，并且服务器没有执行 BGSAVE 或者 BGREWRITEAOF 等后台进程;

  - 这些后台进程对CPU使用较多，且涉及IO操作，性能开销大

- 哈希表的 LoadFactor>5

  - 过大了，严重影响了性能，于是需要马上扩容

```

static int _dictExpandIfNeeded(dict *d)
{
    //如果正在rehash，则返回ok
    if (dictIsRehashing(d)) return DICT_OK;
    //如果哈希表为空，则初始化哈希表为默认大小:4
    if (d->ht[0].size == 0) return dictExpand(d, DICT_HT_INITIAL_SIZE);
    //当负载因子(used/size)达到1以上，并且当前没有进行bgrewrite等子进程操作
	//或者负载因子超过5，则进行 dictExpand ，也就是扩容
    if (d->ht[0].used >= d->ht[0].size &&
        (dict_can_resize ||
         d->ht[0].used/d->ht[0].size > dict_force_resize_ratio) &&
        dictTypeExpandAllowed(d))
    {
    	//扩容大小为used + 1，底层会对扩容大小做判断，实际上找的是第一个大于等于 used+1 的 2^n
        return dictExpand(d, d->ht[0].used + 1);
    }
    return DICT_OK;
}

```

## Dict的收缩

Dict除了扩容以外，每次删除元素时，也会对负载因子做检查，当LoadFactor<0.1时，会做哈希表收缩:

```

//t_hash.c # hashTypeDeleted()
...
if(dictDelete((dict*)o->ptr,field)==C_0K) {
	deleted-1:
	//制除成功后，检查是否需要重置Dict大小，如果需要则调用dictResize重置
	/* Always check if the dictionary needs a resize after a delete. */
	if(htNeedsResize(o->ptr)) dictResize(o->ptr);
}
...

```

```

//server.c 文件
int htNeedsResize(dict *dict){
	long long size, used;
	// 哈希表大小
	size = dictSlots(dict);
	//entry数量
	used = dictsize(dict);
	//size>4(哈希表初识大小)并且 负载因子低于0.1
	return(size>DICT HT INITIAL SIZE &&(used*10@/size < HASHTABLE_MIN_FILL));
}

```

```

int dictResize(dict *d) {
	unsigned long minimal;
	// 如果正在做bgsave或bgrewriteof或rehash，则返回错误
	if(!dict_can_resize||dictIsRehashing(d))
		return DICT_ERR;
	//获取used，也就是entry个数
	minimal = d->ht[0].used;
	//如果used小于4，则重置为4
	if(minimal < DICTHT_INITIAL_SIZE)
		minimal = DICT_HT_INITIAL_SIZE;
	//重置大小为minimal，其实是第一个大于等于minimal的2^n
	return dictExpand(d,minimal);
}

```

## Dict的rehash

### rehash

不管是扩容还是收缩，必定会创建新的哈希表，导致哈希表的size和sizemask变化，而key的查询与sizemask有关。

因此必须对哈希表中的每一个key重新计算索引，插入新的哈希表，这个过程称为**rehash**。

过程是这样的:

1. 计算新hash表的realeSize，值取决于当前要做的是扩容还是收缩:

  - 如果是扩容，则新size为第一个大于等于`dict.ht[0].used+1`的\(2^n\)

  - 如果是收缩，则新size为第一个大于等于`dict.ht[0].used`的\(2^n\)(不得小于4)

2. 按照新的realeSize申请内存空间，创建dictht，并赋值给`dict.ht[1]`

3. 设置dict.rehashidx=0，标示开始rehash

4. 将`dict.ht[0]`中的每一个dictEntry都rehash到`dict.ht[1]`

5. 将`dict.ht[1]`赋值给`dict.ht[0]`，给`dict.ht[1]`初始化为空哈希表，释放原来的`dict.ht[0]`的内存

---

下面看一个具体过程

1.

初始状态![Dict的rehash-1.png](/blog-assets/cnblogs-18863344/image-13.png)

2.

新增一个元素，现在需要扩容![Dict的rehash-2.png](/blog-assets/cnblogs-18863344/image-14.png)

3.

申请空间并分配给`ht[1]`，同时修改其头部信息，将`dict`的rehashidx置0![Dict的rehash-3.png](/blog-assets/cnblogs-18863344/image-15.png)

4.

将元素映射到`ht[1]`中![Dict的rehash-4.png](/blog-assets/cnblogs-18863344/image-16.png)

5.

然`ht[0]`指向`ht[1]`的dictEntry数组，`ht[1]`置空，修改头部信息及`dict`的`rehashidx`字段![Dict的rehash-5.png](/blog-assets/cnblogs-18863344/image-17.png)

### 渐进式

Dict的rehash并不是一次性完成的。试想一下，如果Dict中包含数百万的entry，要在一次rehash完成，极有可能导致主线程阻塞。

因此Dict的rehash是分多次、渐进式的完成，因此称为**渐进式rehash**。流程如下:

1. 计算新hash表的size，值取决于当前要做的是扩容还是收缩:

  - 如果是扩容，则新size为第一个大于等于`dict.ht[0].used+1`的2”

  - 如果是收缩，则新size为第一个大于等于`dict.ht[0].used`的2”(不得小于4)

2. 按照新的size申请内存空间，创建dictht，并赋值给`dict.ht[1]`

3. 设置`dict.rehashidx=0`，标示开始rehash

4. **每次执行新增、查询、修改、删除操作时，都检查一下dict.rehashidx是否大于-1，如果是则将`dict.ht[0].table[rehashidx]`的entry链表rehash到`dict.ht[1]`，并且将rehashidx++。直到`dict.ht[0]`的所有数据都rehash到`dict.ht[1]`**

5. 将`dict.ht[1]`赋值给`dict.ht[0]`，给`dict.ht[1]`初始化为空哈希表，释放原来的`dict.ht[0]`的内存

6. **将rehashidx赋值为-1，代表rehash结束**

7. **在rehash过程中，新增操作，则直接写入`ht[1]`，查询、修改和删除则会在`dict.ht[0]`和`dict.ht[1]`依次查找并执行。这样可以确保`ht[0]`的数据只减不增，随着rehash最终为空**

## 总结

**Dict的结构**:

- 类似java的HashTable，底层是数组加链表来解决哈希冲突

- Dict包含两个哈希表，`ht[0]`平常用，`ht[1]`用来rehash

**Dict的伸缩**:

- 当LoadFactor大于5或者LoadFactor大于1并且没有子进程任务时，Dict扩容

- 当LoadFactor小于0.1时，Dict收缩

- 扩容大小为第一个大于等于used+1的\(2^n\)

- 收缩大小为第一个大于等于used 的\(2^n\)

- Dict采用渐进式rehash，每次访问Dict时执行一次rehash

- rehash时`ht[0]`只减不增，新增操作只在`ht[1]`执行，其它操作在两个哈希表

# ZipList

ZipList是一种特殊的“双端链表”，由一系列特殊编码的**连续内存块**组成。可以在任意一端进行压入/弹出操作，并且该操作的时间复杂度为\(O(1)\)

## ZipList结构

![ZipList结构.png](/blog-assets/cnblogs-18863344/image-18.png)

| 属性 | 类型 | 长度 | 用途 |
| --- | --- | --- | --- |
| zlbytes | uint32_t | 4字节 | 记录整个压缩列表占用的内存字节数 |
| zltail | uint32_t | 4字节 | 记录压缩列表表尾节点距离压缩列表的起始地址有多少字节，通过这个偏移量，可以确定尾节点的地址 |
| zllen | uint16_t | 2字节 | 记录了压缩列表包含的节点数量。最大值为UINT16_MAX（65534），超过该值会记录为65535，但节点的真实数量需要遍历整个压缩列表才能计算得出 |
| entry | 列表节点 | 不定 | 压缩列表包含的各个节点，节点的长度由节点保存的内容决定 |
| zlend | uint8_t | 1字节 | 特殊值0xFF(\(255_{10}\))，用于标记压缩列表的末端 |

## ZipListEntry

ZipList中的Entry并不像普通链表那样记录前后节点的指针，因为记录两个指针要占用16个字节，浪费内存。而是采用了下面的结构:

![ZipListEntry.png](/blog-assets/cnblogs-18863344/image-19.png)

- previous entry length：前一节点的长度，占1个或5个字节。

  - 如果前一节点的长度小于254字节，则采用1个字节来保存这个长度值

  - 如果前一节点的长度大于254字节，则采用5个字节来保存这个长度值，第一个字节为0xfe，后四个字节才是真实长度数据

- encoding：编码属性，记录content的数据类型(字符串还是整数)以及长度，占用1个、2个或5个字节

- contents：负责保存节点的数据，可以是字符串或整数

注意：ZipList中所有存储长度的数值均采用小端字节序，即地位字节在前，高位字节在后。

例如：数值0x1234，采用小端字节序实际存储值为：0x3412

### Encoding编码

ZipListEntry中的encoding编码分为字符串和整数两种：

#### 字符串

字符串：如果encoding是以“00”、“01”或者“10”开头，则证明content是字符串

![ZipList-encoding字符串.png](/blog-assets/cnblogs-18863344/image-20.png)

例如：

一个ZipList保存字符串：“ab”、“bc”

![ZipList-存“ab”.png](/blog-assets/cnblogs-18863344/image-21.png)

![ZipList-存字符串示例.png](/blog-assets/cnblogs-18863344/image-22.png)

#### 整数

整数：如果encoding是以“11”开始，则证明content是整数，且encoding固定只占用1个字节

![ZipList-encoding整数.png](/blog-assets/cnblogs-18863344/image-23.png)

例如，一个ZipList保存两个整数值：“2”、“5”

![ZipList存“2”.png](/blog-assets/cnblogs-18863344/image-24.png)

![ZipList-存数字示例.png](/blog-assets/cnblogs-18863344/image-25.png)

## ZipList的连锁更新问题

ZipList的每个Entry都包含previous_entry_length来记录上一个节点的大小，长度是1个或5个字节：

- 如果前一节点的长度小于254字节，则采用1个字节来保存这个长度值

- 如果前一节点的长度大于等于254字节，则采用5个字节来保存这个长度值，第一个字节为0xfe，后四个字节才是真实长度数据

现在，假设我们有N个连续的、长度为250~253字节之间的entry，因此entry的previous_entry_length属性用1个字节即可表示。

1.

初始状态![ZipList连锁更新-1.png](/blog-assets/cnblogs-18863344/image-26.png)

2.

插入一条长度为254字节的数据![ZipList连锁更新-2.png](/blog-assets/cnblogs-18863344/image-27.png)

  - 新插入的元素导致后继节点的pre_entry_len存储变化，进而导致后继节点的长度变化，并引发了其后继多个节点的连锁反应

ZipList这种特殊情况下产生的连续多次空间扩展操作称之为**连锁更新（Cascade Update）**。新增、删除都可能导致连锁更新的发生。

## 总结

ZipList特性：

1. 压缩列表的可以看做一种连续内存空间的"双向链表"

2. 列表的节点之间不是通过指针连接，而是记录上一节点和本节点长度来寻址，内存占用较低

3. 如果列表数据过多，导致链表过长，可能影响查询性能

4. 增或删较大数据时有可能发生连续更新问题

# QuickList

问题1：ZipList虽然节省内存，但申请内存必须是连续空间，如果内存占用较多，申请内存效率很低。怎么办？

- 为了缓解这个问题，我们必须限制ZipList的长度和entry大小。

问题2：但是我们要存储大量数据，超出了ZipList最佳的上限该怎么办？

- 我们可以创建多个ZipList来分片存储数据。

问题3：数据拆分后比较分散，不方便管理和查找，这多个ZipList如何建立联系？

- Redis在3.2版本引入了新的数据结构**QuickList**，它是一个双端链表，只不过链表中的每个节点都是一个ZipList。

![QuickList结构.png](/blog-assets/cnblogs-18863344/image-28.png)

## 结构

以下是QuickList的和QuickListNode的结构源码：

```

typedef struct quicklist {
    // 头节点指针
    quicklistNode *head;
    // 尾节点指针
    quicklistNode *tail;
    // 所有ziplist的entry的数量
    unsigned long count;
    // ziplists总数量
    unsigned long len;
    // ziplist的entry上限，默认值 -2
    int fill : QL_FILL_BITS;
    // 首尾不压缩的节点数量
    unsigned int compress : QL_COMP_BITS;
    // 内存重分配时的书签数量及数组，一般用不到
    unsigned int bookmark_count: QL_BM_BITS;
    quicklistBookmark bookmarks[];
} quicklist;

```

```

typedef struct quicklistNode {
    // 前一个节点指针
    struct quicklistNode *prev;
    // 下一个节点指针
    struct quicklistNode *next;
    // 当前节点的ZipList指针
    unsigned char *zl;
    // 当前节点的ZipList的字节大小
    unsigned int sz;
    // 当前节点的ZipList的entry个数
    unsigned int count : 16;
    // 编码方式：1，ZipList; 2，lzf压缩模式
    unsigned int encoding : 2;
    // 数据容器类型（预留）：1，其它；2，ZipList
    unsigned int container : 2;
    // 是否被解压缩。1：则说明被解压了，将来要重新压缩
    unsigned int recompress : 1;
    unsigned int attempted_compress : 1; //测试用
    unsigned int extra : 10; /*预留字段*/
} quicklistNode;

```

![QuickList-内存图.png](/blog-assets/cnblogs-18863344/image-29.png)

## 配置

### ZipList的entry数量

为了避免QuickList中的每个ZipList中entry过多，Redis提供了一个配置项：list-max-ziplist-size来限制。

- 如果值为正，则代表ZipList的允许的entry个数的最大值

- 如果值为负，则代表ZipList的最大内存大小，分5种情况：

  1. -1：每个ZipList的内存占用不能超过4kb

  2. -2：每个ZipList的内存占用不能超过8kb

  3. -3：每个ZipList的内存占用不能超过16kb

  4. -4：每个ZipList的内存占用不能超过32kb

  5. -5：每个ZipList的内存占用不能超过64kb

其默认值为 -2：

![QuickList-设置ZipListEntry数量.png](/blog-assets/cnblogs-18863344/image-30.png)

除了控制ZipList的大小，QuickList还可以对节点的ZipList做压缩。通过配置项list-compress-depth来控制。因为链表一般都是从首尾访问较多，所以首尾是不压缩的。这个参数是控制首尾不压缩的节点个数：

- 0：特殊值，代表不压缩

- 1：标示QuickList的首尾各有1个节点不压缩，中间节点压缩

- 2：标示QuickList的首尾各有2个节点不压缩，中间节点压缩

- 以此类推

默认值：

![QuickList-设置对ZipList的压缩.png](/blog-assets/cnblogs-18863344/image-31.png)

## 总结

QuickList的特点：

- 是一个节点为ZipList的双端链表

- 节点采用ZipList，解决了传统链表的内存占用问题

- 控制了ZipList大小，解决连续内存空间申请效率问题

- 中间节点可以压缩，进一步节省了内存

# SkipList

**SkipList（跳表）** 首先是链表，但与传统链表相比有几点差异

- 元素按照升序排列存储

- 节点可能包含多个指针，指针跨度不同

## 结构

![SkipList结构.png](/blog-assets/cnblogs-18863344/image-32.png)

![SkipList内存图.png](/blog-assets/cnblogs-18863344/image-33.png)

```

// t_zset.c
typedef struct zskiplist {
    // 头尾节点指针
    struct zskiplistNode *header, *tail;
    // 节点数量
    unsigned long length;
    // 最大的索引层级，默认是1
    int level;
} zskiplist;

```

```

// t_zset.c
typedef struct zskiplistNode {
    sds ele; // 节点存储的值
    double score;// 节点分数，排序、查找用
    struct zskiplistNode *backward; // 前一个节点指针
    struct zskiplistLevel {
        struct zskiplistNode *forward; // 下一个节点指针
        unsigned long span; // 索引跨度
    } level[]; // 多级索引数组
} zskiplistNode;

```

## 总结

SkipList的特点：

- 跳跃表是一个双向链表，每个节点都包含score和ele值

- 节点按照score值排序，score值一样则按照ele字典排序

- 每个节点都可以包含多层指针，层数是1到32之间的随机数（有相关算法进行设计）

- 不同层指针到下一个节点的跨度不同，层级越高，跨度越大

- 增删改查效率与红黑树基本一致，实现却更简单

# RedisObject

Redis中的任意数据类型的键和值都会被封装成一个RedisObject，也叫做Redis对象，源码如下：

![RedisObject源码.png](/blog-assets/cnblogs-18863344/image-34.png)

redisObject头部就需要占16字节

注意：如果有大量String对象，每一个对象都有16字节的头部信息，就会造成很大的内存开销，所以存储大量数据时，建议不要用String类型，而用集合类型

## Redis的编码方式

Redis中会根据存储的数据类型不同，选择不同的编码方式，共包含11种不同类型：

| 编号 | 编码方式 | 说明 |
| --- | --- | --- |
| 0 | OBJ_ENCODING_RAW | raw编码动态字符串 |
| 1 | OBJ_ENCODING_INT | long类型的整数的字符串 |
| 2 | OBJ_ENCODING_HT | hash表（字典dict） |
| 3 | OBJ_ENCODING_ZIPMAP | 已废弃 |
| 4 | OBJ_ENCODING_LINKEDLIST | 双端链表 |
| 5 | OBJ_ENCODING_ZIPLIST | 压缩列表 |
| 6 | OBJ_ENCODING_INTSET | 整数集合 |
| 7 | OBJ_ENCODING_SKIPLIST | 跳表 |
| 8 | OBJ_ENCODING_EMBSTR | embstr的动态字符串 |
| 9 | OBJ_ENCODING_QUICKLIST | 快速列表 |
| 10 | OBJ_ENCODING_STREAM | Stream流 |

## 五种数据类型的编码方式

| 数据类型 | 编码方式 |
| --- | --- |
| OBJ_STRING | int、embstr、raw |
| OBJ_LIST | LinkedList和ZipList(3.2以前)、QuickList(3.2以后) |
| OBJ_SET | intset、HT |
| OBJ_ZSET | ZipList、HT、SkipList |
| OBJ_HASH | ZipList、HT |

# 五种数据结构

## String

String是Redis中最常见的数据存储类型：

-

其基本编码方式是**RAW**，基于简单动态字符串（SDS）实现，存储上限为512mb。![StringRAW编码.png](/blog-assets/cnblogs-18863344/image-35.png)

-

如果存储的SDS长度小于44字节，则会采用**EMBSTR**编码，此时object head与SDS是一段连续空间。申请内存时只需要调用一次内存分配函数，效率更高。![StringEMBSTR编码.png](/blog-assets/cnblogs-18863344/image-36.png)

-

如果存储的字符串是整数值，并且大小在LONG_MAX范围内，则会采用**INT**编码：直接将数据保存在RedisObject的ptr指针位置（刚好8字节），不再需要SDS了。![StringINT编码.png](/blog-assets/cnblogs-18863344/image-37.png)

### 为什么以44字节为界?

当44字节时，SDS结构如图

![SDS结构.png](/blog-assets/cnblogs-18863344/image-38.png)

头占3字节、尾占1个字节，内容占44字节

所以SDS共占48字节

加上RedisObject的16字节，整体共占64字节

而Redis的内存分配算法会以\(2^n\)进行分配，64恰好是一个分片大小，不会产生内存碎片

### 总结

- 使用字符串时，尽可能保证其大小不超过44字节

- 能使用整型保存就使用整型保存

## List

Redis的List支持从首位对元素进行操作，哪个数据结构比较合适呢

- LinkedList ：普通链表，可以从双端访问，内存占用较高，内存碎片较多

- ZipList ：压缩列表，可以从双端访问，内存占用低，存储上限低

- QuickList：LinkedList + ZipList，可以从双端访问，内存占用较低，包含多个ZipList，存储上限高

在3.2版本之前，Redis采用ZipList和LinkedList来实现List，当元素数量小于512并且元素大小小于64字节时采用ZipList编码，超过则采用LinkedList编码。

在3.2版本之后，Redis统一采用QuickList来实现List：

```

void pushGenericCommand(client *c, int where, int xx) {
    int j;
    // 尝试找到KEY对应的list
    robj *lobj = lookupKeyWrite(c->db, c->argv[1]);
    // 检查类型是否正确
    if (checkType(c,lobj,OBJ_LIST)) return;
    // 检查是否为空
    if (!lobj) {
        if (xx) {
            addReply(c, shared.czero);
            return;
        }
        // 为空，则创建新的QuickList
        lobj = createQuicklistObject();
        quicklistSetOptions(lobj->ptr, server.list_max_ziplist_size,
                            server.list_compress_depth);
        dbAdd(c->db,c->argv[1],lobj);
    }
    // 略 ...
}

```

```

robj *createQuicklistObject(void) {
    // 申请内存并初始化QuickList
    quicklist *l = quicklistCreate();
    // 创建RedisObject，type为OBJ_LIST
    // ptr指向 QuickList
    robj *o = createObject(OBJ_LIST,l);
    // 设置编码为 QuickList
    o->encoding = OBJ_ENCODING_QUICKLIST;
    return o;
}

```

### 内存结构

![List-内存图.png](/blog-assets/cnblogs-18863344/image-39.png)

## Set

Set是Redis中的单列集合，满足下列特点：

- 不保证有序性

- 保证元素唯一（可以判断元素是否存在）

- 求交集、并集、差集

可以看出，Set对查询元素的效率要求非常高，思考一下，什么样的数据结构可以满足？

- HashTable，也就是Redis中的Dict，不过Dict是双列集合（可以存键、值对）

Set是Redis中的集合，不一定确保元素有序，可以满足元素唯一、查询效率要求极高。

- 为了查询效率和唯一性，set采用HT编码（Dict）。Dict中的key用来存储元素，value统一为null。

- 当存储的所有数据都是整数，并且元素数量不超过set-max-intset-entries时，Set会采用IntSet编码，以节省内存

  - 二分查找保证了查询以及判断是否存在的效率

### 创建

```

robj *setTypeCreate(sds value) {
    // 判断value是否是数值类型 long long
    if (isSdsRepresentableAsLongLong(value,NULL) == C_OK)
        // 如果是数值类型，则采用IntSet编码
        return createIntsetObject();
    // 否则采用默认编码，也就是HT
    return createSetObject();
}

```

```

robj *createIntsetObject(void) {
    // 初始化INTSET并申请内存空间
    intset *is = intsetNew();
    // 创建RedisObject
    robj *o = createObject(OBJ_SET,is);
    // 指定编码为INTSET
    o->encoding = OBJ_ENCODING_INTSET;
    return o;
}

```

```

robj *createSetObject(void) {
    // 初始化Dict类型，并申请内存
    dict *d = dictCreate(&setDictType,NULL);
    // 创建RedisObject
    robj *o = createObject(OBJ_SET,d);
    // 设置encoding为HT
    o->encoding = OBJ_ENCODING_HT;
    return o;
}

```

### 类型转换

```

int setTypeAdd(robj *subject, sds value) {
    long long llval;
    if (subject->encoding == OBJ_ENCODING_HT) {
        dict *ht = subject->ptr;
        dictEntry *de = dictAddRaw(ht,value,NULL);
        if (de) {
            dictSetKey(ht,de,sdsdup(value));
            dictSetVal(ht,de,NULL);
            return 1;
        }
    } else if (subject->encoding == OBJ_ENCODING_INTSET) {
        if (isSdsRepresentableAsLongLong(value,&llval) == C_OK) {
            uint8_t success = 0;
            subject->ptr = intsetAdd(subject->ptr,llval,&success);
            if (success) {
                /* Convert to regular set when the intset contains
                 * too many entries. */
                size_t max_entries = server.set_max_intset_entries;
                /* limit to 1G entries due to intset internals. */
                if (max_entries >= 1<<30) max_entries = 1<<30;
                if (intsetLen(subject->ptr) > max_entries)
                    setTypeConvert(subject,OBJ_ENCODING_HT);
                return 1;
            }
        } else {
            /* Failed to get integer from object, convert to regular set. */
            setTypeConvert(subject,OBJ_ENCODING_HT);

            /* The set *was* an intset and this value is not integer
             * encodable, so dictAdd should always work. */
            serverAssert(dictAdd(subject->ptr,sdsdup(value),NULL) == DICT_OK);
            return 1;
        }
    } else {
        serverPanic("Unknown set encoding");
    }
    return 0;
}

```

两种发生类型转换的情况

- 原本是intset实现，但是添加了不是int类型的元素

- 元素都是int，但是元素个数超出了server.set_max_intset_entries的值时

  - server.set_max_intset_entries默认值为512，可进行设置，一般不建议设置过大，否则会影响查询效率

### 内存及类型转换图

![Set-Intset编码内存图.png](/blog-assets/cnblogs-18863344/image-40.png)

![Set-编码转换.png](/blog-assets/cnblogs-18863344/image-41.png)

![Set-Dict编码内存图.png](/blog-assets/cnblogs-18863344/image-42.png)

## Zset

ZSet也就是SortedSet，其中每一个元素都需要指定一个score值和member值：

- 可以根据score值排序后

- member必须唯一

- 可以根据member查询分数

因此，zset底层数据结构必须满足**键值存储**、**键必须唯一**、**可排序**这几个需求。之前学习的哪种编码结构可以满足？

- SkipList：

  - 优点：可以排序，并且可以同时存储score和ele值（member）

  - 缺点：键值唯一较难处理；根据member查score需要遍历整个链表

- HT（Dict）：

  - 优点：可以键值存储，并且可以根据key找value

  - 缺点：不能做排序

### 结构

Zset：“小孩子才做选择，我全都要！”

Zset结构

```

// zset结构
typedef struct zset {
    // Dict指针
    dict *dict;
    // SkipList指针
    zskiplist *zsl;
} zset;

```

创建Zset

```

robj *createZsetObject(void) {
    zset *zs = zmalloc(sizeof(*zs));
    robj *o;
    // 创建Dict
    zs->dict = dictCreate(&zsetDictType,NULL);
    // 创建SkipList
    zs->zsl = zslCreate();
    o = createObject(OBJ_ZSET,zs);
    o->encoding = OBJ_ENCODING_SKIPLIST;
    return o;
}

```

### 内存图

![Zset-内存图.png](/blog-assets/cnblogs-18863344/image-43.png)

由图可以直观看出，内存占用太高

- 数据重复存储、存在大量指针……

### 另一种实现

当元素数量不多时，HT和SkipList的优势不明显，而且更耗内存。因此zset还会采用ZipList结构来节省内存，不过需要同时满足两个条件：

1. 元素数量小于zset_max_ziplist_entries，默认值128

2. 每个元素都小于zset_max_ziplist_value字节，默认值64

```

// zadd添加元素时，先根据key找到zset，不存在则创建新的zset
zobj = lookupKeyWrite(c->db,key);
if (checkType(c,zobj,OBJ_ZSET)) goto cleanup;
// 判断是否存在
if (zobj == NULL) { // zset不存在
    if (server.zset_max_ziplist_entries == 0 ||
        server.zset_max_ziplist_value < sdslen(c->argv[scoreidx+1]->ptr))
    { // zset_max_ziplist_entries设置为0就是禁用了ZipList，
        // 或者value大小超过了zset_max_ziplist_value，采用HT + SkipList
        zobj = createZsetObject();
    } else { // 否则，采用 ZipList
        zobj = createZsetZiplistObject();
    }
    dbAdd(c->db,key,zobj);
}
// ....
zsetAdd(zobj, score, ele, flags, &retflags, &newscore);

```

```

robj *createZsetObject(void) {
    // 申请内存
    zset *zs = zmalloc(sizeof(*zs));
    robj *o;
    // 创建Dict
    zs->dict = dictCreate(&zsetDictType,NULL);
    // 创建SkipList
    zs->zsl = zslCreate();
    o = createObject(OBJ_ZSET,zs);
    o->encoding = OBJ_ENCODING_SKIPLIST;
    return o;
}

```

```

robj *createZsetZiplistObject(void) {
    // 创建ZipList
    unsigned char *zl = ziplistNew();
    robj *o = createObject(OBJ_ZSET,zl);
    o->encoding = OBJ_ENCODING_ZIPLIST;
    return o;
}

```

### 编码转换

```

int zsetAdd(robj *zobj, double score, sds ele, int in_flags, int *out_flags, double *newscore) {
    /* 判断编码方式*/
    if (zobj->encoding == OBJ_ENCODING_ZIPLIST) {// 是ZipList编码
        unsigned char *eptr;
        // 判断当前元素是否已经存在，已经存在则更新score即可        if ((eptr = zzlFind(zobj->ptr,ele,&curscore)) != NULL) {
            //...略
            return 1;
        } else if (!xx) {
            // 元素不存在，需要新增，则判断ziplist长度有没有超、元素的大小有没有超
            if (zzlLength(zobj->ptr)+1 > server.zset_max_ziplist_entries
 		|| sdslen(ele) > server.zset_max_ziplist_value
 		|| !ziplistSafeToAdd(zobj->ptr, sdslen(ele)))
            { // 如果超出，则需要转为SkipList编码
                zsetConvert(zobj,OBJ_ENCODING_SKIPLIST);
            } else {
                zobj->ptr = zzlInsert(zobj->ptr,ele,score);
                if (newscore) *newscore = score;
                *out_flags |= ZADD_OUT_ADDED;
                return 1;
            }
        } else {
            *out_flags |= ZADD_OUT_NOP;
            return 1;
        }
    }    // 本身就是SKIPLIST编码，无需转换
    if (zobj->encoding == OBJ_ENCODING_SKIPLIST) {
       // ...略
    } else {
        serverPanic("Unknown sorted set encoding");
    }
    return 0; /* Never reached. */
}

```

注意到转换条件：

1. 压缩列表中的元素数量加 1 后超过了配置项 `zset_max_ziplist_entries` 的值时

2. 当要插入的元素（`ele`）的长度超过了配置项 `zset_max_ziplist_value` 的值时

3. `ziplistSafeToAdd` 函数用于检查是否有足够的内存空间来将新元素添加到压缩列表中。若该函数返回 `false`，也就是没有足够的内存空间，就会触发转换。（ZipList需要的是连续的内存空间）

### ZipList如何满足Zset需求

Ziplist本身没有排序功能，而且没有键值对的概念，因此需要有zset通过编码实现：

- ZipList是连续内存，因此score和element是紧挨在一起的两个entry， element在前，score在后

- score越小越接近队首，score越大越接近队尾，按照score值升序排列

![Zset-ZipList内存图.png](/blog-assets/cnblogs-18863344/image-44.png)

## Hash

Hash结构与Redis中的Zset非常类似：

- 都是键值存储

- 都需求根据键获取值

- 键必须唯一

区别如下：

- zset的键是member，值是score；hash的键和值都是任意值

- zset要根据score排序；hash则无需排序

### 结构

因此，Hash底层采用的编码与Zset也基本一致，只需要把排序有关的SkipList去掉即可

- Hash结构默认采用ZipList编码，用以节省内存。 ZipList中相邻的两个entry 分别保存field和value

- 当数据量较大时，Hash结构会转为HT编码，也就是Dict，触发条件有两个：

  1. ZipList中的元素数量超过了hash-max-ziplist-entries（默认512）

  2. ZipList中的任意entry大小超过了hash-max-ziplist-value（默认64字节）

ZipList形式内存图：

![HashZipList内存图.png](/blog-assets/cnblogs-18863344/image-45.png)

Dict形式内存图：

![HashDict形式内存图.png](/blog-assets/cnblogs-18863344/image-46.png)

### 源码

当你执行一条`hset`命令时……

```

void hsetCommand(client *c) {// hset user1 name Jack age 21
    int i, created = 0;
    robj *o; // 略 ...
     // 判断hash的key是否存在，不存在则创建一个新的，默认采用ZipList编码
    if ((o = hashTypeLookupWriteOrCreate(c,c->argv[1])) == NULL) return;
    // 判断是否需要把ZipList转为Dict
    hashTypeTryConversion(o,c->argv,2,c->argc-1);
    // 循环遍历每一对field和value，并执行hset命令
    for (i = 2; i < c->argc; i += 2)
        created += !hashTypeSet(o,c->argv[i]->ptr,c->argv[i+1]->ptr,HASH_SET_COPY);    // 略 ...
}

```

判断是需要写入还是需要创建hash

```

robj *hashTypeLookupWriteOrCreate(client *c, robj *key) {
    // 查找key
    robj *o = lookupKeyWrite(c->db,key);
    if (checkType(c,o,OBJ_HASH)) return NULL;
    // 不存在，则创建新的
    if (o == NULL) {
        o = createHashObject();
        dbAdd(c->db,key,o);
    }
    return o;
}

```

创建hash

```

robj *createHashObject(void) {
    // 默认采用ZipList编码，申请ZipList内存空间
    unsigned char *zl = ziplistNew();
    robj *o = createObject(OBJ_HASH, zl);
    // 设置编码
    o->encoding = OBJ_ENCODING_ZIPLIST;
    return o;
}

```

判断hash是否需要进行编码转换

`hashTypeTryConversion(o,c->argv,2,c->argc-1);`

- 以`hset user1 name Jack age 21`为例，下标为2的参数开始才是存的数据，需要被判断

```

void hashTypeTryConversion(robj *o, robj **argv, int start, int end) {
    int i;
    size_t sum = 0;
    // 本来就不是ZipList编码，什么都不用做了
    if (o->encoding != OBJ_ENCODING_ZIPLIST) return;
    // 依次遍历命令中的field、value参数
    for (i = start; i <= end; i++) {
        if (!sdsEncodedObject(argv[i]))
            continue;
        size_t len = sdslen(argv[i]->ptr);
        // 如果field或value超过hash_max_ziplist_value，则转为HT
        if (len > server.hash_max_ziplist_value) {
            hashTypeConvert(o, OBJ_ENCODING_HT);
            return;
        }
        sum += len;
    }// ziplist大小超过1G，也转为HT
    if (!ziplistSafeToAdd(o->ptr, sum))
        hashTypeConvert(o, OBJ_ENCODING_HT);
}

```

执行set过程

```

int hashTypeSet(robj *o, sds field, sds value, int flags) {
    int update = 0;
    // 判断是否为ZipList编码
    if (o->encoding == OBJ_ENCODING_ZIPLIST) {
        unsigned char *zl, *fptr, *vptr;
        zl = o->ptr;
        // 查询head指针
        fptr = ziplistIndex(zl, ZIPLIST_HEAD);
        if (fptr != NULL) { // head不为空，说明ZipList不为空，开始查找key
            fptr = ziplistFind(zl, fptr, (unsigned char*)field, sdslen(field), 1);
            if (fptr != NULL) {// 判断是否存在，如果已经存在则更新
                update = 1;
                zl = ziplistReplace(zl, vptr, (unsigned char*)value,
                        sdslen(value));
            }
        }
        // 不存在，则直接push
        if (!update) { // 依次push新的field和value到ZipList的尾部
            zl = ziplistPush(zl, (unsigned char*)field, sdslen(field),
                    ZIPLIST_TAIL);
            zl = ziplistPush(zl, (unsigned char*)value, sdslen(value),
                    ZIPLIST_TAIL);
        }
        o->ptr = zl;
        /* 插入了新元素，检查list长度是否超出，超出则转为HT */
        if (hashTypeLength(o) > server.hash_max_ziplist_entries)
            hashTypeConvert(o, OBJ_ENCODING_HT);
    } else if (o->encoding == OBJ_ENCODING_HT) {
        // HT编码，直接插入或覆盖
    } else {
        serverPanic("Unknown hash encoding");
    }
    return update;
}

```
