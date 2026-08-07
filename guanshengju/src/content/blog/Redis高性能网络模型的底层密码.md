---
title: "Redis高性能网络模型的底层密码"
date: 2025-05-07
summary: "本文从Linux内核的用户空间/内核空间交互机制出发，深入解析IO模型的演进历程（阻塞IO→非阻塞IO→IO多路复用→信号驱动IO→异步IO），重点对比select/poll/epoll的实现差异与性能瓶颈，并延伸至Redis网络架构的设计哲学。"
tags:
  - "Redis"
source: "https://www.cnblogs.com/vksfeng/p/18865330"
---
# 用户空间和内核空间

## 简单的层级空间

应用程序需要通过Linux内核与硬件交互

![层级关系.png](/blog-assets/cnblogs-18865330/image-1.png)

## 用户、内核空间

为了避免用户应用导致冲突甚至内核崩溃，用户应用与内核是分离的：

- 进程的寻址空间会划分为两部分：**内核空间**、**用户空间**![用户空间内核空间.png](/blog-assets/cnblogs-18865330/image-2.png)

- **用户空间**：只能执行受限的命令（Ring3），而且不能直接调用系统资源，必须通过内核提供的接口来访问

- **内核空间**：可以执行特权命令（Ring0），调用一切系统资源

## IO流程

Linux系统为了提高IO效率，会在用户空间和内核空间都加入缓冲区：

- 写数据时，要把用户缓冲数据拷贝到内核缓冲区，然后写入设备

- 读数据时，要从设备读取数据到内核缓冲区，然后拷贝到用户缓冲区

![IO流程.png](/blog-assets/cnblogs-18865330/image-3.png)

# IO模型

![IO模型-IO流程.png](/blog-assets/cnblogs-18865330/image-4.png)

不同的IO模型就是在1、2两步骤不同

在《UNIX网络编程》一书中，总结归纳了5种IO模型：

- 阻塞IO（Blocking IO）

- 非阻塞IO（Nonblocking IO）

- IO多路复用（IO Multiplexing）

- 信号驱动IO（Signal Driven IO）

- 异步IO（Asynchronous IO）

# 阻塞IO

顾名思义，阻塞IO就是两个阶段都必须阻塞等待：

![阻塞IO.png](/blog-assets/cnblogs-18865330/image-5.png)

阶段一：

1. 用户进程尝试读取数据（比如网卡数据）

2. 此时数据尚未到达，内核需要等待数据

3. 此时用户进程也处于阻塞状态

阶段二：

1. 数据到达并拷贝到内核缓冲区，代表已就绪

2. 将内核数据拷贝到用户缓冲区

3. 拷贝过程中，用户进程依然阻塞等待

4. 拷贝完成，用户进程解除阻塞，处理数据

可以看到，阻塞IO模型中，用户进程在两个阶段都是阻塞状态。

# 非阻塞IO

顾名思义，非阻塞IO的recvfrom操作会立即返回结果而不是阻塞用户进程。

![非阻塞IO.png](/blog-assets/cnblogs-18865330/image-6.png)

阶段一：

1. 用户进程尝试读取数据（比如网卡数据）

2. 此时数据尚未到达，内核需要等待数据

3. 返回异常给用户进程

4. 用户进程拿到error后，再次尝试读取

5. 循环往复，直到数据就绪

阶段二：

1. 将内核数据拷贝到用户缓冲区

2. 拷贝过程中，用户进程依然阻塞等待

3. 拷贝完成，用户进程解除阻塞，处理数据

可以看到，非阻塞IO模型中，用户进程在第一个阶段是非阻塞，第二个阶段是阻塞状态。虽然是非阻塞，但性能并没有得到提高。而且忙等机制会导致CPU空转，CPU使用率暴增。

# IO多路复用

## 阻塞、非阻塞IO的不足

无论是阻塞IO还是非阻塞IO，用户应用在一阶段都需要调用recvfrom来获取数据，差别在于无数据时的处理方案：

- 如果调用recvfrom时，恰好没有数据，阻塞IO会使CPU阻塞，非阻塞IO使CPU空转，都不能充分发挥CPU的作用。

- 如果调用recvfrom时，恰好有数据，则用户进程可以直接进入第二阶段，读取并处理数据

而在单线程情况下，只能依次处理IO事件，如果正在处理的IO事件恰好未就绪（数据不可读或不可写），线程就会被阻塞，所有IO事件都必须等待，性能自然会很差。

## 餐厅类比->提升性能的方法

就比如服务员给顾客点餐，分两步：

1. 顾客思考要吃什么（等待数据就绪）

2. 顾客想好了，开始点餐（读取数据）

![IO多路复用-餐厅类比.png](/blog-assets/cnblogs-18865330/image-7.png)

提高效率的方法：

1. 增加更多服务员（多线程）

  - 在IO方面提升了性能，但是引入了上下文切换的性能开销

2. 不排队，谁想好了吃什么（数据就绪了），服务员就给谁点餐（用户应用就去读取数据）

  - 用户进程如何知道内核中数据是否就绪呢？

## 文件描述符

**文件描述符（File Descriptor）**：简称FD，是一个从0 开始的无符号整数，用来关联Linux中的一个文件。在Linux中，一切皆文件，例如常规文件、视频、硬件设备等，当然也包括网络套接字（Socket）。

## IO多路复用

**IO多路复用**：是利用单个线程来同时监听多个FD，并在某个FD可读、可写时得到通知，从而避免无效的等待，充分利用CPU资源。

![IO多路复用.png](/blog-assets/cnblogs-18865330/image-8.png)

阶段一：

1. 用户进程调用select，指定要监听的FD集合

2. 内核监听FD对应的多个socket

3. 任意一个或多个socket数据就绪则返回readable

4. 此过程中用户进程阻塞

阶段二：

1. 用户进程找到就绪的socket

2. 依次调用recvfrom读取数据

3. 内核将数据拷贝到用户空间

4. 用户进程处理数据

- 用户应用将想要监听的FD交给内核，内核在其中有就绪的情况下会返回通知应用

- 当多个FD中没有任何一个就绪，应用就必须等待

- 因为可能有多个FD就绪，需要循环读

### 监听、通知方式

**IO多路复用**是利用单个线程来同时监听多个FD，并在某个FD可读、可写时得到通知，从而避免无效的等待，充分利用CPU资源。不过监听FD的方式、通知的方式又有多种实现，常见的有：

- select

- poll

- epoll

差异：

- select和poll只会通知用户进程有FD就绪，但不确定具体是哪个FD，需要用户进程逐个遍历FD来确认

- epoll则会在通知用户进程FD就绪的同时，把已就绪的FD写入用户空间

## select

select是Linux中最早的I/O多路复用实现方案

```

// 定义类型别名 __fd_mask，本质是 long int
typedef long int __fd_mask;

/* fd_set 记录要监听的fd集合，及其对应状态 */
typedef struct {
    // fds_bits是long类型数组，长度为 1024/32 = 32
    // 共1024个bit位，每个bit位代表一个fd，0代表未就绪，1代表就绪
    __fd_mask fds_bits[__FD_SETSIZE / __NFDBITS];
    // ...
} fd_set;

// select函数，用于监听fd_set，也就是多个fd的集合
int select(
    int nfds, // 要监视的fd_set的最大fd + 1
    fd_set *readfds, // 要监听读事件的fd集合
    fd_set *writefds,// 要监听写事件的fd集合
    fd_set *exceptfds, // // 要监听异常事件的fd集合
    // 超时时间，null-用不超时；0-不阻塞等待；大于0-固定等待时间
    struct timeval *timeout
);

```

### 流程

![select-1.png](/blog-assets/cnblogs-18865330/image-9.png)

-

用户空间：创建`fd_set`，初始值均为0，监听的fd对应的位改成1，执行`select`函数将`fd_set`传递给内核空间

-

内核空间：遍历检查是否就绪，没有就绪就休眠，等待有就绪则被唤醒，或者休眠超时

![select-2.png](/blog-assets/cnblogs-18865330/image-10.png)

-

内核空间：当有数据就绪时，以`fd=1`就绪为例，内核会对`fd_set`进行修改，就绪的保留为1，没就绪的改为0，之后返回就绪的fd个数，同时将`fd_set`拷贝至用户空间。

-

用户空间：对`fd_set`进行遍历，找到就绪的fd并读取

### 存在的问题

select模式存在的问题：

- 需要将整个fd_set从用户空间拷贝到内核空间，select结束还要再次拷贝回用户空间

- select无法得知具体是哪个fd就绪，需要遍历整个fd_set

- fd_set监听的fd数量不能超过1024

## poll

poll模式对select模式做了简单改进，但性能提升不明显，部分关键代码如下：

```

// pollfd 中的事件类型
#define POLLIN     //可读事件
#define POLLOUT    //可写事件
#define POLLERR    //错误事件
#define POLLNVAL   //fd未打开

// pollfd结构
struct pollfd {
    int fd;     	  /* 要监听的fd  */
    short int events; /* 要监听的事件类型：读、写、异常 */
    short int revents;/* 实际发生的事件类型 */
};
// poll函数
int poll(
    struct pollfd *fds, // pollfd数组，可以自定义大小
    nfds_t nfds, // 数组元素个数
    int timeout // 超时时间
);

```

IO流程：

1. 创建pollfd数组，向其中添加关注的fd信息，数组大小自定义

2. 调用poll函数，将pollfd数组拷贝到内核空间，转链表存储，无上限

3. 内核遍历fd，判断是否就绪

4. 数据就绪或超时后，拷贝pollfd数组到用户空间，返回就绪fd数量n

5. 用户进程判断n是否大于0

6. 大于0则遍历pollfd数组，找到就绪的fd

### 与select对比：

- select模式中的fd_set大小固定为1024，而pollfd在内核中采用链表，理论上无上限

- 监听FD越多，每次遍历消耗时间也越久，性能反而会下降

仍然存在的问题：

- 需要将整个fd_set从用户空间拷贝到内核空间，select结束还要再次拷贝回用户空间

- poll无法得知具体是哪个fd就绪，需要遍历整个fd_set

## epoll

epoll模式是对select和poll的改进，它提供了三个函数：

```

struct eventpoll {
    //...
    struct rb_root  rbr; // 一颗红黑树，记录要监听的FD
    struct list_head rdlist;// 一个链表，记录就绪的FD
    //...
};

// 1.创建一个epoll实例,内部是event poll，返回对应的句柄epfd
int epoll_create(int size);

// 2.将一个FD添加到epoll的红黑树中，并设置ep_poll_callback
// callback触发时，就把对应的FD加入到rdlist这个就绪列表中
int epoll_ctl(
    int epfd,  // epoll实例的句柄
    int op,    // 要执行的操作，包括：ADD、MOD、DEL
    int fd,    // 要监听的FD
    struct epoll_event *event // 要监听的事件类型：读、写、异常等
);

// 3.检查rdlist列表是否为空，不为空则返回就绪的FD的数量
int epoll_wait(
    int epfd,                   // epoll实例的句柄
    struct epoll_event *events, // 空event数组，用于接收就绪的FD
    int maxevents,              // events数组的最大长度
    int timeout   // 超时时间，-1用不超时；0不阻塞；大于0为阻塞时间
);

```

![epoll内存图.png](/blog-assets/cnblogs-18865330/image-11.png)

### 对比总结

select模式存在的三个问题：

- 能监听的FD最大不超过1024

- 每次select都需要把所有要监听的FD都拷贝到内核空间

- 每次都要遍历所有FD来判断就绪状态

poll模式的问题：

- poll利用链表解决了select中监听FD上限的问题，但依然要遍历所有FD，如果监听较多，性能会下降

epoll模式中如何解决这些问题的？

- 基于epoll实例中的红黑树保存要监听的FD，理论上无上限，而且增删改查效率都非常高

- 每个FD只需要执行一次epoll_ctl添加到红黑树，以后每次epol_wait无需传递任何参数，无需重复拷贝FD到内核空间

- 利用ep_poll_callback机制来监听FD状态，无需遍历所有FD，因此性能不会随监听的FD数量增多而下降

## 事件通知机制

当FD有数据可读时，我们调用epoll_wait（或者select、poll）可以得到通知。但是事件通知的模式有两种：

- LevelTriggered：简称LT，也叫做水平触发。只要某个FD中有数据可读，每次调用epoll_wait都会得到通知。

- EdgeTriggered：简称ET，也叫做边沿触发。只有在某个FD有状态变化时，调用epoll_wait才会被通知。

举个栗子：

1. 假设一个客户端socket对应的FD已经注册到了epoll实例中

2. 客户端socket发送了2kb的数据

3. 服务端调用epoll_wait，得到通知说FD就绪

4. 服务端从FD读取了1kb数据

5. 回到步骤3（再次调用epoll_wait，形成循环）

结果：

- 如果我们采用LT模式，因为FD中仍有1kb数据，则第5步依然会返回结果，并且得到通知

  - LT下内核会自动填回就绪队列

- 如果我们采用ET模式，因为第3步已经消费了FD可读事件，第5步FD状态没有变化，因此epoll_wait不会返回，数据无法读取，客户端响应超时。

  - ET下，内核不会将fd重新添加回就绪队列，需要我们自己实现重新添加（`epoll_ctl`修改状态从而实现状态变化，`eventpoll`去检查是否真的有数据，有就会被加回去），如果多次没读完就需要重复添加多次

  - 或者我们在第4步通过循环读完整个数据。但是注意不能用阻塞IO的方式，这种状况下读完数据会一直等待。应采用非阻塞，读完时返回特定表示，避免循环导致阻塞。

### 结论

LT：事件通知频率较高，会有重复通知，影响性能；惊群问题

- 惊群问题(Thundering Herd Problem)：是指当多个进程/线程等待同一个事件时，该事件发生时所有等待者都被唤醒，但最终只有一个能处理该事件，其他进程/线程又重新进入等待状态，造成资源浪费。

ET：仅通知一次，效率高。可以基于非阻塞IO循环读取解决数据读取不完整问题

select和poll仅支持LT模式，epoll可以自由选择LT和ET两种模式

## web服务流程

基于epoll模式的web服务的基本流程如图：

![web服务流程.png](/blog-assets/cnblogs-18865330/image-12.png)

# 信号驱动IO

信号驱动IO是与内核建立SIGIO的信号关联并设置回调，当内核有FD就绪时，会发出SIGIO信号通知用户，期间用户应用可以执行其它业务，无需阻塞等待。

![信号驱动IO.png](/blog-assets/cnblogs-18865330/image-13.png)

阶段一：

1. 用户进程调用sigaction，注册信号处理函数

2. 内核返回成功，开始监听FD

3. 用户进程不阻塞等待，可以执行其它业务

4. 当内核数据就绪后，回调用户进程的SIGIO处理函数

阶段二：

1. 收到SIGIO回调信号

2. 调用recvfrom，读取

3. 内核将数据拷贝到用户空间

4. 用户进程处理数据

当有大量IO操作时，信号较多，SIGIO处理函数不能及时处理可能导致信号队列溢出，而且内核空间与用户空间的频繁信号交互性能也较低。

# 异步IO

异步IO的整个过程都是非阻塞的，用户进程调用完异步API后就可以去做其它事情，内核等待数据就绪并拷贝到用户空间后才会递交信号，通知用户进程。

![异步IO.png](/blog-assets/cnblogs-18865330/image-14.png)

阶段一：

1. 用户进程调用aio_read，创建信号回调函数

2. 内核等待数据就绪

3. 用户进程无需阻塞，可以做任何事情

阶段二：

1. 内核数据就绪

2. 内核数据拷贝到用户缓冲区

3. 拷贝完成，内核递交信号触发aio_read中的回调函数

4. 用户进程处理数据

可以看到，异步IO模型中，用户进程在两个阶段都是非阻塞状态。

## 同步和异步

IO操作是同步还是异步，关键看数据在内核空间与用户空间的拷贝过程（数据读写的IO操作），也就是阶段二是同步还是异步：

![五个IO模型的比较.png](/blog-assets/cnblogs-18865330/image-15.png)

# Redis网络模型

## 单线程？多线程？

Redis到底是单线程还是多线程？

- 如果仅仅是Redis的核心业务部分（命令处理），是单线程

- 如果是整个Redis，那么是多线程

Redis版本迭代过程中，在两个重要的时间节点上引入了多线程的支持

- Redis v4.0：引入多线程异步处理一些耗时较旧的任务，例如异步删除命令unlink

- Redis v6.0：在核心网络模型中引入多线程，进一步提高对于多核CPU的利用率

为什么Redis要选择单线程？

- 抛开持久化不谈，Redis是纯内存操作，执行速度非常快，它的性能瓶颈是网络延迟而不是执行速度，因此多线程并不会带来巨大的性能提升。

- 多线程会导致过多的上下文切换，带来不必要的开销

- 引入多线程会面临线程安全问题，必然要引入线程锁这样的安全手段，实现复杂度增高，而且性能也会大打折扣

## 网络模型

### IO多路复用实现选择

Redis通过IO多路复用来提高网络性能，并且支持各种不同的多路复用实现，并且将这些实现进行封装， 提供了统一的高性能事件库API库 AE：

选择不同的实现方案

```

/* ae.c */
/* Include the best multiplexing layer supported by this system.
 * The following should be ordered by performances, descending. */
#ifdef HAVE_EVPORT
#include "ae_evport.c"
#else
    #ifdef HAVE_EPOLL
    #include "ae_epoll.c"
    #else
        #ifdef HAVE_KQUEUE
        #include "ae_kqueue.c"
        #else
        #include "ae_select.c"
        #endif
    #endif
#endif

```

![IO多路复用实现方案.png](/blog-assets/cnblogs-18865330/image-16.png)

#### 核心源码

![单线程网络模型核心代码.png](/blog-assets/cnblogs-18865330/image-17.png)

```

int main(
    int argc,
    char **argv
) {
    // ...
    // 初始化服务
    initServer();
    // ...
    // 开始监听事件循环
    aeMain(server.el);
    // ...
}

```

```

void initServer(void) {
    // ...
    // 内部会调用 aeApiCreate(eventLoop)，类似epoll_create
    server.el = aeCreateEventLoop(
                    server.maxclients+CONFIG_FDSET_INCR);
    // ...
    // 监听TCP端口，创建ServerSocket，并得到FD
    listenToPort(server.port,&server.ipfd)
    // ...
    // 注册 连接处理器，内部会调用 aeApiCreate(&server.ipfd)监听FD
    createSocketAcceptHandler(&server.ipfd, acceptTcpHandler)
    // 注册 ae_api_poll 前的处理器
    aeSetBeforeSleepProc(server.el,beforeSleep);
}

// 数据读处理器
void acceptTcpHandler(...) {
    // ...
    // 接收socket连接，获取FD
    fd = accept(s,sa,len);
    // ...
    // 创建connection，关联fd
    connection *conn = connCreateSocket();
    conn.fd = fd;
    // ...
    // 内部调用aeApiAddEvent(fd,READABLE)，
    // 监听socket的FD读事件，并绑定读处理器readQueryFromClient
    connSetReadHandler(conn, readQueryFromClient);
}

```

```

void aeMain(aeEventLoop *eventLoop) {
    eventLoop->stop = 0;
    // 循环监听事件
    while (!eventLoop->stop) {
        aeProcessEvents(
            eventLoop,
            AE_ALL_EVENTS|
                AE_CALL_BEFORE_SLEEP|
                AE_CALL_AFTER_SLEEP);
    }
}

int aeProcessEvents(
    aeEventLoop *eventLoop,
    int flags ){
    // ...  调用前置处理器 beforeSleep
    eventLoop->beforesleep(eventLoop);
    // 等待FD就绪，类似epoll_wait
    numevents = aeApiPoll(eventLoop, tvp);
    for (j = 0; j < numevents; j++) {
        // 遍历处理就绪的FD，调用对应的处理器
    }
}

```

### 单线程模型

![单线程网络模型流程.png](/blog-assets/cnblogs-18865330/image-18.png)

来Redis单线程网络模型的整个流程

1. 首先，创建一个server socket

2. 将server socket注册到aeEventLoop

3. 给server socket绑定一个连接应答处理器，用于在其可读时进行相应处理

4. 准备调用epoll_wait等待就绪，在此之前还需要进行一些前置处理

5. client socket的连接会触发server socket可读事件，连接应答处理器将client socket注册到aeEventLoop上

6. 之后client socket也会出现可读事件，交由命令请求处理器执行

7. 命令请求处理器将请求数据写入`c->queryBuf`，解析`queryBuf`中的数据为Redis命令，执行命令后把结果写入buf或reply

8. before Sleep操作会遍历待写的client，poll到client_socket有写事件时，就会交由命令回复处理器，将buf/reply的内容响应给客户端

命令请求处理相关核心代码

```

void readQueryFromClient(connection *conn) {
    // 获取当前客户端，客户端中有缓冲区用来读和写
    client *c = connGetPrivateData(conn);
    // 获取c->querybuf缓冲区大小
    long int qblen = sdslen(c->querybuf);
    // 读取请求数据到 c->querybuf 缓冲区
    connRead(c->conn, c->querybuf+qblen, readlen);
    // ...
    // 解析缓冲区字符串，转为Redis命令参数存入 c->argv 数组
    processInputBuffer(c);
    // ...
    // 处理 c->argv 中的命令
    processCommand(c);
}
int processCommand(client *c) {
    // ...
    // 根据命令名称，寻找命令对应的command，例如 setCommand
    c->cmd = c->lastcmd = lookupCommand(c->argv[0]->ptr);
    // ...
    // 执行command，得到响应结果，例如ping命令，对应pingCommand
    c->cmd->proc(c);
    // 把执行结果写出，例如ping命令，就返回"pong"给client，
    // shared.pong是 字符串"pong"的SDS对象
    addReply(c,shared.pong);
}
void addReply(client *c, robj *obj) {
    // 尝试把结果写到 c-buf 客户端写缓存区
    if (_addReplyToBuffer(c,obj->ptr,sdslen(obj->ptr)) != C_OK)
            // 如果c->buf写不下，则写到 c->reply，这是一个链表，容量无上限
            _addReplyProtoToList(c,obj->ptr,sdslen(obj->ptr));
    // 将客户端添加到server.clients_pending_write这个队列，等待被写出
    listAddNodeHead(server.clients_pending_write,c);
}

```

beforeSleep处理核心代码

```

void beforeSleep(struct aeEventLoop *eventLoop){
    // ...
    // 定义迭代器，指向server.clients_pending_write->head;
    listIter li;
    li->next = server.clients_pending_write->head;
    li->direction = AL_START_HEAD;
    // 循环遍历待写出的client
    while ((ln = listNext(&li))) {
        // 内部调用aeApiAddEvent(fd，WRITEABLE)，监听socket的FD读事件
        // 并且绑定 写处理器 sendReplyToClient，可以把响应写到客户端socket
        connSetWriteHandlerWithBarrier(c->conn, sendReplyToClient, ae_barrier)
    }
}

```

### 多线程模型

单线程模型的性能瓶颈在于命令处理部分，主要是网络IO

- 读请求、写响应过程涉及网络IO，受到网络影响

Redis 6.0版本中引入了多线程，目的是为了提高IO读写效率。因此在解析客户端命令、写响应结果时采用了多线程。核心的命令执行、IO多路复用模块依然是由主线程执行。

![多线程网络模型流程.png](/blog-assets/cnblogs-18865330/image-19.png)
