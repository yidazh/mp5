const fs = require('fs')
const path = require('path')
const marked = require('marked')
const yaml = require('js-yaml')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const htmlPlugins = []

// posts
const posts = []
const postsPath = './src/posts/'
const files = fs.readdirSync(postsPath)
files.forEach(filename => {
  let filePath = postsPath + filename
  let postPath = filename.replace('md', 'html')
  let content = fs.readFileSync(filePath, 'utf8')
  let meta = {}
  let yamlIndex = content.indexOf('---')
  if (yamlIndex > -1) {
    try {
      meta = yaml.safeLoad(content.substring(0, yamlIndex))
      content = content.substr(yamlIndex + 3)
    } catch (error) {
    }
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
    path: postPath
  })

  htmlPlugins.push(
    new HtmlWebpackPlugin({
      meta: meta,
      content: markdown,
      template: './src/templates/post.ejs',
      filename: postPath
    })
  )
})

// index
htmlPlugins.push(new HtmlWebpackPlugin({
  template: './src/templates/index.ejs',
  filename: 'index.html',
  posts: posts
}))

module.exports = {
  entry: {
    index: './src/index.js'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist'
  },
  plugins: htmlPlugins,
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 9000
  }
}
