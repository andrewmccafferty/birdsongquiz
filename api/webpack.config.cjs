const path = require('path');

/** @type {import('webpack').Configuration} */
module.exports = {
  target: 'node',
  mode: 'production',
  entry: {
    handlers: './src/handlers.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].cjs',
    libraryTarget: 'commonjs2',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    '@aws-sdk/client-s3': 'commonjs2 @aws-sdk/client-s3'
  },
  optimization: {
    minimize: false,
  },
};


