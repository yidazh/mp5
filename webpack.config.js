const fs = require('fs')
const path = require('path')
const webpack = require('webpack')

const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
const ProvidePlugin = webpack.ProvidePlugin
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')
const CdnPlugin = require('./cdnPlugin')

const parser = require('./mdParser')
const postsPath = path.resolve(__dirname, './src/posts/')
const posts = parser.parse(postsPath)

// post pages
const htmlPlugins = posts.map(post => {
  return new HtmlWebpackPlugin({
    meta: post.meta,
    content: post.content,
    template: './src/pages/post/post.ejs',
    filename: post.name,
    chunks: ['post'],
    inlineSource: '.css$'
  })
})

// index page
htmlPlugins.push(
  new HtmlWebpackPlugin({
    template: './src/pages/index/index.ejs',
    filename: 'index.html',
    posts: posts,
    chunks: ['index'],
    inlineSource: '.css$'
  })
)

const plugins = [
  new ProvidePlugin({
    hljs: path.resolve(__dirname, 'src/highlight/highlight.pack.js')
  }),
  new ExtractTextPlugin({
    filename: '[name].[contenthash].css'
  }),
  ...htmlPlugins,
  new HtmlWebpackInlineSourcePlugin()
]

let publicPath = ''
if (process.env.NODE_ENV === 'production') {
  publicPath = 'https://2mih-static-1255626632.file.myqcloud.com/'
  plugins.push(new CdnPlugin())
  plugins.push(
    new UglifyJsPlugin({
      test: /\.js$/i
    })
  )
}

module.exports = {
  entry: {
    index: './src/pages/index/index.js',
    post: './src/pages/post/post.js'
  },
  output: {
    filename: '[name].[hash].js',
    path: __dirname + '/dist',
    publicPath
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader'],
          publicPath
        })
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader'],
          publicPath
        })
      },
      {
        test: /\.(jpeg|png|gif|jpg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[hash].[ext]',
              publicPath
            }
          }
        ]
      }
    ]
  },
  plugins,
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  }
}
