const fs = require('fs')
const path = require('path')
const compressor = require('./compressor')
const uploader = require('./uploader')
const uploadExts = ['js', 'css', 'png', 'jpg', 'jpeg', 'gif']
const compressExts = ['png', 'jpeg', 'jpg']
const mark = path.resolve(__dirname, '.upload')

let upload = []

if (fs.existsSync(mark)) {
  upload = fs.readFileSync(mark, 'utf8').split(/\r\n|\n/)
} else {
  fs.writeFileSync(mark, '', 'utf8')
}

class CdnPlugin {
  apply(compiler) {
    compiler.plugin('after-emit', (compilation, callback) => {
      const list = []
      Object.keys(compilation.assets).forEach(asset => {
        const ext = /\.([^\.]+)$/.exec(asset)[1]
        const filePath = compilation.assets[asset].existsAt
        if (uploadExts.includes(ext) && !upload.includes(asset)) {
          let promise = null
          if (compressExts.includes(ext)) {
            promise = compressor.compressLocal(filePath).then(() => {
              uploader.upload(filePath, asset)
            })
          } else {
            promise = uploader.upload(filePath, asset)
          }

          list.push(
            promise.then(() => {
              upload.unshift(asset)
              fs.writeFileSync(mark, upload.join('\n'), 'utf8')
            })
          )
        }
      })
      Promise.all(list).then(() => {
        callback()
      })
    })
  }
}

module.exports = CdnPlugin
