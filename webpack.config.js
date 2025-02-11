const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { AngularWebpackPlugin } = require('@ngtools/webpack');

module.exports = {
  mode: 'development',

  entry: {
    main: path.resolve(__dirname + '/src/main.ts'),
    styles: path.resolve(__dirname + '/src/styles.ts')
},
performance: {
    hints: false // Para que no avise del chunk muy grande
},
devServer: {
    historyApiFallback: true,
    contentBase: './',
    stats: 'minimal'
},
output: {
    filename: '[git-revision-version].[name].js',
    path: path.resolve(__dirname + '/dist'),
    publicPath: '/',
    assetModuleFilename: 'assets/resources/[hash][ext]',
    chunkFilename: '[id].chunk.js'
},
resolve: {
    preferRelative: true,
    extensions: ['.ts', '.js', '.css']
},

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true
  },

  resolve: {
    extensions: ['.ts', '.js']
  },

  module: {
    rules: [
      // Regla para procesar archivos TypeScript con Angular
      {
        test: /\.ts$/,
        loader: '@ngtools/webpack'
      },
      // Regla para procesar los templates HTML
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      // Regla para los estilos de componentes (ubicados en src/app)
      {
        test: /\.css$/,
        include: path.resolve(__dirname, 'src/app'),
        use: 'raw-loader'
      },
      // Regla para los estilos globales (por ejemplo, src/styles.css)
      {
        test: /\.css$/,
        exclude: path.resolve(__dirname, 'src/app'),
        use: ['style-loader', 'css-loader']
      }
    ]
  },

  plugins: [
    new AngularWebpackPlugin({
      tsconfig: path.resolve(__dirname, 'tsconfig.app.json'),
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],

  devServer: {
    port: 4200,
    historyApiFallback: true,
    https: {
      key: fs.readFileSync('./node_modules/browser-sync/certs/server.key'),
      cert: fs.readFileSync('./node_modules/browser-sync/certs/server.crt')
    },
    open: true,
    static: {
      directory: path.join(__dirname, 'src')
    }
  }
};