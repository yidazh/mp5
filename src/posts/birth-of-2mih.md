title: 'About 2mih.com'
date: 2014-06-08 10:50:23
categories: 
- Blog
tags: 
- Hexo
- Blog
---

博客已经跑了2星期了，想想还是得写点总结什么的。没有精力写成类似教程一样Step By Step的文章，就挑选几个方面作下记录。

## 静态博客

由于体验DO的VPS的缘故，利用LNMP一键安装包火速在VPS上搭好了环境，就想着把以前落下的博客事业捡起来。下载Wordpress后，分分钟一个WP站就建好了。我都几乎没想过，我为什么要去安装Wordpress，或许是习惯于那些熟悉的事物吧。

Wordpress不好么？好！公司的内部系统感觉Wordpress都能实现，我只是希望体验下新鲜的东西。醒悟之后，就不断的去找Wordpress的替代品：Typecho、FarBox、Jekyll、Hexo、Blogger、Octopress、Ghost、Medium... 犹如乱花渐欲迷人眼，有动态的也有静态的，有博客发布托管一站式的，也有单纯的博客发布框架。但有个共通点就是让写博客变得更简单更专注。稍作了解后，[Hexo][1]成功吸引了我的目光。

> A fast, simple & powerful blog framework, powered by Node.js.

因为简单，并且自己后面也想尝试下Node.js，这里选择了[Hexo][1]。其他新奇玩意儿都没玩过，这里也没法给出比较，自己够用就行。关于Hexo的使用，详见[Hexo官网][1]。

<!-- more -->

## 部署与同步

Hexo自带支持部署至Github Pages, 但由于想把站点放在VPS上，我就不能享受 `$ hexo deploy` 一键部署的便利了。前期没做研究，就老老实实本地生成文件，然后上传至服务器，整个过程过于零碎而繁琐。Google之后，得出2种方案：

- 类似使用Hexo FTP 部署插件，上传至服务器

  这种方案就是用程序来代替手工上传文件，FTP或许是其中的一种

- 在VPS里安装Hexo、Dropbox，把Hexo需要经常改动的同步至Dropbox，利用 `$ hexo generate -w`来实时监控，达到同步部署的目的。[传送门][2]

  该方案有点像FarBox + Dropbox，因为要开启Dropbox以及 `generate --watch`，会比较吃VPS的资源。好处就是只要将写好的POST 提交至Dropbox即可自动发布，支持移动端。
  
基于自己的实际情况，并没有继续考虑这样做。没有手机或者其他PC上发布POST的需求，自己一个POST也得花好久才能出生，用云服务同步下自己的Markdown即可。目前用的是马克飞象 + Evernote，md以及html笔记 两不误。

---

_下面记录下博客程序中具体的方面_

## 评论

![多说](https://2mih-static-1255626632.file.myqcloud.com/ff80808142c5ed7f0142c6bb08cc12fe.png)

由于Hexo很多主题使用国际上流行的第三方评论：Disqus，有人(包括我)可能希望替换成本土的多说、友言之类。部分主题已经改成默认[多说][10]，只需在主题的配置文件里配置好多说的 `shortname` 即可。

    short_name: sn
 
对于那些没有默认支持多说的主题，添加多说模块则要动下小手术了，以主题[phase][3]为例，在主题的`layout\_partial`下面修改下`comment.ejs`,追加

``` 
<% if (config.duoshuo_shortname && page.comments){ %>
    <!-- 多说通用代码 -->
    <!-- 多说评论框 start -->
	<div class="ds-thread"></div>
    <!-- 多说评论框 end -->
    <!-- 多说公共JS代码 start (一个网页只需插入一次) -->
    <script type="text/javascript">
    
    // 这里用配置的方式填入多说shortname
    var duoshuoQuery = {short_name:"<%= config.duoshuo_shortname%>"};
	(function() {
		var ds = document.createElement('script');
		ds.type = 'text/javascript';ds.async = true;
		ds.src = (document.location.protocol == 'https:' ? 'https:' : 'http:') + '//static.duoshuo.com/embed.js';
		ds.charset = 'UTF-8';
		(document.getElementsByTagName('head')[0] 
		 || document.getElementsByTagName('body')[0]).appendChild(ds);
	})();
	</script>
    <!-- 多说公共JS代码 end -->
<% } %>
```
然后我们在Hexo配置文件`_config.yml`里配置duoshuo_shortname
```
# Disqus
disqus_shortname:
# 多说
duoshuo_shortname: #你的多说shortname#
```

配置完成后，可能会发现Index下的POST摘要也会出现评论模块，这时需修改下`layout\_partial\article.ejs`

```
<%- partial('comment') %>
```

改成

```
<% if(!index){ %>
<%- partial('comment') %>
<% } %>
```

OK,完成。这里用配置的方式填入多说shortname，稍微麻烦了点，但是避免了将与shortname绑定的通用多说代码直接硬编码到代码中。如果我们想启用Disqus、停用多说时，修改配置文件，将`duoshuo_shortname`留空即可。同时，如果新建partial想调用多说时，直接从 `config.duoshuo_shortname` 获取配置参数即可。

## 监控与统计

#### 统计

访问统计采用了Google Analytics，同时也一并开启了Google 站长工具。不过，由于国内的特殊环境，Google服务在国内的可用性真是让人捉急，GA的`ga.js`常常无法加载，网站用到的Google Web Fonts也时时阵亡。受不了这些的可以采用国内的替代品，百度统计、站长工具等。

![Google Analytics](https://2mih-static-1255626632.file.myqcloud.com/Google-Analytics-Long.png)

#### 监控

监控则采用了[监控宝][11]配合SNMP进行主机环境监控，网站刚搭好时监控的实际意义小于形式意义。启用监控宝的服务器监控主要在于服务器启用SNMP，SNMP配置恰当，做好安全措施，修改community字符串，限制外网SNMP访问IP等。

![监控宝](https://2mih-static-1255626632.file.myqcloud.com/2014-06-08%252009-44-10.png)

## 其他
- 主机是[Digital Ocean][7]的，一个10$的代金券成功把我留住...

- 网站域名是在[狗爹][8]注册的，用的是[DNSPod][9]的NS。[DNSPod][9]自身还带有网站访问性监测。

- 图床用的是[七牛][12]，免费方案就够用了。本还想通过自己的二级域名替代七牛的二级域名，以后便于数据迁移。七牛支持自定义域名，但是必须得备案，哭。不想备案，还是继续用七牛二级的吧，如`https://o35qld6sq.qnssl.com/img/2014-06-08%2009-44-10.png`。

- wwww二级域名, 也就是www.2mih.com，默认301跳转至2mih.com，采用的是nginx return的方式：

    ```
    server  {
        server_name www.2mih.com;
        return 301 $scheme://2mih.com$request_uri;
    }
    ```
    
- VPS修改默认SSH端口号，修改登录名或者直接禁用密码登录。总有人会扫你的22，并且尝试暴力破解...
  之前没禁用密码登录、没禁用root、没改22：

  ```
  grep "Failed password for root" /var/log/secure-20140601 | awk '{print $11}' | sort | uniq -c | sort -nr | more
  ```
  `219.138.135.65` 想破解root密码，尝试了大概10w次...

- Hexo主题资源略匮乏，Google出来的很多Hexo站的主题都是相同的几款。我暂时也不纠结这个了，选了个简洁明了的[主题][18]，有兴趣有想法的时候再去自己DIY吧。
## 参考

1. [VPS 防止 SSH 暴力登录尝试攻击][12]
2. [HEXO 使用多说评论插件][13]
3. [hexo优化及主题Landscape-F][14]
4. [hexo你的博客][15]
5. [Hexo 服务器端布署及 Dropbox 同步][2]
6. [怎样搭建一个自有域名的WordPress博客][16]
7. [LNMP一键安装包][17]
8. [Hexo][1]

---
2014-06-08 10:28:20


[1]: http://hexo.io "Hexo"
[2]: http://lucifr.com/2013/06/02/hexo-on-cloud-with-dropbox-and-vps/ "Hexo 服务器端布署及 Dropbox 同步"
[3]: https://github.com/hexojs/hexo-theme-phase "Phase"
[4]: https://o35qld6sq.qnssl.com/img/Google-Analytics-Long.png "Google Analytics"
[5]: https://o35qld6sq.qnssl.com/img/2014-06-08%2009-44-10.png "监控宝"
[6]: https://o35qld6sq.qnssl.com/img/ff80808142c5ed7f0142c6bb08cc12fe.png "多说"
[7]: https://www.digitalocean.com/?refcode=9caf65aedbc6 "Digital Ocean"
[8]: http://www.godaddy.com/ "GoDaddy"
[9]: https://www.dnspod.cn/ "DNSPod"
[10]: http://duoshuo.com/ "多说"
[11]: http://www.jiankongbao.com/ "监控宝"
[12]: http://www.lovelucy.info/vps-anti-ssh-login-attempts-attack.html "VPS 防止 SSH 暴力登录尝试攻击"
[13]: http://axb.me/hexo-duoshuo.html "HEXO 使用多说评论插件"
[14]: http://howiefh.github.io/2014/04/20/hexo-optimize-and-my-theme-landscape-f/ "hexo优化及主题Landscape-F"
[15]: http://ibruce.info/2013/11/22/hexo-your-blog/ "hexo你的博客"
[16]: http://www.zhihu.com/question/19594033?group_id=121391355 "怎样搭建一个自有域名的WordPress博客"
[17]: http://lnmp.org/ "LNMP一键安装包"
[18]: https://github.com/tommy351/hexo/wiki/Themes "Hexo Themes"