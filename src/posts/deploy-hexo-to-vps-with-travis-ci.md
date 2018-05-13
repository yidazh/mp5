title: '利用Travis CI自动部署Hexo至VPS'
date: 2017-01-22
categories:
- Blog
tags:
- Hexo
- Travis CI
- VPS

---

![Travis CI](https://2mih-static-1255626632.file.myqcloud.com/Travis-CI-logo.jpg)

之前博客都是本地用`Hexo`生成好了，手动上传至`VPS`，可能由于写的少所以虽觉繁琐但还不是很麻烦。最近又更了一票，想起之前经常看到的`Travis CI`自动部署至`Github Pages`，想来我也应该弄下持续集成。

打开`Travis CI`文档看了看，大概明白了，`Travis CI`把Repo克隆下来，然后按照配置文件，一步一步搭建环境，执行脚本达到部署的目的。到了`Hexo`这里，自然很简单，配好`node`环境，`npm install`后，执行`hexo g`即可得到我们要部署的`public`内容。

<!-- more -->

就是最后一步，把生成的静态文件部署至目标位置上，这个稍微麻烦点。`Google`出来的参考文章大多都是自动部署至`Github Pages`，看了下他们的脚本，通过`Git`将`public`提交至对应的`Git`仓库即可。可以用`Heox`自带的`deploy`也可以用写脚本提交`Git`。
 - [使用 Travis CI 自動發布 hexo 到 Github pages](https://levirve.github.io/2016/hexo-deploy-through-travisci/)
 - [使用Travis CI自动部署你的Hexo博客到Github上](https://xin053.github.io/2016/06/05/Travis%20CI%E8%87%AA%E5%8A%A8%E9%83%A8%E7%BD%B2Hexo%E5%8D%9A%E5%AE%A2%E5%88%B0Github/)

里面关键点就是需要通过本地的`Travis`加密`Github`的仓库`Token`，然后自动部署时`Travis`会解密`Token`来获取部署所需的访问凭证。这样确保我们可以把凭证上传至公开`repo`。

我这里需要的把内容部署至自有的`VPS`，同样是需要加密访问凭证，细节有点不一样。参考了下这篇。
 - [Travis CI deployments to DigitalOcean](https://kjaer.io/travis/)

可以通过`Travis`在本地加密`ssh`的`private key`，同事`Travis`也把解密的脚本内容自动填充至`.travis.yml`里了。
```
travis encrypt-file travis_key --add
```
会生成一个`travis_key.enc`，这个就是我们的`ssh key`加密后的文件了，可以上传至公开`repo`。

自动部署时，`Travis`就能通过解密得到的`key`访问我们的`VPS`了，上面这个博主有了`key`之后选择用`Git`的方式把文件上传至`VPS`，个人觉得`rsync`更方便。
```
rsync -vr public/* -e ssh travis@2mih.com:/home/travis/public/
```

有2个地方注意下：
 - 要在`Travis`配置文件中加入`ssh_known_hosts`，把我们的目标`host`配进去，不然我们通过`ssh`连接时，会出现`warning`，需要对话确认，直接pending了自动脚本的执行。最初不知道有这个配置，还傻傻的在`Travis`里配置生成`.sss/config`，将对应`Host`的`StrictHostKeyChecking`设置成`no`去解决这个问题。

- `ssh key`解密后，需要改下权限，默认604，也会造成pending的。

有需要的可以去[Blog](https://github.com/yidazh/blog)参考下具体配置。

YidaZh  
2017-01-22
