title: 'SSH Over GoAgent'
date: 2014-05-26 21:39:05
tags: 
- GoAgent
- Tunneling
- SSH
---

最近由于工作需要才得以开通公司的外网访问权限，不过是被墙过的外网，防火墙采用的是白名单的策略，墙外的大部分网站仍不能访问，其他80和443以外的端口更不用说了，直接封死。万幸的是，google.com.hk没有被墙，因此可以利用[GoAgent](https://code.google.com/p/goagent/)轻松突破。墙外的世界很精彩，不过好像无法满足我，能不能打通一条通往墙外的Tunnel、、、最终未能如愿。

<!-- more -->

由于有个外网的VPS，最直接、最容易想到的想法就是通过代理搭建一条SSH通道出去。虽然对SSH及其代理的概念的理解都不是很透彻，直接Google捣腾了~

## SSH Over Http Proxy ##

打开内网机器上的Xshell添加HTTP代理，地址为GoAgent的监听地址，然后愉快的点确定、连接。对、太天真了，It doesn’t work.

```   GoAgent【版本：3.1.11】日志
STRIP CONNECT https://hostname:22 HTTP/1.1
```

后台陆续通过Windows下的Putty、Linux下的SSH + [Corkscrew](http://www.agroman.net/corkscrew/)进行代理GoAgent连接，结果都一样同上。

简单一想，以为是请求的端口号是22而被GoAgent直接过滤了，下班回家后将外网VPS的SSH监听加了个443端口，在SSH的配置文件中加入443端口监听

``` 
Port 22
Port 443
```
第二天回公司继续尝试测试
``` bash
ssh hostname -v -p 443
```
没有想象中的眼前一亮，GoAgent依旧直接Strip CONNECT。 到现在为止，我还没有想过为什么SSH能够通过HTTP代理，也没有留意到以前一直没有 HTTP CONNECT 请求相关的概念。继续探索，会不会是代理识别出这不是HTTP请求而直接拒绝呢?


## SSH Over Stunnel ##

Google之后发现有个Stunnel的存在，可以提供SSL加密，就想把SSH用SSL封装一次丢给GoAgent，外网VPS再解密。
服务端Stunnel配置，监听443端口，将接收数据解密后传给22本机端口。
```
pid = /var/run/stunnel.pid
cert = /etc/stunnel/stunnel.pem
[ssh]
accept = 443
connect = 127.0.0.1:22
```

客户端Stunnel配置，监听443端口，将经过的数据加密后传给远程服务端的443。
```
pid = /var/run/stunnel.pid
cert = /etc/stunnel/stunnel.pem
client=yes
debug=debug
[ssh]
accept=443
connect=remote_host:443
```

这种加密方法本身完全没有问题，经测试可以正常通信，但是怎么样加上代理呢？可以这样配置,从而使用HTTPS代理。
```
pid = /var/run/stunnel.pid
cert = /etc/stunnel/stunnel.pem
client=yes
debug=debug
[ssh]
accept=443
connect=proxy_host:port
protocol=connect
protocolHost=remote_host:443
delay=yes
TIMEOUTbusy=120
TIMEOUTconnect=120
```

加上GoAgent的代理测试后还是一样的结果，不免让人顿觉气馁...



## HTTP CONNECT ##

经过多番的了解，渐渐的知道了以上用到的代理必须得通过HTTP CONNECT才行，白忙活了好些，汗！。HTTP CONNECT是HTTP/1.1特有的，而CONNECT方法是用来干嘛的呢？

{% blockquote W3C http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html Method Definitions %}
This specification reserves the method name CONNECT for use with a proxy that can dynamically switch to being a tunnel (e.g. SSL tunneling).
{% endblockquote %}

{% blockquote Wikipedia http://en.wikipedia.org/wiki/HTTP_CONNECT#Request_methods CONNECT %}
Converts the request connection to a transparent TCP/IP tunnel, usually to facilitate SSL-encrypted communication (HTTPS) through an unencrypted HTTP proxy.[15][16] See HTTP CONNECT Tunneling.
{% endblockquote %}

简单来讲就是常用作HTTPS代理。那么前面的测试过程中GoAgent不断直接STRIP CONNECT是为何？就开始研究GoAgent，GoAgent经过几年的茁壮成长，早已飞入平常百姓家，网上教程铺天盖地，我想要的东西却很少。不过GoAgent确实是造福广大人类了，作者真真是功德无量，也感谢下我的室友二鸟同学，早年把GoAgent介绍给我、、、



## GoAgent ##

经查找，慢慢理清其中的关系，GoAgent并不同于一般的HTTP代理，GoAgent利用Google App Enging（GAE）的URL fetch服务来实现核心代理请求。翻墙教程中Upload那一步就是上传代码把大家申请的空App部署成使用URL fetch进行代理请求的App。部署成功后的App的有二级地址：HTTPS://<appid>.appspot.com，这个也被GFW给屏蔽了，那我们怎样访问我们的APP从而用它来代理呢？网上搜了下，资料少，根据知乎网友贴的回答，意思就是谷歌服务的请求发给谷歌任何一台服务器就行,而墙内www.google.com www.google.com.hk 都是可以访问的，通过他们转至GAE，GAE再帮我们代理请求。

测试了下：浏览器通过GoAgent代理，GoAgent本身配置二级代理到[Fiddler](http://www.telerik.com/fiddler)，检测GoAgent发出的请求情况，因为GoAgent全程使用HTTPS加密传输，Fiddler未开启解密HTTPS时：GoAgent请求包清一色发给 www.google.com ，因为Fiddler是本地二级代理，所以只能看到CONNECT请求。

![GoAgent请求-HTTPS](https://2mih-static-1255626632.file.myqcloud.com/2014-05-20%252023-58-18.png)

开启Fiddler的HTTPS解密后，再看看CONNECT请求里的具体内容吧，一个CONNECT对应一个HTTPS，均是请求到GAE代理APP：appid.appspot.com

![GoAgent请求](https://2mih-static-1255626632.file.myqcloud.com/2014-05-20%252023-58-19.png)

GoAgent不支持传统CONNECT,那HTTPS本身是怎样进行代理的呢？就像Fiddler一样，将HTTPS解密再加密完成代理，也就是HTTPS内容在GAE上暴露过，所以GoAgent HTTPS代理本身并非安全的。因此，第一次运行GoAgent时需要导入证书。

画了一张GoAgent代理陆续流程图：

<iframe id="embed_dom" name="embed_dom" frameborder="0" style="border:1px solid #000;display:block;width:900px; height:700px;" src="https://www.processon.com/embed/537ca51f0cf27549ed2e26a0">
</iframe>

不会Patyhon，没法研究源代码，个人推测：我们的GoAgent接收到的CONNECT 请求（包括普通HTTPS请求、以及SSH代理请求）,会直接STRIP掉，然后视为HTTPS进行解密，解密之后再封装发给GAE。而我们的SSH包，自然无法按照SSL进行解密。就算用STUNNEL SSL 加密后发给GOAGENT，GOAGENT解密后发现这个不是HTTP请求，仍然没法封装给GAE。



## HTTP Tunneling Without CONNECT ##

到这里，似乎想从GoAgent里搭一条隧道出去，想来是无法实现了。不过还有HTTP tunneling without using CONNECT,就是通过HTTP来传递TCP消息，TCP OVER TCP，一个不是很优雅的实现。继续给人以希望、、、

这里用到了一个工具[HTTPTUNNEL](http://www.nocrew.org/software/httptunnel.html)，将我们的TCP包通过HTTP来传输。立马进行测试。分别在VPS以及家里的Liunx安装好HTTPTUNNEL。

服务端配置
``` bash
hts -S -M 20000 -F localhost:22 443
```
监听443，将收到的包按照HTTP格式进行还原，传给本地22

客户端配置
``` bash
htc -F 443  -S  -M 2000 REMOTE_HOST:443
```
监听443、将443的数据包包装成HTTP Request发到远程的443

然后我们在客户端执行：
``` bash
ssh localhost -v -p 443
```
可以看到成功建立连接，验证密码后成功登入远程主机。但是，加入代理后就尿了。

``` bash
./htc -F 8080 -P localhost:8087 -M 2000 -B 5k REMOTE_HOST:8080
```

```   GoAgent日志显示
INFO - [May 23 23:20:20] 127.0.0.1:39523 "URL GET http://REMOTE_HOST:8080/index.html?crap=1400858409 HTTP/1.1" 200 0
INFO - [May 23 23:20:31] 127.0.0.1:39528 "URL GET http://REMOTE_HOST:8080/index.html?crap=1400858420 HTTP/1.1" 200 0
INFO - [May 23 23:20:41] 127.0.0.1:39529 "URL GET http://REMOTE_HOST:8080/index.html?crap=1400858431 HTTP/1.1" 200 0
INFO - [May 23 23:20:52] 127.0.0.1:39534 "URL GET http://REMOTE_HOST:8080/index.html?crap=1400858441 HTTP/1.1" 200 0
INFO - [May 23 23:21:02] 127.0.0.1:39535 "URL GET http://REMOTE_HOST:8080/index.html?crap=1400858452 HTTP/1.1" 200 0
```

能看到Http 通信但是服务端返回的内容长度为0。后续用Windows下的Fiddler的看了下HTTP 通信，一样的情况：服务端返回Content-Length 不为0，但是内容为0，有点尴尬。

![SSH Over HTTP](https://2mih-static-1255626632.file.myqcloud.com/2014-05-20%252023-58-20.png)

后面并没有继续探索为什么经过代理这个工具就不能正常的发送HTTP包了。后面在网上找了下[HTTP代理](https://www.hidemyass.com/proxy-list/)作了下测试，该工具是可以走代理的，但我想本系列折腾应该到此结束了，是时候找本《HTTP权威指南》读一读啦。基本概念的理解缺失对于问题的判断产生了误导作用，瞎折腾也不是事儿。。。



## 参考 ##

+ {% link Tunnel over HTTPS http://stackoverflow.com/questions/181341/tunnel-over-https %}
+ {% link Tunneling SSH over HTTP(S) http://dag.wiee.rs/howto/ssh-http-tunneling/ %}
+ {% link Tunnel SSH Connections Over SSL Using ‘Stunnel’ On Debian 7 / Ubuntu 13.10 http://www.unixmen.com/tunnel-ssh-connections-ssl-using-stunnel-debian-7-ubuntu-13-10/  %}
+ {% link SSH over Stunnel for IDS evasion http://securityweekly.com/2013/05/ssh-over-stunnel-for-ids-evasi.html %}
+ {% link How is tunnelling SSH through Poxytunnel/HTTPS different from doing it through SSL with Stunnel? http://security.stackexchange.com/questions/7923/how-is-tunnelling-ssh-through-poxytunnel-https-different-from-doing-it-through-s %}
+ {% link SSH Through or Over Proxy http://daniel.haxx.se/docs/sshproxy.html  %}
+ {% link HTTP Tunnel使用的几种使用（经典） http://blog.csdn.net/zhangxinrun/article/details/5942260  %}




---
by 2mih
2014-05-23 23:53:29