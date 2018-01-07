const fs = require('fs')
const path = require('path')
const marked = require('marked')
const yaml = require('js-yaml')
const moment = require('moment')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')

const htmlPlugins = []

// posts
let posts = []
const postsPath = './src/posts/'
const files = fs.readdirSync(postsPath)
files.forEach(filename => {
  let filePath = postsPath + filename
  let postPath = filename.replace('md', 'html')
  let content = fs.readFileSync(filePath, 'utf8')

  // hexo format
  let meta = {}
  let yamlIndex = content.indexOf('---')
  if (yamlIndex > -1) {
    try {
      meta = yaml.safeLoad(content.substring(0, yamlIndex))
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
    path: postPath
  })

  htmlPlugins.push(
    new HtmlWebpackPlugin({
      meta: meta,
      content: markdown,
      template: './src/pages/post/post.ejs',
      filename: postPath,
      chunks: ['post'],
      inlineSource: '.css$'
    })
  )
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

// index
htmlPlugins.push(
  new HtmlWebpackPlugin({
    template: './src/pages/index/index.ejs',
    filename: 'index.html',
    posts: posts,
    chunks: ['index'],
    inlineSource: '.css$'
  })
)

module.exports = {
  entry: {
    index: './src/pages/index/index.js',
    post: './src/pages/post/post.js'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist'
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      },
      {
        test: /\.jpeg$/,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].css'
    }),
    ...htmlPlugins,
    new HtmlWebpackInlineSourcePlugin()
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  }
}
