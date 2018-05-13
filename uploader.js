const fs = require('fs')
const COS = require('cos-nodejs-sdk-v5')

const appId = '1255626632'
const secretId = 'COS_SECRET_ID'
const secretKey = 'COS_SECRET_KEY'
const bucket = '2mih-static'
const region = 'COS_REGION'

const cos = new COS({
  SecretId: secretId,
  SecretKey: secretKey
})

const putObject = (path, key, callback) => {
  const buffer = fs.readFileSync(path)
  cos.putObject(
    {
      Bucket: `${bucket}-${appId}`,
      Region: region,
      Key: key,
      ContentLength: buffer.length,
      Body: fs.createReadStream(path)
    },
    callback
  )
}

const MAX_RETRY = 2
const upload = (path, key) => {
  return new Promise((resolve, reject) => {
    let retry = 0
    const cb = (err, data) => {
      if (err) {
        if (retry < MAX_RETRY) {
          retry++
          console.log(`retry ${path}`, retry)
          putObject(path, key, cb)
        } else {
          reject(err)
        }
        return
      }

      const location = data.Location
      const domain = /^https?:\/\/([^\/]+)\//.exec(location)[1]
      const cdnLocation = location.replace(domain, '2mih-static-1255626632.file.myqcloud.com')
      resolve(cdnLocation)
    }

    putObject(path, key, cb)
  })
}
module.exports = {
  upload
}
