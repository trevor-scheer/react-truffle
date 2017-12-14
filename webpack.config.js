const path = require("path");
const webpack = require("webpack");

const VENDOR_MODULES = ["react", "prop-types", "truffle-contract", "web3"];
module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "react-truffle.js",
    libraryTarget: "umd",
    library: "reactTruffle"
  },
  externals: VENDOR_MODULES,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["env", "react"],
            plugins: [
              "transform-class-properties",
              "transform-object-rest-spread"
            ]
          }
        }
      }
    ]
  }
};
