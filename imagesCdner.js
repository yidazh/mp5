const fs = require('fs')
const path = require('path')
const compressor = require('./compressor')
const uploader = require('./uploader')
const imagesDir = path.resolve(__dirname, './src/posts/images/')

const exec = (dirPath, destPath) => {
  const files = fs.readdirSync(dirPath)
  files.forEach(filename => {
    const filePath = path.resolve(dirPath, filename)
    const stats = fs.statSync(filePath)
    if (!stats.isFile()) {
      return
    }

    if (!/\.md$/.test(filename)) {
      return
    }

    const data = fs.readFileSync(filePath, 'utf8')
    const images = data.match(/!\[.*?\]\(.*?\)/g)

    if (images) {
      const urlList = []
      const promiseList = []
      images.forEach(image => {
        // 已经是cdn的无需重新上传
        const url = /\((.*)\)/.exec(image)[1]
        if (url.match(/^https?:\/\/[^\/]+file\.myqcloud\.com\//i)) {
          return
        }

        // 相同url无需重复上传
        if (urlList.includes(url)) {
          return
        } else {
          urlList.push(url)
        }

        if (url.match(/^https?:\/\//i)) {
          promiseList.push(
            compressor.compressRemote(url, imagesDir).then(filename => {
              return uploader.upload(path.resolve(imagesDir, filename), filename)
            })
          )
        } else {
          const imagePath = path.resolve(dirPath, url)
          promiseList.push(
            compressor.compressLocal(imagePath).then(filename => {
              return uploader.upload(imagePath, filename)
            })
          )
        }
      })

      let content = data
      Promise.all(promiseList)
        .then(values => {
          values.forEach((location, index) => {
            content = content.replace(urlList[index], location)
          })
        })
        .then(() => {
          fs.writeFile(filePath, content, err => {
            if (err) {
              throw err
            }
          })
        })
    }
  })
}

module.exports = {
  exec
}
