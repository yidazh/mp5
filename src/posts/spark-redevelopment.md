title: 'Spark 二次开发实录'
date: 2014-07-19 23:02:12
categories:
- Java
tags:
- Spark
- XMPP
- Fastpath
- IM
- Openfire

---

此地的Spark是一个基于XMPP的Java即时通讯客户端，非Apache Spark，有兴趣的可以继续往下瞅。

## 前言

前两个月的时间里，有幸接触到即时通讯领域的一些内容，认识了基于XMPP的开源RTC Server [Openfire][1]以及开源的XMPP客户端[Spark][2]。由于项目的需求，采用Openfire + Spark的方案来完成即时通讯，然后对Spark进行了必要的社会主义改造。

![Openfire][17]

由于该方面的应用大多局限在企业内部，相关的资料不大好找，期间也遇到了不少的坑，好在经过艰辛的爬坑过程，大部分问题都得以解决。因此也希望以博文的形式给正在研究Spark的苦逼娃一点帮助。

这里把重点放在Spark方面，主要是对Spark官方自带的Fastpath插件进行了二次开发、汉化等工作，项目中还涉及到Fastpath的Openfire插件、以及Fastpath的Web Client，这里就不展开了。

<!-- more -->

## 环境搭建

### 获取源代码

Sarpk官方正式版最新的是2.6.3，于2011年发布的，官网上也放出了一些开发预览版[SPARK NIGHTLY BUILDS][3]。我们可以从Spark的官方SVN `http://svn.igniterealtime.org/svn/repos/spark/trunk` 获取Spark的最新开发代码。代码的下载速度较慢，慢慢等吧。下载完成后，让我们看看具体的内容：

- `build`里面是也用来打包Spark的，构建工具是ant。可以将Spark打包成各种平台下的客户端。
- `documentation`里面是附带的文档，里面有Spark客户端插件开发的一些指引文档。
- `src`里面则是项目的源代码，包括Spark主体以及其他官方插件的源代码等。

### 新建项目

这里以MyEclipse IDE为例，新建一个Spark二次开发的项目。

- MyEclipse 10.5
- JDK 1.7.0_45
- Windows 7 SP1

在MyEclipse中新建一个Java项目SparkDemo，JRE指定为1.7+，下拉栏里没有的，去 `Configure JREs` 里添加，这里最好选择使用Java 7，因为在Build时，默认要求JRE最低版本是Java 7，后面也会提到。 
![New Java Project][5]

然后`Finish`完成项目创建。

接着将下载下来的Spark源代码拖进项目的目录下，这个时候会看到`src`目录下会有很多报错提示，没关系。进入项目的Build Path设置里，将`src`目录从Source栏中移除。然后将Spark主体源码`src/java`以及Fastpath插件源码`src/plugins/fastpath/src/java`加入到Source栏中。如果自己开发Spark插件或者改造其他插件，设置类似。

![Source Configuration][6]

###  引入lib

然后引入项目所需的库文件也就是jar包。
包括Spark主体程序需要的库文件：
- `build/lib`
- `build/lib/dist`
- `build/lib/merge`

以及插件需要的库文件：
- `src/plugins/fastpath/build/lib`
- `src/plugins/fastpath/build/lib/dist`

引入完毕后，SparkDemo项目的错误提示就会自动去除了。

## Build and Run

### Run<a name="run"></a>

进入MyEclipse的Run Configurations，新建一个Java Application的launch configuration：

- Main：Main Class设置为`org.jivesoftware.launcher.Startup`
- JRE：确认JRE版本为1.7+
- Classpath：将Spark的resources以及插件的resources文件夹加入到User Entries中(选择`User Entries`,点击`Advanced`,选择`Add Folders`)
    - `src/resources`
    - `src/plugins/fastpath/src/resources`

  ![User Entries Configuration][7]
  
- Arguments：VM arguments中加入

    - `-Djava.library.path=build/lib/dist/windows` 引入平台运行环境，根据当前开发的运行环境进行选择，如win32 win64 Linux。按照自身情况引入相应的 dll 或者so等。必须添加。没有的话，windows平台下会抛出`com.lti.civil.CaptureException`异常
    - `-Dplugin=src/plugins/fastpath/plugin.xml` 引入相应的插件配置xml。
    - `-Ddebug.mode=true` 开启Debug模式，按需添加
    - `-Dsmack.debugEnabled=true` 开启Smack Debug 模式，按需添加。添加后，在 Spark 启动后，同时启动 Smack 分析界面，可以用来记录分析 Spark 通信过程的消息包。

    ``` properties
    -Djava.library.path=build/lib/dist/windows
    -Dplugin=src/plugins/fastpath/plugin.xml
    -Ddebug.mode=true
    -Dsmack.debugEnabled=true
    ```

设置完毕后，我们就可以按照该Run config进行Run或者Debug了。运行后，就可以看到Spark的登录界面了。

![Run Spark][8]

输入可用的Openfire服务器以及用户名密码登录后，即可看到Spark的主界面了。Openfire服务器的搭建及简单使用详情请Google，这里就不予以说明。然而Fastpath插件，这里没有显示出来，原因在后面会提到。

![Spark][9]
若开启了Smack Debug，还会出现Smack Debug窗口。

![Smack Debug][10]

运行时，可能会出现`bin`目录拒绝访问的异常，原因是Spark自带的一个插件`LanguagePlugin`会在试图在运行目录下面寻找spark.jar，但是调试时`bin`目录下缺少spark.jar。该问题在spark安装版本时不会出现，调试时可以直接忽略，或者通过下面的`build release`生成`target\build\lib\spark.jar`，然后拷贝至MyEclipse的项目`bin`目录下面。

### Build

再来看看Spark客户端的构建，进入项目的Build目录中，查看build.xml，里面定义了各种build target。可以打开MyEclipse的Ant窗口，将该build文件加入其中。
![Ant Window][11]
直接运行默认的target：release。提示Build Successful，项目目录下新增了一个target文件夹。进入`target/build/bin`目录，然后运行 bat或者 sh文件，即可启动Spark。

执行Build任务时，可能会遇到Java 版本错误、编译版本错误等问题，导致Build 失败。留意Ant Build 文件中Java Version、Ant Version、Javac Target要求。

``` xml 
<fail if="ant.not.ok" message="Must use Ant 1.6.x or higher to build Spark"/>
<fail if="java.not.ok" message="Must use JDK 1.7.x or higher to build Spark"/>
```

``` xml
<javac destdir="${classes}"
               debug="true"
               source="1.7"
               target="1.7"
            >
```
在MyEclipse中的External Tool Configuration中可以配置指定的JRE来运行Ant任务。

Build之后，MyEclipse中的SparkDemo项目出现了错误提示，该错误是ANT 运行时产生的编译警告，可以在Problems窗口中删除该部分警告即可。

![Delete Compiling Warnings][12]

Build文件中还定义了其他的Target，如`clean`，Build后运行Clean执行清理任务; `installer.install4j` , 配合 Install4j生成 Spark 的安装包。可以根据需要进行使用，使用过程中遇到问题可根据 Ant报错提示来进行调整。

## Fastpath

### 运行Fastpath

在前面的[运行](#Run)过程中，并没有看到Fastpath插件的加载，这个是因为Fastpath插件中指定了Spark最低版本必须是2.7.0 ：`src/plugins/fastpath/plugin.xml`  
``` xml
<plugin>
    ...
    <minSparkVersion>2.7.0</minSparkVersion>
    <java>1.7.0</java>
</plugin>

```
而我们的Spark版本定义仍然是2.6.3：`src/java/org/jivesoftware/resource/default.properties`
``` properties
APPLICATION_NAME = Spark
SHORT_NAME = Spark
APPLICATION_VERSION = 2.6.3
```
我们这里可以将Spark版本改为2.7.0。然后再运行程序，就能看见正常加载进Fastpath插件了。
![Fastpath][13]

有时运行Spark后会碰到Spark中出现2个相同的插件，此时清空Spark工作目录再重新运行即可。Windows下`Win + R`输入 `%appdata%` 然后确定，进入AppData目录，删除Spark目录即可。

在Spark代码中，`src/java/org/jivesoftware/spark/PluginManager.java` 完成加载插件的任务。
`loadPlugins`方法中：
``` java
// Load extension plugins
loadPublicPlugins();

// For development purposes, load the plugin specified by -Dplugin=...
String plugin = System.getProperty("plugin");
```

开发时会以2种方式加载插件，就有可能会造成某些插件加载二次。
`loadPublicPlugin`方法中：
``` java
// Check for minimum Spark version
try {
    minVersion = plugin1.selectSingleNode("minSparkVersion").getText();

    String buildNumber = JiveInfo.getVersion();
    boolean ok = buildNumber.compareTo(minVersion) >= 0;

    if (!ok) {
        return null;
    }
}
catch (Exception e) {
    Log.error("Unable to load plugin " + name + " due to missing <minSparkVersion>-Tag in plugin.xml.");
    return null;
}
```

可以看到会对插件中定义的Spark最低版本进行检查，另外还有Java 版本、操作系统类型版本均有相应的匹配验证。

### Fastpath汉化

Spark的插件机制支持i18n国际化，Fastpath也默认支持了5种语言。在目录`src/plugins/fastpath/src/resources/i18n`下可以看到Fastpath的国际化文件，我们只需按照规范加入`fastpath_i18n_zh_CN.properties`就可以完成汉化操作。

## 消息扩展

Spark客户端实现的是XMPP的通信协议，构建于[Smack API][16]之上。Smack对于消息Packet的灵活扩展也提供了很好的支持，给即时通讯带来的功能性上的扩展。由于项目中要在在Fastpath应用中需要加入图片内容处理，但是Fastpath应用场景是多人聊天，默认不支持发送图片，因此这里考虑扩展`Message`，定义自己的图片`Packet`。本文的实现方式不太优雅：将图片转成BASE64编码后，以文本格式传递消息，然后在接收方对消息进行还原，显示图片信息。这种方式只能支持体积较小的图片。

### 定义Packet

实现一个图片消息类`ImageMessage`，实现`PacketExtension`，主要是定义自己的`Packet`的root element name、namespace、属性以及对应Packet的xml文本。root element name以及namespace名称可以随便取，不要与其他默认消息产生冲突就行。
``` java
@Override
public String getElementName() {
    return "cImg";
}

@Override
public String getNamespace() {
    return "xxxx:xmpp:image";
}

@Override
public String toXML() {
    StringBuilder sb = new StringBuilder();
    
    sb.append("<");
    sb.append(getElementName());
    sb.append(" xmlns=\"");
    sb.append(getNamespace());
    sb.append("\">");
    
    sb.append("<name>").append(name).append("</name>");
    sb.append("<type>").append(type).append("</type>");
    sb.append("<size>").append(size).append("</size>");
    sb.append("<encoded>").append(encoded).append("</encoded>");
    
    sb.append("</");
    sb.append(getElementName());
    sb.append(">");
    
    return sb.toString();
}
```

接着实现一个图片消息解析类`ImageMessageExtensionProvider`，实现`PacketExtensionProvider`，定义如何解析上面的自定义的`Packet`

``` java
@Override
public PacketExtension parseExtension(XmlPullParser parser)
        throws Exception {
    
    // customized packet message
    ImageMessage message = new ImageMessage();
    
    // parse raw XML stream and populate a message
    boolean done = false;
    while (!done) {
        int eventType = parser.next();
        if (eventType == XmlPullParser.START_TAG) {
            if (parser.getName().equals("name")) {
                message.setName(parser.nextText());
            }else if (parser.getName().equals("type")) {
                message.setType(parser.nextText());
            }else if (parser.getName().equals("size")) {
                message.setSize(Long.valueOf(parser.nextText()));
            }else if (parser.getName().equals("encoded")) {
                message.setEncoded(parser.nextText());
            }
        } else if (eventType == XmlPullParser.END_TAG) {
            if (parser.getName().equals(message.getElementName())) {
                done = true;
            }
        }
    }
    
    return message;
}
```

### 注册自定义Packet

在代码中进行自定义Packet的注册，可以选择在加载Fastpath插件时完成这项工作。在`src/plugins/fastpath/src/java/org/jivesoftware/fastpath/FastpathPlugin.java`中的`initialize`方法中加入
``` java
ProviderManager.getInstance()
            .addExtensionProvider("cImg", "xxxx:xmpp:image", new ImageMessageExtensionProvider());
```

### 解析自定义图片Packet

由于Fastpath没有自己处理消息并显示，用的是Spark消息处理模块。在`src/java/org/jivesoftware/spark/ui/TranscriptWindow.java`中的`insertMessage`方法中，能看到如下
``` java
// Check interceptors.
for (TranscriptWindowInterceptor interceptor : SparkManager.getChatManager().getTranscriptWindowInterceptors()) {
            boolean handled = interceptor.isMessageIntercepted(this, nickname, message);
            if (handled) {
                // Do nothing.
                return;
            }
}
```
因此可以通过消息拦截器来进行解析自定义的图片消息Packet。

这时我们实现一个`TranscriptWindowInterceptor`并注册到`ChatManager`中即可，这里直接让`FastpathPlugin.java`实现了该接口。
``` java
    @Override
    public boolean isMessageIntercepted(TranscriptWindow window, String userid,
            Message message) {
        
        String body = message.getBody();
        
        if (ModelUtil.hasLength(body)) {
            
            // 按照root element以及namespace筛选消息
            PacketExtension ext = message.getExtension("cImg", "xxxx:xmpp:image");
            
            if (ext != null) {
                // 转换成自定义的图片消息
                ImageMessage image = (ImageMessage) ext;
                
                // 获取到真正的图片信息
                ImageIcon icon = new ImageIcon(Base64.decodeBase64(image.getEncoded().getBytes()));
                window.insertIcon(icon);
                try {
                    window.insertText("\n");
                } catch (BadLocationException e) {
                    
                }
                
            }
            
        }
        // 继续处理其他
        return false;
    }
```

初始化插件时，将该`TranscriptWindowInterceptor`加载进`ChatManager`当中。
``` java
SparkManager.getChatManager().addTranscriptWindowInterceptor(this);
```

这样当我们的Spark加载了Fastpath插件后，就可以处理带有Image扩展的消息了。

### 发送图片消息

对于消息发送方，该怎样构建自己的图片扩展消息并发送出去呢？

构建图片扩展：
``` java
// 将图片文件用Base64转码
byte[] bytes = item.get();
String encode = new String(Base64.encodeBase64(bytes));

// 构造消息图片扩展
ImageMessage image = new ImageMessage();
image.setName(name);
image.setType(type);
image.setSize(size);
image.setEncoded(encode);
```
然后加入到消息中：
```
final Message chatMessage = new Message();
chatMessage.setType(Message.Type.groupchat);
chatMessage.setBody(image.getName() + " | " + image.getSize() + "B | " + image.getType());
// 添加扩展
chatMessage.addExtension(image);

String room = chat.getRoom();
chatMessage.setTo(room);
chat.sendMessage(chatMessage);
```

Fastpath中接收到图片如下：

![Image Message][14]

最后我们来看看搭载图片的XMPP消息包的具体内容：

![Image XMPP][15]

在message body的后面出现了我们的自定义扩展内容，`encoded`元素内存放的则是图片的Base64转码。

## 结语

开发过程中，由于参考资料较少，中间花费了不少时间，遇到几大方面的问题

- Spark、Openfire等一系列环境搭建，调试准备
- 定位需要进行修改的模块
- SWING开发
- Fastpath处理图片消息
- 利用install4j打包Spark安装程序
- Fastpath Web Client的二次开发

本文中提及到的内容只是其中的小部分。面对已有的大量源代码，没有技术文档可读，只能通过IDE去不断的溯源查找每一个引用的含义及实现，最终勉强完成功能需求。遗憾的是，读源代码时没有做好笔记，只顾着功能实现，刚刚准备写此文时，就觉部分内容略感生疏。

## 参考

1. [Smack解析自定义包结构][21]
2. [LOAD TESTING OPENFIRE FASTPATH][22]
3. [XMPP实现群聊截图(spark+openfire)][23]
4. [Openfire插件开发坏境配置指南][24]
5. [Looking for fastpath_webchat.war source code svn ??][25]
6. [Open Realtime.][26]

---
2014-7-18 12:34:46

[1]: https://igniterealtime.org/projects/openfire/index.jsp "Openfire"
[2]: https://igniterealtime.org/projects/spark/index.jsp "Spark"
[3]: https://igniterealtime.org/downloads/nightly_spark.jsp "Nightly Spark"
[16]: https://igniterealtime.org/projects/smack/index.jsp "Smack API" 
[5]: https://o35qld6sq.qnssl.com/img/project-jre.png
[6]: https://o35qld6sq.qnssl.com/img/source-config.png
[7]: https://o35qld6sq.qnssl.com/img/UserEntries.png
[8]: https://o35qld6sq.qnssl.com/img/RunSpark.png
[9]: https://o35qld6sq.qnssl.com/img/Spark.png
[10]: https://o35qld6sq.qnssl.com/img/SmarckDebug.png
[11]: https://o35qld6sq.qnssl.com/img/AntWin.png
[12]: https://o35qld6sq.qnssl.com/img/DeleteComplierWarnings.png
[13]: https://o35qld6sq.qnssl.com/img/Fastpath.png
[14]: https://o35qld6sq.qnssl.com/img/image-chat.png
[15]: https://o35qld6sq.qnssl.com/img/ImagePacket.png
[17]: https://o35qld6sq.qnssl.com/img/of.png

[21]: http://irusher.com/Smack%E8%A7%A3%E6%9E%90%E8%87%AA%E5%AE%9A%E4%B9%89%E5%8C%85%E7%BB%93%E6%9E%84/ "Smack解析自定义包结构"
[22]: http://naviger.com/?p=118 "LOAD TESTING OPENFIRE FASTPATH"
[23]: http://kurting615.iteye.com/blog/1162082 "XMPP实现群聊截图(spark+openfire)"
[24]: http://www.micmiu.com/opensource/openfire/openfire-plugins-build/ "Openfire插件开发坏境配置指南"
[25]: https://community.igniterealtime.org/message/233207#233207 "Looking for fastpath_webchat.war source code svn ??"
[26]: https://www.igniterealtime.org/ "Open Realtime."