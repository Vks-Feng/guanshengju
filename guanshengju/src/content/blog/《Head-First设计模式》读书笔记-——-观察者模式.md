---
title: "《Head First设计模式》读书笔记 —— 观察者模式"
date: 2025-04-25
summary: "《Head First设计模式》读书笔记 —— 观察者模式"
tags:
  - "Design Patterns"
source: "https://www.cnblogs.com/vksfeng/p/18846921"
---
《Head First设计模式》读书笔记

相关代码：[Vks-Feng/HeadFirstDesignPatternNotes: Head First设计模式读书笔记及相关代码](https://github.com/Vks-Feng/HeadFirstDesignPatternNotes)

- 让你的对象知悉现状，不会错过对象感兴趣的事

- 对象甚至在运行时可决定是否要继续被通知

- JDK中使用最多的模式之一

## 本节例子

![HF观察者模式用例.png](/blog-assets/cnblogs-18846921/image-1.png)

系统三部分：

- 气象站：获取实际气象数据的物理装置

- WeatherData对象（追踪来自气象站的数据，并更新布告板）

- 布告板：显示目前天气状况给用户看

物理气象站→WeatherData对象(已完成)

WeatherData对象→及时更新布告板

我们的工作：建立一个应用，利用WeatherData对象取得数据，并更新三个布告板(目前状况、气象统计、天气预报)

```

|-----------------------|
|      WeatherData      |
|-----------------------|
|   getTemperature()    |
|   getHumidity()       |
|   getPressure()       |
|   measure-            |
|   mentsChanged()      |
|   //其他方法           |
|-----------------------|

```

一旦气象测量更新，mentsChanged会被调用

### 错误示范

```

public class WeatherData {
	public void measurementsChanged() {
		float temp = getTemperature();
		float humidity = getHumidity();
		float pressure = getPressure();
		currentConditionDisplay.update(temp, humidity, pressure);
		statisticsDisplay.update(temp, humidity, pressure);
		forecastDisplay.update(temp, humidity, pressure);
	}
}

```

## 认识观察者模式

报纸类比：

1. 报社的业务就是出版报纸

2. 向报社订阅报纸，当有新报纸出版时，就会送来。只要是订户，就会一直收到报纸

3. 不再想看时，取消订阅，就不会再送

4. 只要报社还运行，就会一直有人向他们订阅/取消订阅

### 出版者+订阅者=观察者模式

***HeadFirst设计模式2-观察者模式***

出版者↔️主题(subject)

订阅者↔️观察者(Observer)

![观察者模式](/blog-assets/cnblogs-18846921/image-2.png)

### 观察者模式使用

1. 对象告知主题，想要成为观察者 —— 注册(订阅)

2. 对象成为观察者，可以接收到通知

3. 对象要求从观察者把自己除名(取消订阅)，主题接收到请求，将其除名

## 定义观察者模式

>

**观察者模式**定义了对象之间的一对多依赖，这样一来，当一个对象改变状态时，它的所有依赖者都会收到通知并自动更新。

- 定义了一系列对象之间的一对多关系

- 状态改变→依赖者都会接到通知

### 类图

![观察者模式类图](/blog-assets/cnblogs-18846921/image-3.png)

### Q&A

Q：这和一对多的关系有何关联？

A：利用观察者模式，主题是具有状态的对象，并且可以控制这些状态，也就是说，有“一个”具有状态的主题。另一方面，观察者使用这些状态，虽然这些状态并不属于他们，有许多的观察者，以来主题来告诉他们状态何时改变了。这就产生了一个关系：“一个”主题对“多个”观察者的关系。

Q：其间的依赖是如何产生的？

A：主题是真正拥有数据的人，观察者是主题的依赖者，在数据变化时更新，这样比起让许多对象控制同一份数据来，可以得到更干净的OO设计。

## 松耦合的威力

当两个对象之间松耦合，它们依然可以交互，但是不太清楚彼此的细节。

观察者模式提供了一种对象设计，让主题和观察者之间松耦合。

- 主题唯一依赖的东西就是一个实现Observer接口的对象列表，所以我们怎么操作其中的观察者对象(增删改)，不会影响到主题。

- 当有新类型的观察者出现时，不需要修改主题的代码，只需要该类去实现观察者接口，然后注册为观察者即可。主题不在乎别的，只会发送给所有实现了观察者接口的对象。

- 可以独立地复用主题或观察者，其他地方需要使用时也可以轻易地复用，因为二者并非紧耦合

- 因为主题和观察者二者是松耦合的，所以只要它们之间的接口仍被遵守，就可以自由地改变它们

***设计原则4 ：为了交互对象之间的松耦合设计而努力***

**松耦合的设计之所以能让我们建立有弹性的OO系统，能够应对变化，是因为对象之间的相互依赖降到了最低**

## 气象站设计

![气象站设计](/blog-assets/cnblogs-18846921/image-4.png)

## “拉”与“推”之辩

拉：指观察者主动向主题获取数据

推：指主题将信息发给观察者

“拉”：

- 拉的好处：

  - 主题不可能事先料到各种观察者的需求，拉可以让各种观察者去获取目标信息，而非被动接收到一大坨信息(其中可能包含不需要的内容)

  - 当主题需要扩展功能时，不用修改和更新对每位观察者的调用，只需要改变自己的getter、setter即可

- 拉的缺点：

  - 主题必须门户大开，封装性被打破，面临被大肆挖掘数据的风险

  - 观察者可能会多次调用才能拼凑其所需信息

“推”：与“拉”的优缺相对应，略

## Java内置的观察者模式

( Java 9 及更高版本中，`Observable` 类被标记为 `@Deprecated`，意味着它仍然可以使用，但不推荐使用，未来可能会被移除。)

当然，我们还是可以从中学到一些东西的😛

### 使用

java.util包中包含最基本的Observer接口和Observer类，具备许多功能，使用上更方便，甚至可以使用“推”或“拉”的方式传送数据

![Java内置观察者模式](/blog-assets/cnblogs-18846921/image-5.png)

图中重点信息：

- “主题”(Subject)也可称为“可观察者”(Observable)

- Observable是一个“类”，而不是一个“接口”

### 如何运作

1. 把对象变成观察者

  - 实现观察者接口(java.util.Observer)，然后调用其`addObserver()`方法

2. 可观察者送出通知

  - 产生可观察类

  - 先调用`setChange()`方法，标记状态已经改变的事实

  - 调用两种`notifyObservers()`方法中的一个(`notifyObserver()`或`notifyObservers(Object arg)`)

3. 如何接收通知

  - `update(Observable o, Object arg)`

  - `o`：主题本身是第一个变量，从而让观察者知道是哪个主题发来的通知

  - `arg`：传入`notifyObservers()`的数据对象，如果没有说明为空

#### `setChange()`

`setChange()`用来标记状态已经改变的事实，好让`notifyObservers()`知道当它被调用时应该更新观察者。

如果调用`notifyObservers()`之前没有调用`setChange()`，观察者就不会通知被通知

伪代码如下：

```

setChange() {
	changed = true;
}

notifyObservers(Object arg) {
	if (changed) {
		for every observer on the list {
			call updata(this, arg);
		}
		changed = false;
	}
}

notifyObservers() {
	notifyObservers(null);
}

```

**为什么要设计`setChange()`？**

`setChange()`可以让你在更新观察者时，有更多的**弹性**，可以**更适当地通知观察者**。

- 例如：气象站的测量十分敏锐，过于微小的变动也会被捕捉，这会造成主题不断地通知观察者。但是我们可以设置在温度变化超过半度才通知观察者(即超过半度再调用`setChange()`)，使得每次**通知更有效**

### 黑暗面

- Observable是一个“类”而非“接口”，其实现有很多问题，限制了他的使用和复用

- 由于java不支持多继承，如果某类想具有Observable和另一个超类的行为，会比较麻烦，这限制了Observable的复用能力

  - 而增加复用能力正是使用模式最原始的动机

- `setChange()`方法被保护起来了(`protect`)，这意味着除非继承自Observable，否则无法创建Observable实例并组合到自己的对象中

  - 违反了第二个设计原则：“多用组合，少用继承”

## 总结

**OO基础**：

- 抽象

**OO原则**：

- 封装变化

- 多用组合，少用继承

- 针对接口编程，不针对实现编程

- 为交互对象之间的松耦合设计而努力

  - 松耦合设计更有弹性，更能应对变化

**OO模式**：

- 观察者模式——在对象之间定义一对多的依赖，这样一来，当一个对象改变状态，依赖它的对象都会收到通知，并自动更新

  - 观察者模式的代表人物——MVC

**要点**：

- 观察者模式定义了对象之间一对多的关系

- 主题(可观察者)用一个共同的接口来更新观察者

- 观察者和可观察者之间用松耦合方式结合(loosecoupling)，可观察者不知道观察者的细节，只知道观察者实现了观察者接口

- 使用此模式时，你可从被观察者处推(push)或拉(pull)数据(然而，推的方式被认为更“正确”)

- 有多个观察者时，不可以依赖特定的通知次序(即通知顺序不应该影响程序的正确性)

  - 一旦观察者/可观察者的实现有所改变，通知次序就会改变，很可能就会产生错误的结果，这违背了松耦合
