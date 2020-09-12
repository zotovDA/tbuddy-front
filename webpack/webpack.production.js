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
      chunks: ['landing'],
      template: 'index.hbs',
      templateParameters: {
        title: 'Travel Buddy'
      },
      minify: minifyOptions,
    }),
    new HtmlWebpackPlugin({
      chunks: ['auth'],
      filename: 'auth.html',
      template: 'authHandler.hbs',
      templateParameters: {
        title: 'T-Buddy | Authentification'
      },
      minify: minifyOptions,
    }),
    new HtmlWebpackPlugin({
      chunks: ['login'],
      filename: 'login.html',
      template: 'login.hbs',
      templateParameters: {
        title: 'T-Buddy | Authentification'
      },
      minify: minifyOptions,
    }),
    new HtmlWebpackPlugin({
      chunks: ['reset'],
      filename: 'reset.html',
      template: 'reset.hbs',
      templateParameters: {
        title: 'T-Buddy | Restore access'
      },
      minify: minifyOptions,
    }),
    new HtmlWebpackPlugin({
      chunks: ['profile'],
      filename: 'profile.html',
      template: 'profile.hbs',
      templateParameters: {
        title: 'T-Buddy | Profile'
      },
      minify: minifyOptions,
    }),
    new HtmlWebpackPlugin({
      chunks: ['profile'],
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
