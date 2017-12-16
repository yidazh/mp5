title: dot net decompile
date: 2016-06-06 21:33:54
categories:
- .NET
tags:
- C#
- .NET
- decompile
---

虽然如今的后端市场上，`.NET`系的技术没有`Java`系的吃香，但是我好像和`.NET`缘分还不浅。大学一次实践课程用的是`.NET`，毕业工作后做的第一个项目是`.NET`，如今作为一个前端工程师，我以为再也不会碰`.NET`时，是的，它又出现在我眼前。

<!-- more -->

最近换工作了，虽然面试时确认是过来专职做前端的，但是入职后，我以前的`.NET`经验被发现可以派得上用场时，这锅还得我来背，好在我已工作多年，对这种事情看的开了。

接手的项目是一个古老的项目，没有源码，只有部署文件。因为需要对其进行二次开发，又不想用`Java`重写（公司后端主`Java`），就考虑反编译重建工程，然后再修改。

反编译重建的过程还算顺利，这里稍作记录：

## 工具

`.NET`的版本如今已迭代至`4.6+`了，下面的反编译工具还是挺多的，一般都是开发时溯源第三方库源代码用，这里列几个

- `.NET Reflector` 老牌反编译工具，收费工具。虽然有很多替代品，但是经过实践，该工具的反编译效果最佳
- `ILSpy` 上面那个的免费替代品
- `dotPeek` 著名的`JetBrains`旗下的工具，好感度+99，亮点是可以把`Web Forms`的`C#`源文件，自动命名为`*.aspx.cs`格式，其他几个工具好像都没有这个功能
- `dnSpy` 开源工具，[0xd4d/dnSpy](https://github.com/0xd4d/dnSpy)，提交活跃
- `JustDecompile`，和`Fiddler`是一家出的

其实大部分地方，这些工具反编译出来的结果都是差不多，因为要重建工程，我就多弄了几个工具来做比较，降低我手工修补反编译代码量。

## 问题

虽然用了那么多工具，还是有很多报错，只能一个一个修。大体有下面几类：

### into in LINQ

`LINQ`查询中，如果用到了`join ... on ...`，反编译出来的代码中很大机率会在后面加上`into`，如

```sql
from c in categories
join p in products on c equals p.Category
select new { Category = c, Product = p }
```

工具会把反编译成

```sql
from c in categories
join p in products on c equals p.Category into p
select new { Category = c, Product = p };
```

这个时候就要人为修改了，`into p`可能是多余的，也有可能是变量名重复的问题，我改的过程中，遇到的全是前者，删掉即可。

### implicit type

部分隐式类型，工具也是无能为力，通常出来的类型是`<>IL...`，其实是个`IL`类型名称，此时将类型改为`var`即可解决报错。

### nested anonymous type

`anonymous type`常见于`LINQ`查询，一层的匿名类型，工具不压力，当有嵌套时，就不行了，出来的结果中，类型名称同上`<>IL...`，而且类型和值是同一个标识符。这个时候，参考下上下文，将匿名对象恢复成`new {}`，然后就不难推断出那些地方是类型，那些是值。

### type cast

这个比较简单，代码里有强制类型转换时，工具就算可以推出来，也无法确定，留给我们手动改，加个强制转换就行。

### duplicate variable

变量重复声明，就是反编译出来的代码中，临时变量重名。特别是`LINQ`查询中会经常出现，一个一个改。

### foreach in

`foreach...in`配上`var`，工具基本就傻逼了，反编译出来的代码中，很多出来的是`GetEnumerator`，然后再`while`循环`MoveNext()`，但是一般类型配不上，编译器直接报错。这个时候直接改用`foreach...in`即可，一大坨代码瞬间精简，酸爽。

### goto label

其实这个以前在`Java`的反编译代码中经常见到，但是编译器会提示报错。这次，`C#`代码里同样出现了，改完其他错误，看到`label`，本能的想去改（一般是循环里用了`break`、`continue`之类的），但是发现编译器没有提示出错，这才想起`C#`是支持`goto`的！！！大微软威武。

### event handler args

这个也很easy，写`lambda`时，参数列表缺失，如`(,) => 1 * 2`，补上即可。

### duplicate prop

`LINQ`查询时，返回的匿名对象中出现了重名的属性，暂时还不知原因，应该和上下文有关，待查。

## BUILD

编译错误修好后，加入需要的`Reference`，调试走起，可以`run`起来的感觉真好。

Yida-Zh  
2016-06-06 22:55
