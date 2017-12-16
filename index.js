const fs = require('fs')
const yaml = require('js-yaml')
const marked = require('marked')

const content = fs.readFileSync('./src/posts/birth-of-2mih.md', 'utf8')
const info = /^([\s\S]*?)[\n|\r\n]?---[\n|\r\n]/.exec(content)[1]
const metas = yaml.safeLoad(info)
console.log(JSON.stringify(metas))

