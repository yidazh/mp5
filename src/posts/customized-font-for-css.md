title: CSS自定义字体实践
date: 2015-11-15 10:03:32
categories:
- CSS
tags:
- CSS
- font
- 中文字体

---

近日写移动端页面要写一个日历，设计师MM指着设计稿上的数字曰：这是方正喵呜体，然后又指着上面的星期几曰：这是方正少儿简体，你看着办吧。我心里呵呵。我说字体问题稍后再说吧。人家掷地有声的强调：不行，不行的话一个一个的切成图......

![](https://2mih-static-1255626632.file.myqcloud.com/Can-a-Web-Developer-Also-be-a-Web-Designer-1.jpg)

<!-- more -->

记得以前逛技术博客的时候，有人总结过字体相关的各种问题，里面提到了可以自定义字体。这次寻思着正好尝试下，场景也挺契合的：移动端对WebFont支持度好，日历中用到的字符也就10个阿拉伯数字外加表示星期的7个汉字。这下就不用撕逼了。

关于WebFont和CSS3的`font-face`相关的内容这里就不多赘述了，Google下有很多。
1. [@font-face - CSS | MDN - Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face)
2. [CSS3 @font-face | css3教程-css3实例-css3动画 | W3CPlus](http://www.w3cplus.com/content/css3-font-face)
3. [自定义字体](https://leohxj.gitbooks.io/front-end-database/content/html-and-css-advance/custom-fonts.html)
4. [迟到的中文 WebFont](http://www.w3ctech.com/topic/669)

思路很简单，就是从其他字体中将这17个字符单独扣出来定制一种精简字体，然后生成对应的WebFont格式，再放进`font-face`里就OK 啦。如果还有字体加粗等需求的话，就得制作多套字体了。

上面提到的喵呜体和少儿简体，在玩机社区应该是喜闻乐见的，很容易下载下来的。（无授权使用，罪过）

接着需要字体制作工具。Mac下面，Glyphs 、FontForge因各种原因没能用上。转到Windows下，FontCreator装起来。（用的破解版，罪过 x 2)

打开下载下来的方正喵呜字体长这样，Unicode分类里，数字在拉丁文下面，我们的汉字在“中日韩统一象形文字”(CJK)下面：

![](https://2mih-static-1255626632.file.myqcloud.com/2.PNG)

然后新建字体，新建的字体会默认带有一些基本字符，既然定制，就要合身，删掉不需要的字符，减少字体文件体积。

![](https://2mih-static-1255626632.file.myqcloud.com/3.PNG)

我这里全部删空后，再按需加上。然后从喵呜体中找到对应的字符，复制过来。（一个一个的Ctrl + C / V有点累，不知有无其他简便的法子）因为需求中用到了2种字体，然后就把2种字体糅合在一起了：

![](https://2mih-static-1255626632.file.myqcloud.com/compare.jpg)

![](https://2mih-static-1255626632.file.myqcloud.com/1.PNG)

最后就可以导出定制字体了，FontCreator可以导出TTF和WOFF，由于我只需要适配移动端页面，就只用了这2种格式，导出的文件大小均小于5KB。有需要的可以利用在线工具导出EOT和SVG。[WEBFONT GENERATOR](http://www.fontsquirrel.com/tools/webfont-generator)

好了，让我们放在页面里试试效果。

``` css
@font-face {
  font-family: 'MiaoWuShaoEr';
  src: url('/fonts/MomosoMiaoWu.ttf') format('truetype'),
       url('/fonts/MomosoMiaoWu.woff') format('woff');
}

.calendar {
  font-family: 'MiaoWuShaoEr';
}
```

注意跨域访问`font`资源也会遵从同源策略的，跨域的别忘了用上`CORS`。难道`font`文件也可以用来做些邪恶的事情么？

采用后效果如下，`font-size` `color`随意用：

![](https://2mih-static-1255626632.file.myqcloud.com/demo.jpg)

其实字体文件也可以Embed in CSS，就像用Base64方法将小图片inline进CSS一样，同样可以通过Base64处理小的Font文件的。打开前面提到的字体转换工具，选中"Expert"模式，就可以在下面选择"Base64 Encode"。这样既能减少请求数，也能规避跨域问题，比较适合体积较小的字体文件。或者用其他的Base64转码工具。

实践过程就说到这儿了。然而这种技术目前看来，是无法大规模应用到中文网页中的，没办法，汉字字库太大了。而且国内没有像Google Fonts那样的稳定的有影响力的字体集中托管服务的，也就难最大程度发挥浏览器缓存策略的功效。现在的前端讲究工程化，自动化，像上面提到的这种字体制作过程是不可能规模应用的，不过在实践的过程中，从[迟到的中文 WebFont](http://www.w3ctech.com/topic/669)中发现了[Font Spider](http://font-spider.org/)项目，正好是解决字体文件自动化处理。后面找机会尝试下。

字体对于网页设计来说，还不是刚需，特别是中文字体，推动缓慢也算正常。随着网络环境的改善，技术的更新换代，外加中文字体本身的魅力更加毋庸置疑，中文字体一定会迎来她的春天的。

2015-11-14

