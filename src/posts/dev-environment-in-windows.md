title: 打造Windows前端开发环境
date: 2016-08-15
categories:
- 开发环境
tags:
- IDE
- Atom
- 前端

---

![](https://2mih-static-1255626632.file.myqcloud.com/front-end.jpeg)

目前就职的厂偏大偏传统，再加上我所在的部门不是前端部门，申请不到Mac设备，就只能在Windows平台下做开发了，此处想念么么嗖3秒。今天写写Windows平台下的个人开发环境搭建。

<!-- more -->

## IDE/Editor

开发环境首先离不开的就是IDE/编辑器，此前在么么嗖都是一个`MacVim`通吃，虽然说在`windows`下面有`Gvim`，但是我还是拒绝使用，`windows`下用用`vim`和`bash`当然是极好的，但是通过`Gvim`去配置各种插件复制`OS X`下面的环境，不用想肯定是个天坑。

这次准备尝试下`Atom`，2个月的使用下来，感觉OK，配合扩展还是可以轻松达到解放生产力的目的，代码补全、代码片段等。但跟`SublimeText`、`vim`比起来会感觉明显卡多了，特别是在载入大文件时，公司电脑又没上固态，还好没有到不能忍的地步。这里列下自己使用的几个主要的扩展。

- 第一步不用说，安装`VimMode`，现在各种离不开`vim`，尽管经常使用的也就那几个指令
- `Emmet`
- `Atom Ternjs` 代码补全，可以针对全局/项目/目录进行配置，配合`Atom`本身的代码补全，酸爽
- `Atom Beautify` 代码美化，也是通过配置文件来进行配置
- `linter` lint代码的
- `file-icons` 文件图标，挺漂亮
- `markdown-writer`
- `pigments` 显示颜色代码的颜色
- `minimap` 类似`SublimeText`右侧的代码缩率预览
- `sync-settings` 通过`Github Gist`来实现同步`Atom`的配置

中间因为公司准备搞研发云，`Atom`更卡了，已经不能忍了。尝试了下`VSC`，默认状态下确实比`Atom`要流畅和响应快，就是扩展还不是太丰富，而且Offline环境下，装扩展太麻烦了，遂没有继续入坑。回头把`Atom`重装了个`Beta`版，清理了下一些没用的扩展，终于不卡了。

## CommandLine

`windows`下面糟糕的`Command Prompt`我是一刻都不想用，现在有很多替代方案，最初只是用[cmder](http://cmder.net/)配合`git bash`就觉得够用了，常用的`bash`命令都能敲，`cmder`就不多做介绍了。接着发现[babun](http://babun.github.io/)，立马觉得NB，集成了`Cygwin`和`oh-my-zsh`。

但是`babun`下面有个Bug，命令行打开的`Node`应用无法用`Ctrl + C`完全杀掉，开个`webpack-dev-server`，每次`Ctrl + C`后得手动结束进程，否则重新打开时提示端口被占用，Github上有相关的issues，问题仍然存在，这个是不能忍的，果断又换回`cmder`。

## Git

公司代码版本控制大部分用的是`svn`，好像只有前端部门在用`Git`，不要问我一个做前端的为什么不在前端部门。`svn`不是不能用，只是我认为在都只用的半斤八两的情况下，`Git`明显好用多了，特别是在分支处理方面，历史原因此处不表。

不要紧，远程仓库用`svn`，本地我用`git svn`，我觉得不管是命令行还是sourcetree，都比那个小乌龟好使。使用`git svn`时，有几个注意事项顺便提下

- `svn`仓库体积过大时，注意配合`exclude-paths`和`include-paths`使用，不然`fetch`时很容易出错，折腾半天
- `fetch`时可以添加`-r`参数，从指定版本开始`fetch`，如`git svn fetch -r 100:HEAD`
- 使用分支时，我个人只用`master`分支和本地分支，而且`merge`时，只会把本地合到`master`，其他分支操作，坑太多，sourcetree也会提示的。分支合并时，很容易出现`conflict`，一般只会出现`no branch`，不难解决。有一次出现代码直接丢失，还是通过`git relog`找回的代码。
- `windows`下得sourcetree太丑，还是用命令行吧

## Debug

除了系统里面的测试框架，开发过程中还是缺不了调试工具。除了`windows`下专有的`Fiddler`，还有`Postman`。

## Productivity

- `OS X`下的`Alfred`用的各种爽，`windows`下的[Wox](https://github.com/Wox-launcher/Wox)也不赖，也是最近才发现的好工具，文件检索是基于`Everything`服务的。

## Doc

文档的编写，主要是编写`Markdown`文档，感觉`windows`下没有比较好用的`Native Markdown Editor`，就直接用`Atom`代替了。

## Note

零碎笔记的记录保存，`OneNote`再适合不过了，还是全平台免费同步，良心之作。

## 科学上网

不用说，`Shadowsocks`，配合`Proxfier`更好用。

就这些了，后面有什么好用的工具，慢慢在这里记录下。

---

YidaZh  
2016-08-15
