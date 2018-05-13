const path = require('path')
const scanner = require('./scanner')

scanner.scan(path.resolve(__dirname, './src/posts'))