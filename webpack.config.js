const fs = require('fs')
const path = require('path')
const marked = require('marked')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const htmlPlugins = []
const postsPath = './src/posts/'
const files = fs.readdirSync(postsPath)
files.forEach(filename => {
  const filePath = postsPath + filename
  const content = fs.readFileSync(filePath, 'utf8')
  htmlPlugins.push(
    new HtmlWebpackPlugin({
      content: marked(content),
      template: './src/templates/index.ejs',
      filename: filename.replace('md', 'html')
    })
  )
})

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
