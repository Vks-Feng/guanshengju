---
title: "《Head First设计模式》读书笔记 —— 工厂"
date: 2025-05-02
summary: "《Head First设计模式》读书笔记 —— 工厂"
tags:
  - "Design Patterns"
source: "https://www.cnblogs.com/vksfeng/p/18857867"
---
《Head First设计模式》读书笔记

相关代码：[Vks-Feng/HeadFirstDesignPatternNotes: Head First设计模式读书笔记及相关代码](https://github.com/Vks-Feng/HeadFirstDesignPatternNotes)

- 除了new操作符外，还有更多制造对象的方法

- “实例化”这个活动不应该总是公开地进行

- 初始化经常造成“耦合”问题

## 实例化的问题

**当看到“new”就会想到“具体”**

- 使用new时，就是在针对实现编程，而非针对接口编程

代码绑着具体类会导致代码更脆弱

```

Duck duck = new MallardDuck();

```

根据运行时条件决定实例化的具体类，有变化或扩展时需要对原有代码进行检查和修改，导致该部分更难维护和更新

```

Duck duck;

if (picnic) {
	duck = new MallardDuck();
} else if (hunting) {
	duck = new DecoyDuck();
} else if (inBathTub) {
	duck = new RubberDuck();
}

```

**“new”没有错，错在“改变”**

- 如何将实例化具体类的代码从应用中抽离，或者封装起来，使它们不会干扰应用的其他部分

- “找出变化的方面，把它们从不变的部分分离出来”

## 本节用例

你是一个披萨店主人

你的初始代码如下：

```

Pizza orderPizza() {
	//为了让系统有弹性，我们希望这是一个抽象类或接口，但如果这样，无法直接实例化
	Pizza pizza = new Pizza();

	pizza.prepare();
	pizza.bake();
	pizza.cut();
	pizza.box();
	return pizza;
}

```

但你需要更多的披萨类型

```

Pizza orderPizza(String type) {
	Pizza pizza = new Pizza();

	// 根据披萨类型实例化正确的具体类
	if (type.equals("cheese")) {
		pizza = new CheesePizza();
	} else if (type.equals("greek")) {
		pizza = new GreekPizza();
	} else if (type.equals("pepperoni")) {
		pizza = new PepperoniPizza();
	}

	pizza.prepare();
	pizza.bake();
	pizza.cut();
	pizza.box();
	return pizza;
}

```

由于实例化具体类的缘故，当你新增或删除某些种类的披萨时，你需要修改上述的`orderPizza()`，这违背了“对修改关闭”的原则。

# 简单工厂模式

## 识别变化的部分

上例中不难看出，披萨的准备过程是不变的

```

	pizza.prepare();
	pizza.bake();
	pizza.cut();
	pizza.box();
	return pizza;

```

而变化的部分是披萨的具体类型，即实例化特定披萨种类的部分

```

	// 根据披萨类型实例化正确的具体类
	if (type.equals("cheese")) {
		pizza = new CheesePizza();
	} else if (type.equals("greek")) {
		pizza = new GreekPizza();
	} else if (type.equals("pepperoni")) {
		pizza = new PepperoniPizza();
	}

```

所以我们需要考虑将这部分封装起来

## 封装创建对象的代码

将创建对象的部分移到`orderPizza()`之外

- 创建披萨的代码移到另一个对象中，由它负责专职创建披萨。

**我们称这个新对象为“工厂(factory)”**

- 工厂处理创建对象的细节

- 有了工厂后，在需要披萨时，orderPizza**只需要关心从工厂得到了一个**披萨，而且其实现了Pizza接口，可以完成后续任务(prepare、bake、cut、box)

## 建立一个简单披萨工厂

```

/**
 * 只做一件事：为客户创建披萨
 */
public class SimplePizzaFactory {

    /**
     * 客户用此方法实例化新对象
     * @param type 披萨类型
     * @return 相应类型的披萨
     */
    public Pizza createPizza(String type) {
        Pizza pizza = null;

        if (type.equals("cheese")) {
            pizza = new CheesePizza();
        } else if (type.equals("pepperoni")) {
            pizza = new PepperoniPizza();
        } else if (type.equals("clam")) {
            pizza = new ClamPizza();
        } else if (type.equals(veggie)) {
            pizza = new VeggiePizza();
        }
        return pizza;
    }
}

```

Q：这么做的好处是什么？这似乎只是把问题从一个对象搬到另一个对象，但问题仍然存在。

A：SimplePizzaFactory可以有很多用户。把创建披萨的代码包装进一个类，当以后实现改变时，只需要修改这个类即可（而不用再找所有有这段代码的地方再去修改）。

Q：把工厂定义成静态的方法，与上述方法有何区别？

A：利用静态方法定义一个简单的工厂是很常见的技巧，被称为静态工厂。之所以使用静态方法，是因为不需要使用创建对象的方法来实例化对象（即不需要实例化工厂对象，就能获得产品）。这种方法也存在缺点，不能通过继承来改变创建方法的行为。

## 定义简单工厂

简单工厂其实不是一个设计模式，反而是比较像一种编程习惯。

![简单工厂.png](/blog-assets/cnblogs-18857867/image-1.png)

# 工厂方法模式

## 工厂行为的动态改变

当披萨店做大做强，出现了加盟店，而不同地区的加盟店又希望能提供不同风味的披萨……

### 创建多个工厂

我们可以利用SimplePizzaFactory写出多个种类的工厂，从而通过不同的工厂获得不同风味的披萨

### 质量控制

推广SimplePizza时，你发现加盟店的确是采用了你的工厂创建披萨，但是其他部分却开始采用他们自创的流程。

- 你希望建立一个框架，把加盟店和创建披萨捆绑在一起的同时又保持一定的弹性

- 而最早的设计中，创建披萨的代码绑在PizzaStore中，却又没有弹性

能不能找一个保持弹性而遵循框架的方法呢

### 给披萨店使用的框架

解决方法时，将`createPizza()`方法放回PizzaStore中，但将其设置为“抽象方法”，然后为每个区域风味创建一个PizzaStore的子类

PizzaStore代码如下：

```

public abstract class PizzaStore {

    public Pizza orderPizza(String type) {
        Pizza pizza;
        pizza = createPizza(type);

        pizza.prepare();
        pizza.bake();
        pizza.cut();
        pizza.box();
        return pizza;
    }

    public abstract Pizza createPizza(String type);
}

```

### 允许子类自己做决定

上面的PizzaStore相当于为子类提供了一套框架，各个店铺以PizzaStore为基类，实现自己的createPizza()方法

![实现抽象方法.png](/blog-assets/cnblogs-18857867/image-2.png)

所谓“子类自己做决定”

- `orderPizza()`在抽象的PizzaStore中定义，但是只在子类中实现具体类型，所以store并不知道是哪个子类将实际制作披萨

- 更进一步，`orderPizza()`对Pizza对象做了很多事情，但由于Pizza对象是抽象的，`orderPizza()`并不知道哪些实际的具体类参与进来了。即实现了解耦(decouple)

- 当`orderPizza()`调用`createPizza()`时，某个披萨店子类将负责创建披萨，具体的披萨类型也由披萨店来决定。

## 声明一个工厂方法

```

abstract Product factoryMethod(String type)

```

工厂方法用来处理对象的创建，并将这样的行为封装在子类中。这样，客户程序中关于超类的代码和子类对象创建代码解耦了

- 工厂方法是抽象的，所以依赖子类来处理对象的创建

- 工厂方法必须返回一个产品，超类中定义的方法，通常使用到工厂方法的返回值

- 工厂方法将客户（也就是超类中的代码，例如`orderPizza()`，和实际创建具体产品的代码分割开来

## 认识工厂方法模式

- 所有工厂模式都用来封装对象的创建。

- 工厂方法模式(Factory Method Pattern)通过让子类决定该创建的对象是什么，来达到将对象创建的过程封装的目的。

其组成元素：

-

创建者类

![创建者类.png](/blog-assets/cnblogs-18857867/image-3.png)

  - 抽象创建者类定义了一个抽象的工厂方法，让子类实现此方法制造产品

  - 创建者通常会包含依赖于抽象产品的代码，而这些抽象产品由子类制造，创建者不需要真的知道在制造哪种具体产品

-

产品类

![产品类.png](/blog-assets/cnblogs-18857867/image-4.png)

另一观点：平行的类层级

![抽象工厂方法平行类层级.png](/blog-assets/cnblogs-18857867/image-5.png)

## 定义工厂方法模式

# HeadFirst设计模式4-工厂方法模式

>

工厂方法模式定义了一个创建对象的接口，但由子类决定要实例化的类是哪一个。工厂方法让类把实例化推迟到子类。

![工厂方法模式.png](/blog-assets/cnblogs-18857867/image-6.png)

- 工厂方法模式能够封装具体类型的实例化。

- “工厂方法”：抽象的Creator提供了一个创建对象的方法的接口，称为工厂方法

理解“工厂方法让子类决定要实例化的类”

- 此处的“决定”并不是指模式允许子类本身在运行时决定

- 而是指在编写创建者类时，不需要知道实际创建的产品是哪一个，选择了使用哪个子类，自然就决定了实际创建的产品是什么

Q：当只有一个ConcreteCreator时，工厂方法模式有什么优点？

A：尽管只有一个具体创建者，工厂方法模式仍然很有用。因为它帮助我们将产品的“实现”从“使用”中解耦，如果增加产品或者改变产品的实现，Creator并不会受到影响。（因为Creator与任何其他ConcreteProduct之间都不是紧耦合）

Q：工厂方法和创建者是否总是抽象的？

A：不，可以定义一个默认的工厂方法来产生某些具体的产品，这么一来。即使创建者没有任何子类，依然可以创建产品

Q：简单工厂与工厂方法之间的差异

A：简单工厂把全部的事情在一个地方都处理完了，然而工厂方法却是创建一个框架，让子类决定要如何实现

## 封装变化

- 可以将创建对象的代码封装起来。

  - 实例化具体类的代码，很可能在以后经常需要变化

  - 通过“工厂”技巧，封装实例化的行为

- 工厂的好处

  - 将创建对象的代码集中在一个对象或方法中，避免代码中的重复，并且以后更方便维护。

  - 实例化对象时，只依赖接口而不是具体类。让我们针对接口编程而非针对实现编程

  - 让代码更有弹性，更好地应对扩展

- 虽然在工厂代码中仍然不可避免使用具体类来实例化真正的对象，但这并不能理解为只是“自欺欺人”。对象的创建是现实的，如果不创建任何对象，就无法创建Java程序。然而，利用这个现实的知识，可将这些创建代码的对象用栅栏围起来，就像你把所有的羊毛堆到眼前一样，一旦围起来，就可以保护这些创建对象的代码。如果让创建对象的代码乱报，就无法收集到这些“羊毛”。

## 依赖倒置原则

### 对象依赖

反例：一个很依赖的披萨店。store需要依赖很多披萨对象

![非常依赖的披萨店类图.png](/blog-assets/cnblogs-18857867/image-7.png)

当你直接实例化一个对象时，就是在依赖他的具体类

### 依赖倒置原则

# HeadFirst设计原则5

**依赖倒置原则(Dependency Inversion Principle)：要依赖抽象，不要依赖具体类**

- 类似“针对接口编程，不针对实现编程”，但更强调抽象

- 该原则说明：不能让高层组件依赖底层组件（同时两者都应该依赖于抽象）

  - “高层”组件：由其他低层组件定义其行为的类

### 原则的应用

通过工厂方法对上述的非常依赖的披萨店进行改进

- 主要问题：披萨店依赖所有披萨类型，因为它是在自己的方法中实例化这些具体类型的

- 已经创建了一个抽象——Pizza

![工厂方法实现依赖倒置.png](/blog-assets/cnblogs-18857867/image-8.png)

工厂方法并非是唯一的技巧，但却是最有威力的技巧之一

### “倒置”

依赖倒置原则中的“倒置”指的是和一般OO设计的思考方式完全相反

从上图中可以看到

- 底层组件会依赖高层的抽象

- 高层组件也依赖相同的抽象

倒置思考方式：

- 设计产品时，从顶端开始，然后往下到具体类

  - 例如：实现披萨时，先抽象化一个Pizza，再去让各种具体类型的披萨实现该接口

- 再去设计工厂，工厂会依赖我们抽象上述的产品的抽象

这样我们就倒置了一个工厂的设计

### 遵循此原则的指导方针

- 变量不可以持有具体类的引用

  - 使用“new”就会持有具体类的引用

  - 可通过改进这点

- 不要让类派生自具体类

  - 派生自具体类，就会依赖该具体类

  - 派生自抽象（接口或抽象类）

- 不要覆盖类中已实现的方法

  - 如果覆盖类已实现的方法，那么你的基类就不是一个真正适合被继承的抽象

  - 基类已实现的方法应该由所有子类共享

正如同许多其他原则一样，我们要做的时尽量到达此原则，而非随时都要遵循

- 完全遵循实战中很难打出来寸步难行

当你深入体验这些方针，并且内化成思考的一部分，设计时就会知道何时有足够的理由违法这样的原则。

- 例如，不会改变的类直接实例化也无大碍，比如字符串对象

# 抽象工厂模式

## 背景

我们已经通过工厂方法模式导入了新的框架，让加盟店严格遵循我们的流程，现在我们需要考虑确保原料的一致，从而保证品控。

打算建造一家生产原料的工厂，将原料运送到各家加盟店。但是对于不同地区的店铺，需要准备多组原料。

在店铺扩增时，原料也会相应改变，所以需要考虑如何处理原料家族

### 如何处理原料家族

![原料家族.png](/blog-assets/cnblogs-18857867/image-9.png)

## 原料工厂

### 建立原料工厂

建造一个工厂来生产原料，即创建原料工厂的每一种原料

开始先为工厂定义一个接口，这个接口负责创建所有的原料。

```

public interface PizzaIngredientFactory {

    public Dough createDough();

    public Sauce createSauce();

    public Cheese createCheese();

    public Veggies[] createVeggies();

    public Clams createClam();
}

```

1. 为每个区域建造一个工厂。

  - 创建继承自PizzaIngredientFactory的子类来实现每一个创建方法

2. 实现一组原料类供工厂使用

  - 例如ReggianoCheesse、RedPeppers、ThickCrust-Dough。这些类可以在合适的区域间共享

3. 将这些组织起来

  - 新的原料工厂整合进旧的PizzaStore代码

### 重写Pizza类

重写Pizza类，将其中的`prepare()`方法改为抽象方法，由子类实现，从而使用特定的原料工厂去获取原料

```

public class CheesePizza extends Pizza{
    PizzaIngredientFactory ingredientFactory;

    public CheesePizza(PizzaIngredientFactory ingredientFactory) {
        this.ingredientFactory = ingredientFactory;
    }

    @Override
    public void prepare() {
        System.out.println("Preparing " + name);
        dough = ingredientFactory.createDough();
        sauce = ingredientFactory.createSauce();
        cheese = ingredientFactory.createCheese();
    }
}

```

- Pizza的代码利用相关的工厂生产原料

- 生产原料依赖使用的工厂，Pizza类不关心原料，只知道如何制作披萨

- 实现了披萨和原料的解耦

### 披萨店的实现

```

public class NYPizzaStore extends PizzaStore{
    public Pizza createPizza(String item) {
        Pizza pizza = null;
        PizzaIngredientFactory ingredientFactory = new NYPizzaIngredientFactory();

        if (item.equals("cheese")) {
            pizza = new CheesePizza(ingredientFactory);
            pizza.setName("New York Style Cheese Pizza");
        } else if (item.equals("pepperoni")) {
            pizza = new PepperoniPizza(ingredientFactory);
            pizza.setName("New York Style Pepperoni Pizza");
        } else if (item.equals("clam")) {
            pizza = new ClamPizza(ingredientFactory);
            pizza.setName("New York Style Clam Pizza");
        } else if (item.equals("veggie")) {
            pizza = new VeggiesPizza(ingredientFactory);
            pizza.setName("New York Style veggie Pizza");
        }
        return pizza;
    }
}

```

### 回顾总结

![原料工厂.png](/blog-assets/cnblogs-18857867/image-10.png)

一连串代码的变化，其本质是：我们引入新类型的工厂，即所谓的抽象工厂，来创建披萨原料家族

通过抽象工厂所提供的接口，可以创建产品的家族，利用这个接口书写代码，我们的代码将从实际工厂解耦，以便在不同上下文中实现各式各样的工厂，制造出各种不同的产品

因为代码从实际的产品中解耦，所以我们可以替换不同的工厂来取得不同的行为

## 定义抽象工厂方法

# HeadFirst设计模式5-抽象工厂模式

>

抽象工厂模式提供一个接口，用于创建相关或依赖对象的家族，而不需要明确指定具体类

- 允许客户使用抽象的接口来创建一组相关的产品，而不需要知道实际产出的具体产品是什么，客户从具体产品中被解耦

![抽象工厂方法.png](/blog-assets/cnblogs-18857867/image-11.png)

从PizzaStore的角度来看：

![PizzaStore角度看抽象工厂.png](/blog-assets/cnblogs-18857867/image-12.png)

### 工厂方法是不是潜伏在抽象工厂里面

在上述代码中我们可以发现，抽象工厂的每个方法实际上看起来都像是工厂方法，每个方法被声明成抽象，子类的方法覆盖这些方法来创建某些对象。这不就是工厂方法吗

- 的确如此，抽象工厂的方法经常以工厂方法的方式实现。

- 抽象工厂的任务是定义一个负责创建一组产品的接口。这个接口内的每个方法都负责创建一个具体产品，同时我们利用实现抽象工厂的子类来提供这些具体的做法

- 所以在抽象工厂中利用工厂方法实现生产方法时相当自然的做法

## 工厂方法 v.s. 抽象工厂

共同作用：将对象的创建封装起来，使应用程序解耦，并降低其对特定实现的依赖

| 对比内容 | 工厂方法 | 抽象方法 |
| --- | --- | --- |
| **使用的设计模式** | 创建型模式 | 创建型模式 |
| **关注的对象类型** | 专注于单个产品的创建 | 专注于一组相关产品的创建 |
| **目标** | 提供一个接口，用来创建对象，子类决定具体的实现 | 提供一个接口，来创建产品家族中的多个相关对象 |
| **解耦的方式** | 客户端与具体产品解耦，客户端只需要知道接口而不关心具体实现 - 通过子类来创建对象 - 子类决定具体类型，客户只需要知道所用的抽象类型 | 客户端与整个产品族解耦，客户端只需知道工厂接口，具体产品族的变化由工厂子类处理 - 提供一个用来创建一个产品家族的抽象类型，该类型的子类定义产品被生产的方法。 - 想使用工厂，必须先实例化它，然后将它传入一些针对抽象类型所编写的代码中。 |
| **是否有多个产品** | 创建单一产品（通常是一个具体的类） | 创建多个相关产品，产品之间通常有依赖关系，属于同一产品族 |
| **扩展性** | 如果需要新产品，可以通过继承和重写工厂方法来实现新类型的创建 | 扩展产品族时，可能需要修改抽象工厂的接口，增加或改变产品接口，但可以通过新子类来应对不同产品族的需求 |
| **代码结构** | 客户端通过工厂方法来创建产品，工厂方法通常在具体类中实现 | 客户端通过抽象工厂来获得产品，工厂方法在不同的子工厂类中实现 |
| **使用类 vs 使用对象** | 使用具体的工厂类，通过继承来扩展产品创建方式，客户端依赖于工厂类的继承层次 | 使用抽象工厂接口，通过组合多个相关产品对象来创建产品家族，客户端依赖于工厂接口而不是具体实现 |
| **继承 vs 对象组合** | 依赖于继承来实现产品的创建，不同的具体工厂类通过继承抽象工厂来实现不同的创建方法 | 依赖于对象组合来实现产品的创建，不同的具体工厂类实现抽象工厂接口，并通过组合多个产品来实现产品创建 |
| **使用时机** | 当只需要创建单一产品，且可能需要在未来扩展或修改具体产品的创建方式时，使用工厂方法 | 当需要创建多个相关的产品，且这些产品有共同的特性或属于同一产品家族时，使用抽象工厂模式 |

采用工厂方法：

![工厂方法实现的披萨店.png](/blog-assets/cnblogs-18857867/image-13.png)

采用抽象工厂

![抽象工厂实现的披萨店.png](/blog-assets/cnblogs-18857867/image-14.png)

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

- 抽象工厂模式——提供一个接口，用于创建相关或依赖对象的家族，而不需要明确具体类

- 工厂方法模式——定义了一个创建对象的接口，但由于子类决定要实例化类是哪一个。工厂方法让类把实例化推迟到子类。

**要点**：

- 所有的工厂都是用来封装对象的创建

- 简单工厂，虽然不是真正的设计模式，但仍不失为一个简单的方法，可以将客户程序从具体类解耦

- 工厂方法使用继承，把对象的创建委托给子类，子类实现工厂方法来创建对象

- 抽象工厂使用对象组合，对象的创建被实现在工厂接口所暴露出来的方法中

- 所有工厂模式都通过减少应用程序和具体类之间的依赖促进松耦合

- 工厂方法允许类将实例化延迟到子类进行

- 抽象工厂创建相关的对象家族，而不需要依赖它们的具体类

- 依赖倒置原则，指导我们避免依赖具体类型，而要尽量依赖抽象

- 工厂是很有威力的技巧，帮助我们针对抽象编程，而不要针对具体类编程
