'use strict';

const WebpackAssetsManifest = require('webpack-assets-manifest');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssoWebpackPlugin = require('csso-webpack-plugin').default;
const { StatsWriterPlugin } = require('webpack-stats-plugin');

const minifyOptions = {
  removeComments: true,
  collapseWhitespace: true,
  removeRedundantAttributes: true,
  useShortDoctype: true,
  removeEmptyAttributes: true,
  removeStyleLinkTypeAttributes: true,
  keepClosingSlash: true,
}

const production = {
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.hbs',
      templateParameters: {
        title: 'Travel Buddy'
      },
      minify: minifyOptions,
    }),
    new HtmlWebpackPlugin({
      filename: 'auth.html',
      template: 'authHandler.hbs',
      templateParameters: {
        title: 'T-Buddy | Authentification'
      },
      minify: minifyOptions,
    }),
    new HtmlWebpackPlugin({
      filename: 'login.html',
      template: 'login.hbs',
      templateParameters: {
        title: 'T-Buddy | Authentification'
      },
      minify: minifyOptions,
    }),
    new HtmlWebpackPlugin({
      filename: 'about.html',
      template: 'about.hbs',
      templateParameters: {
        title: 'T-Buddy | How it works'
      },
      minify: minifyOptions,
    }),
    new HtmlWebpackPlugin({
      filename: 'profile.html',
      template: 'profile.hbs',
      templateParameters: {
        title: 'T-Buddy | Profile'
      },
      minify: minifyOptions,
    }),
    new HtmlWebpackPlugin({
      filename: 'profile/requests.html',
      template: 'requests.hbs',
      templateParameters: {
        title: 'T-Buddy | Requests'
      },
      minify: minifyOptions,
    }),
    new StatsWriterPlugin({ fields: null, filename: '../stats.json' }),
    new WebpackAssetsManifest(),
    new CssoWebpackPlugin(),
  ],
  devtool: 'source-map',
};

module.exports = production;
