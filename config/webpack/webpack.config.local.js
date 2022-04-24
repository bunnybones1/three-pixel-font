const path = require('path')
const webpack = require('webpack')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
// const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')

let dist = process.env.DIST
if (!dist || dist === '') {
  dist = 'local'
}

module.exports = dist => ({
  context: process.cwd(), // to automatically find tsconfig.json
  entry: {
    main: './src/test.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'test.js',
    publicPath: '/',
    globalObject: 'this'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        GITCOMMIT: JSON.stringify('dev'),
        MODE_ENV: JSON.stringify(dist ? dist.MODE_ENV : '')
      }
    }),
    new webpack.ProvidePlugin({
      THREE: 'three'
    }),
    new HtmlWebpackPlugin({
      inject: false,
      template: 'src/index.html',
      gitcommit: ''
    })
  ],
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
        exclude: path.resolve(process.cwd(), 'node_modules'),
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
        use: { loader: 'worker-loader' }
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '~': path.join(process.cwd(), 'src')
    },
    plugins: [
      // new TsconfigPathsPlugin()
    ],
    fallback: {
      util: require.resolve("util/"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer/")
    }
  },
  devtool: 'eval-source-map',
  devServer: {
    host: '0.0.0.0',
    port: 8002,
    open: false,
    hot: true,
    historyApiFallback: true,
    // stats: 'errors-only',
    static: path.resolve(process.cwd(), 'src/public')
    // publicPath: '/'
  }
})
