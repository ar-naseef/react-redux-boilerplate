// For info about this file refer to webpack and webpack-hot-middleware documentation
// For info on how we're generating bundles with hashed filenames for cache busting: https://medium.com/@okonetchnikov/long-term-caching-of-static-assets-with-webpack-1ecb139adb95#.w99i89nsz
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const Dotenv = require('dotenv-webpack');

const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify('dist'),
  __DEV__: false,
};

module.exports = {
  resolve: {
    extensions: ['*', '.js', '.jsx', '.json'],
  },
  devtool: 'source-map', // more info:https://webpack.github.io/docs/build-performance.html#sourcemaps and https://webpack.github.io/docs/configuration.html#devtool
  entry: path.resolve(__dirname, 'src/index.js'),

  target: 'web', // necessary per https://webpack.github.io/docs/testing.html#compile-and-test
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].[hash].js',
  },
  plugins: [
    // Includes values declared in .env file
    new Dotenv({
      path: path.resolve(__dirname, '.env'), // Path to .env file (this is the default)
      safe: false, // load .env.example (defaults to "false" which does not use dotenv-safe)
    }),

    // Hash the files using MD5 so that their names change when the content changes.
    new WebpackMd5Hash(),

    // Tells React to build in prod mode. https://facebook.github.io/react/downloads.html
    new webpack.DefinePlugin(GLOBALS),

    // Generate an external css file with a hash in the filename
    new ExtractTextPlugin('[name].[hash].css'),
    new webpack.ProvidePlugin({
      React: 'react',
    }),

    // Minify JS
    new webpack.optimize.UglifyJsPlugin({ sourceMap: false }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
      noInfo: true, // set to false to see a list of every file being bundled.
      options: {
        sassLoader: {
          includePaths: [path.resolve(__dirname, 'src', 'scss')],
        },
        context: '/',
        postcss: () => [autoprefixer],
      },
    }),
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.(js|html)$/,
      threshold: 10240,
      minRatio: 0.8,
    }),

    // Generate HTML file that contains references to generated bundles. See here for how this works: https://github.com/ampedandwired/html-webpack-plugin#basic-usage
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(__dirname, 'src', 'index.html'),
      // favicon: 'src/favicon.ico',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: false,
        minifyCSS: false,
        minifyURLs: false,
      },
      inject: true,
      // Note that you can add custom options here if you need to handle other custom logic in index.html
      // To track JavaScript errors via TrackJS, sign up for a free trial at TrackJS.com and enter your token below.
      trackJSToken: '',
    }),
  ],
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules(?!\/webpack-dev-server)/, loader: 'babel-loader' },
      { test: /\.eot(\?v=\d+.\d+.\d+)?$/, loader: 'url-loader?name=[name].[ext]' },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff&name=[name].[ext]' },
      { test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/octet-stream&name=[name].[ext]' },
      { test: /\.svg(\?v=\d+.\d+.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=image/svg+xml&name=[name].[ext]' },
      { test: /\.(jpe?g|png|gif)$/i, loader: 'file-loader?name=[name].[ext]' },
      { test: /\.ico$/, loader: 'file-loader?name=[name].[ext]' },
      { test: /(\.css|\.scss|\.sass)$/, loader: ExtractTextPlugin.extract('css-loader?sourceMap!postcss-loader!sass-loader?sourceMap') },
    ],
  },
  devServer: {
    historyApiFallback: {
      index: '/',
    },
  },
};
