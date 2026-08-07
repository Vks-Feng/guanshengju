---
title: "《Head First设计模式》读书笔记 —— 单例模式"
date: 2025-05-13
summary: "摘要： 《Head First设计模式》读书笔记 —— 单例模式"
tags:
  - "Design Patterns"
source: "https://www.cnblogs.com/vksfeng/p/18874336"
---
《Head First设计模式》读书笔记

相关代码：[Vks-Feng/HeadFirstDesignPatternNotes: Head First设计模式读书笔记及相关代码](https://github.com/Vks-Feng/HeadFirstDesignPatternNotes)

>

用来创建独一无二的，只能有一个实例的对象的入场券

## 为什么需要单件模式

有些对象只能有一个实例

- 线程池、缓存、对话框、设备的驱动程序的对象、注册表设置对象

如果制造出多个实例，就会导致许多问题产生

- 程序的行为异常、资源使用过量、结果不一致

为什么不去靠人为约定或全局变量实现该目标？

- 人为约定：人为约定不一定能绝对严格地被遵守，且若存在更好方法，自然更愿意接受

- 全局变量：必须在程序开始前就创建对象并将其赋值给一个全局变量，若某次执行时没用到则是资源的浪费。（不能实现“懒加载”）

## 单件模式典型实现剖析

```

public class Singleton {
    private static Singleton uniqueInstance;

    private Singleton() { }

    public static Singleton getInstance() {
        if (uniqueInstance == null) {
            uniqueInstance = new Singleton();
        }
        return uniqueInstance;
    }
}

```

为什么会被这样设计？

- 创建对象仅需简单的`new`，为了避免被多次创建，将类的构造器私有化。

  - 但是私有化后只有类内的代码才能实例化该类，而类不被实例化如何调用其构造器呢？（“鸡生蛋，蛋生鸡”）

- 通过在类中设计一个静态方法，解决不实例化该类，而能调用其构造器。

**延迟实例化(Lazy instantiate)**

```

if (uniqueInstance == null) {
	uniqueInstance = new Singleton();
}
return uniqueInstance;

```

当我们需要该实例时再去创建对象，如果不需要就永远不会产生。

## 定义单件模式

**HeadFirst设计模式6-单件模式**

>

**单件模式**确保一个类只有一个实例，并提供一个全局访问点。

![单件模式类图.png](/blog-assets/cnblogs-18874336/image-1.png)

- 把类设计成自己管理的一个单独实例，同时也避免其他类再自行产生实例

- 通过单间类事获取单件实例的唯一途径

- 提供这个实例的全局访问点：当你需要实例时，响雷查询，它会返回单个实例

- 延迟实例化的方式创建单件对资源敏感的对象特别重要

## 本节用例

某公司设计的巧克力锅炉控制器

需要避免糟糕的情况发生：排除未煮沸的原料、已满情况下继续加原料、未放原料就空烧

```

public class ChocolateBoiler {
    private boolean empty;
    private boolean boiled;
    public ChocolateBoiler() {
        empty = true;
        boiled = false;
    }
    public void fill() {
        if (isEmpty()) {
            empty = false;
            boiled = false;
            // 填充原料
        }
    }    public void drain() {
        if (isEmpty() && isBoiled()) {
            empty = true;
        }
    }    public void boil() {
        if (!isEmpty() && !isBoiled()) {
            boiled = true;
        }
    }
    private boolean isBoiled() {
        return boiled;
    }

    private boolean isEmpty() {
        return empty;
    }
}

```

为了避免同时存在多个实例带来问题，对其进行单件化改造

```

public class ChocolateBoiler {
	private static ChocolateBoiler uniqueInstance;
    private boolean empty;
    private boolean boiled;

    public static ChocolateBoiler getInstance() {
	    if (uniqueInstance == null) {
		    uniqueInstance = new ChocolateBoiler();
	    }
	    return uniqueInstance;
    }

    private ChocolateBoiler() {
        empty = true;
        boiled = false;
    }
}

```

## 多线程带来的问题

当有多个熔炉实例时，可能会发生我们先前想避免的问题，但上面已有的单例模式可能会在多线程情况下创建出不只一个实例。

### 解决问题

只要把`getInstance()`变成同步(synchronized)方法，多线程灾难几乎就可以轻易地解决了

```

public class Singleton {
    private static Singleton uniqueInstance;

    private Singleton() { }

    public static synchronized Singleton getInstance() {
        if (uniqueInstance == null) {
            uniqueInstance = new Singleton();
        }
        return uniqueInstance;
    }
}

```

问题：同步会降低性能，且当实例被正确初始化后，后续就不用再同步了，同步将会彻底成为累赘

### 优化

1. 当`getInstance()`的性能对应用程序不是很关键，就什么都别做

  - 当`getInstance()`被频繁使用时，就需要考虑优化了

2. 使用“急切”创建实例，而不用延迟实例化的做法

  - 频繁使用`getInstance()`时可用

  - 创建和运行时负担不繁重时可用

```

public class Singleton {
    private static Singleton uniqueInstance = new Singleton();

    private Singleton() { }

    public static synchronized Singleton getInstance() {
        return uniqueInstance;
    }
}

```

3. “双重检查枷锁”，在`getInstance()`中减少使用同步

  - 首先检查是否实例已经创建了，如果尚未创建才会同步，这样就可以实现“只有第一次同步”了

```

private volatile static Singleton uniqueInstance;

private Singleton() { }

public static Singleton getInstance() {
	if (uniqueInstance == null) {
        synchronized (Singleton.class) {
            if (uniqueInstance == null) {
                uniqueInstance = new Singleton();
            }
        }
    }
    return uniqueInstance;
}

```

  - `volatile`关键字确保当uniqueInstance变量被初始化成Singleton实例时，多个线程正确地处理uniqueInstance变量

## Q&A

Q：为何不创建一个类，将其所有方法和变量都定义为静态的，直接把类当作一个单件？

A：

- 如果类自给自足，而且不依赖于复杂的初始化，可以这么做。

- 但是因为静态初始化的控制权是在Java手上，这么做有可能导致混乱，特别是有许多类牵涉其中时。这么做容易造成一些不易发现的和初始化次序有关的bug。

- 建议使用对象的单件，比较保险。

Q：类加载器(class loader)，听说两个类加载器可能有机会创建自己的单件实例

A：是的

- 每个类加载器都定义了一个命名空间，如果有两个以上的类加载器，不同的加载器可能会加载同一个类，从整个程序来看，同一个类会被加载多次。

- 如果这种情况发生在单件上，就会产生多个单件并存的怪异现象。

- 当程序有多个类加载器而你又使用了单件模式时，需要注意。解决方案：自行指定类加载器，并指定同一个类加载器

Q：可不可以继承单件类？

A：继承单间类面临的问题：构造器是私有的。不能用私有构造器来扩展类。所以你必须把单件的构造器改成公开的或受保护的，而这样：

- 就算不上“真正的”单件了，因为别的类也可实例化它

- 单件的实现是利用静态变量，直接继承会导致所有的派生类共享同一个实例变量，可能并非预期效果，需要实现注册表(Registry)功能

Q：为什么全局变量比单件模式差？

A：

- Java中，全局变量基本上就是对对象的静态引用。这种情况下使用全局变量就会有缺点，例如前文提到的急切实例化v.s.延迟实例化。

- 但要记住该模式的目的“确保只有一个实例并提供全局访问。全局变量可以提供全局访问，但不能确保只有一个实例。全局变量也会变相鼓励开发者用许多全局变量指向许多小对象来造成命名空间的污染。

## 总结

**OO基础**

- 抽象

- 封装

- 多态

- 继承

**OO原则**

- 封装变化

- 多用组合，少用继承

- 针对接口编程，不针对实现编程

- 为交互对象之间的松耦合设计而努力

- 对扩展开放，对修改关闭

- 依赖抽象，不要依赖具体类

**OO模式**

- 单件模式——确保一个类只有一个实例，并提供全局访问。

**要点**：

- 单件模式确保程序中的类最多只有一个实例

- 单件模式也提供访问这个实例的全局点

- Java中实现单件模式需要私有的构造器、一个静态方法和一个静态变量

- 确定在性能和资源上的限制，然后小心地选择适当的方案来实现单件，以解决多线程的问题

- 如果使用多个类加载器，可能导致单件失效而产生多个实例
