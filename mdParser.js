const fs = require('fs')
const path = require('path')
const moment = require('moment')
const yaml = require('js-yaml')
const marked = require('marked')

const renderer = new marked.Renderer()
renderer.codespan = code => {
  return `<code class="inline">${code}</code>`
}
renderer.link = (href, title, text) => {
  return `<a href="${href}" title="${title}" target="_blank">${text}</a>`
}
marked.setOptions({
  renderer: renderer,
  pedantic: false,
  gfm: true,
  tables: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
})

const parse = postsPath => {
  let posts = []

  const files = fs.readdirSync(postsPath)
  files.forEach(filename => {
    let filePath = path.join(postsPath, filename)
    let stats = fs.statSync(filePath)
    if (!stats.isFile() || !filename.endsWith('.md')) {
      return
    }

    let name = filename.replace('md', 'html')
    let content = fs.readFileSync(filePath, 'utf8')

    // hexo format
    let meta = {}
    let yamlIndex = content.indexOf('---')
    if (yamlIndex > -1) {
      try {
        meta = yaml.safeLoad(content.substring(0, yamlIndex))
        meta.id = filename.replace(/\..*$/, '')
        content = content.substr(yamlIndex + 3)
        if (meta.date instanceof Date) {
          meta.date = moment(meta.date).format('YYYY-MM-DD')
        } else {
          meta.date = ''
        }
      } catch (error) {}
    }

    let markdown = marked(content)
    let summary = ''
    let summaryIndex = markdown.indexOf('<!-- more -->')
    if (summaryIndex > -1) {
      summary = markdown.substr(0, summaryIndex)
    }

    posts.push({
      meta,
      summary,
      name,
      content: markdown
    })
  })

  // sort
  posts.sort((x, y) => {
    if (x.meta.date && y.meta.date) {
      return moment(y.meta.date).valueOf() - moment(x.meta.date).valueOf()
    } else if (x.meta.date) {
      return -1
    } else if (y.meta.date) {
      return 1
    } else {
      return 0
    }
  })

  return posts
}

module.exports = {
  parse
}
