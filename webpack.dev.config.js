const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { spawn } = require('child_process');

const SRC_DIR = path.resolve(__dirname, 'src');
const OUTPUT_DIR = path.resolve(__dirname, 'dist');

const defaultInclude = [SRC_DIR];

module.exports = {
  entry: {
    index: SRC_DIR + '/renderer/index.js',
  },
  output: {
    path: OUTPUT_DIR,
    publicPath: '/',
    filename: chunkData => {
      return `${chunkData.chunk.name}-bundle.js`;
    },
  },
  mode: 'development',
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
        use: [{ loader: 'file-loader', options: { name: '[name].[ext]' } }],
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
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
  devtool: 'cheap-source-map',
  devServer: {
    contentBase: OUTPUT_DIR,
    stats: {
      colors: true,
      chunks: false,
      children: false,
    },
    before() {
      // '--js-flags="--help"' - see available flags
      // --expose-internals
      spawn('electron', ['./src/main/'], {
        shell: true,
        env: process.env,
        stdio: 'inherit',
      })
        .on('close', () => process.exit(0))
        .on('error', spawnError => console.error(spawnError));
    },
  },
};
