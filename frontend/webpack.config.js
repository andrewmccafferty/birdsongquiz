const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
          template: './index.html', // or wherever your HTML template is
        }),
    ]
};