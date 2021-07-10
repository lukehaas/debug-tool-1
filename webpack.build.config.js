const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const SRC_DIR = path.resolve(__dirname, 'src');
const OUTPUT_DIR = path.resolve(__dirname, 'dist');

const defaultInclude = [SRC_DIR];

const mainThreadConfig = {
  entry: {
    entry: SRC_DIR + '/main/index.js',
  },
  output: {
    path: OUTPUT_DIR,
    publicPath: '/',
    filename: '[name]-bundle.js',
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  target: 'electron-main',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js?$/,
        use: [{ loader: 'babel-loader' }],
        include: defaultInclude,
        exclude: /node_modules/,
      },
    ],
  },
};

const renderThreadConfig = {
  entry: {
    index: SRC_DIR + '/renderer/index.js',
  },
  output: {
    path: OUTPUT_DIR,
    publicPath: '/',
    filename: '[name]-bundle.js',
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js?$/,
        use: [{ loader: 'babel-loader' }],
        include: defaultInclude,
        exclude: /node_modules/,
      },
      {
        test: /\.(jpe?g|png|gif|ico|icns)$/,
        use: [{ loader: 'file-loader', options: { name: '[name].[ext]' } }],
        include: defaultInclude,
        exclude: /node_modules/,
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'file-loader',
            options: { name: '[name].[ext]', publicPath: './' },
          },
        ],
        include: defaultInclude,
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        include: defaultInclude,
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json'],
  },
  target: 'electron-renderer',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/static/index.html',
      inject: false,
    }),
    new MiniCssExtractPlugin({
      moduleFilename: ({ name }) => '[name].css',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
  stats: {
    colors: true,
    children: false,
    chunks: false,
    modules: false,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_fnames: true,
        },
      }),
    ],
  },
};

module.exports = [mainThreadConfig, renderThreadConfig];
