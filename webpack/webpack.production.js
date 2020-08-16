'use strict';

const WebpackAssetsManifest = require('webpack-assets-manifest');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssoWebpackPlugin = require('csso-webpack-plugin').default;
const { StatsWriterPlugin } = require('webpack-stats-plugin');

const production = {
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.hbs',
      templateParameters: {
        title: 'Travel Buddy'
      },
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
      },
    }),
    new HtmlWebpackPlugin({
      filename: 'login.html',
      template: 'login.hbs',
      templateParameters: {
        title: 'T-Buddy | Авторизация'
      },
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
      },
    }),
    new HtmlWebpackPlugin({
      filename: 'about.html',
      template: 'about.hbs',
      templateParameters: {
        title: 'T-Buddy | Как это работает'
      },
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
      },
    }),
    new HtmlWebpackPlugin({
      filename: 'profile.html',
      template: 'profile.hbs',
      templateParameters: {
        title: 'T-Buddy | Личный кабинет'
      },
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
      },
    }),
    new HtmlWebpackPlugin({
      filename: 'profile/requests.html',
      template: 'requests.hbs',
      templateParameters: {
        title: 'T-Buddy | Заявки'
      },
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
      },
    }),
    new StatsWriterPlugin({ fields: null, filename: '../stats.json' }),
    new WebpackAssetsManifest(),
    new CssoWebpackPlugin(),
  ],
  devtool: 'source-map',
};

module.exports = production;
