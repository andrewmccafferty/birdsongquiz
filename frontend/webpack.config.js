const path = require("path")
const webpack = require("webpack")

module.exports = {
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/dist/",
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"), // adjust if needed
    },
    historyApiFallback: true,
    port: 3000,
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-react",
                "@babel/preset-typescript",
              ],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
  mode: "development",
  plugins: [
    new webpack.DefinePlugin({
      "process.env.API_ROOT": JSON.stringify(process.env.API_ROOT),
      "process.env.CURRENT_APP_VERSION": JSON.stringify(
        process.env.CURRENT_APP_VERSION
      ),
      "process.env.GOOGLE_ANALYTICS_ID": JSON.stringify(
        process.env.GOOGLE_ANALYTICS_ID
      ),
    }),
  ],
}
