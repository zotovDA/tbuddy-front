'use strict';

const HtmlWebpackPlugin = require('html-webpack-plugin');

const development = {
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.hbs',
      templateParameters: {
        title: 'Travel Buddy'
      }
    })
  ],
  devtool: 'inline-source-map',
};

module.exports = development;
