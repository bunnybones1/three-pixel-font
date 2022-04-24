const path = require('path')
const webpack = require('webpack')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
// const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

module.exports = {
  mode: 'production',
  context: process.cwd(), // to automatically find tsconfig.json
  target: 'web',
  entry: {
    main: './src/index.ts'
  },
  output: {
    path: path.join(process.cwd(), 'lib'),
    filename: '[name]-[chunkhash].js',
    chunkFilename: 'bundle.[name]-[chunkhash].js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              projectReferences: true
            }
          }
        ],
        exclude: /node_modules/,
        include: [path.resolve(process.cwd(), 'src')]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(glsl|frag|vert)$/,
        exclude: /node_modules/,
        loader: 'glslify-import-loader'
      },
      {
        test: /\.(glsl|frag|vert)$/,
        exclude: /node_modules/,
        loader: 'raw-loader'
      },
      {
        test: /\.(glsl|frag|vert)$/,
        exclude: /node_modules/,
        loader: 'glslify-loader'
      },
      {
        test: /\.worker\.js$/,
        use: {
          loader: 'worker-loader',
          options: { name: 'worker.[hash].js' }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '~': path.join(process.cwd(), 'src'),
    },
    plugins: [
      // new TsconfigPathsPlugin()
    ]
  }
}
