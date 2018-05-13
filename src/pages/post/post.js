require('../../highlight/styles/github.css')
require('./post.scss')
const codeBlock = document.querySelectorAll('pre code')
Array.prototype.forEach.call(codeBlock, function (block) {
  hljs.highlightBlock(block)
})
