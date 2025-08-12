const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack')

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/',
    },
    devServer: {
        static: {
          directory: path.join(__dirname, 'dist'), // adjust if needed
        },
        historyApiFallback: true,
        port: 3000,
        open: true,
      },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
              }
        ],
    },
    resolve: {
        extensions: ['.js'],
    },
    mode: 'development',
    plugins: [
        new HtmlWebpackPlugin({
            template: 'dist/index.html',
            filename: 'index.html'
          }),
        new webpack.DefinePlugin({
            'process.env.API_ROOT': JSON.stringify(process.env.API_ROOT),
            'process.env.CURRENT_APP_VERSION': JSON.stringify(process.env.CURRENT_APP_VERSION)
    })
    ]
};