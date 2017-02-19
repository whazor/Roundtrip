var path = require("path");
var webpack = require('webpack');

module.exports = {
  devtool: 'cheap-module-source-map',
    //devtool: 'inline-source-map',


  context: path.resolve(__dirname, './assets/js'),
  entry: [

    // 'react-hot-loader/patch',
    // // activate HMR for React
    //
    // 'webpack-dev-server/client?http://localhost:3000',
    // // bundle the client for webpack-dev-server
    // // and connect to the provided endpoint
    //
    // 'webpack/hot/only-dev-server',
    './index.jsx'
  ],

  output: {
    path: path.resolve(__dirname, 'static/'),
    filename: 'bundle.js',
    //publicPath: '/static/'
      publicPath: 'http://localhost:3000/static/'
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/],
        loader: 'babel-loader'
      },


      // Loaders for other file types can go here
    ]
  },

  resolve: {
    modules: ['node_modules'],
    // alias: {
    //     'rxjs': 'rxjs-es'
    // }
  },
    plugins: [
        //new webpack.HotModuleReplacementPlugin(),
        //new webpack.optimize.OccurenceOrderPlugin(),

        // new webpack.HotModuleReplacementPlugin(),
        // enable HMR globally

        new webpack.NamedModulesPlugin(),
        // prints more readable module names in the browser console on HMR updates

        new webpack.NoEmitOnErrorsPlugin(),
        // do not emit compiled assets that include errors
        new webpack.ProvidePlugin({
            "React": "react",
            "jQuery": "jquery",
        }),
  ],
  devServer: {
    host: 'localhost',
    port: 3000,

    historyApiFallback: true,
    // respond to 404s with index.html

    hot: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
    // enable HMR on the server
  },
};
