const path = require('path')
const tinify = require('tinify')
tinify.key = 'TINY_PNG_KEY'

const compressLocal = filePath => {
  const filename = filePath.match(/\/([^\/\?]+)(\?.*)?$/)[1]
  return new Promise((resolve, reject) => {
    tinify.fromFile(filePath).toFile(filePath, err => {
      if (err) {
        reject(err)
      } else {
        resolve(filename)
      }
    })
  })
}

const compressRemote = (url, dir) => {
  const filename = url.match(/\/([^\/\?]+)(\?.*)?$/)[1]
  const filePath = path.resolve(dir, filename)

  return new Promise((resolve, reject) => {
    tinify.fromUrl(url).toFile(filePath, err => {
      if (err) {
        reject(err)
      } else {
        resolve(filename)
      }
    })
  })
}

module.exports = {
  compressLocal,
  compressRemote
}
