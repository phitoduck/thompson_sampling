const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {

    devServer: {
    contentBase: path.resolve(__dirname, '.'),
    hot: true
    },
  entry: {
    // client: path.join(__dirname, 'src', 'javascript', 'client', 'Client.js'),
    thompson: path.join(__dirname, 'src', 'javascript', 'Thompson.js')
  },
  output: {
    filename: '[name].bundle.js', // will create client.bundle.js and server.bundle.js
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html'
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  mode: 'development' // lets you actually debug your files in the browser
};
