const webpack = require('webpack');

let PATHS = {
  entry:  __dirname + '/frontend/app/entry.js',
  build:  __dirname + '/frontend/build'
};

module.exports = {
  entry: PATHS.entry,
  output: {
    path:     PATHS.build,
    filename: 'bundle.js'
  }, 
  module: {
    loaders: [
      {
        test: /\.js$/, 
        loaders: ['babel'],
        include: __dirname + '/frontend/app'
      }, 
      {
        test: /\.css$/,
        loaders: ['style', 'css']
      }
    ]
  }, 
  devServer: {
    devtool:            'eval-source-map',
    contentBase:        PATHS.build, 
    historyApiFallback: true,
    hot:                true,
    inline:             true,
    progress:           true,
    stats:              'errors-only'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};
