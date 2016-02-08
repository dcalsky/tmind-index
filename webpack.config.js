var webpack = require('webpack');
var path = require('path');
var OpenBrowserPlugin = require('open-browser-webpack-plugin');
var autoprefixer = require('autoprefixer');
var precss       = require('precss');
var poststylus   = require('poststylus');

module.exports = {
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true,
    contentBase: './src/static',
    port: 8080
  },
  entry: [
    'webpack/hot/dev-server',
    'webpack-dev-server/client?http://localhost:8080',
    path.resolve(__dirname, 'src/script/main.js')
  ],
  output: {
    path: __dirname + '/build',
    publicPath: '/',
    filename: './bundle.js'
  },
  module: {
    loaders:[
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.js$/, loader: 'babel' },
      { test: /\.(png|jpg|woff)/, loader: 'url-loader' },
      { test: /\.styl$/, loader: 'style-loader!css-loader!stylus-loader' }
    ]
  },
  stylus: {
    use: [poststylus([ 'autoprefixer' ])
    ]
  },
  babel: {
    presets: ['es2015']
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new OpenBrowserPlugin({ url: 'http://localhost:8080' })
  ]
};
