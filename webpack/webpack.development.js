'use strict';

const HtmlWebpackPlugin = require('html-webpack-plugin');

const development = {
  plugins: [
    // !!! Не забыть добавить новые страницы в production
    new HtmlWebpackPlugin({
      template: 'index.hbs',
      chunks: ['landing'],
      templateParameters: {
        title: 'Travel Buddy'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'auth.html',
      chunks: ['auth'],
      template: 'authHandler.hbs',
      templateParameters: {
        title: 'T-Buddy | Authentification'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'login.html',
      chunks: ['common'],
      template: 'login.hbs',
      templateParameters: {
        title: 'T-Buddy | Authentification'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'about.html',
      chunks: ['common'],
      template: 'about.hbs',
      templateParameters: {
        title: 'T-Buddy | How it works'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'profile.html',
      chunks: ['profile'],
      template: 'profile.hbs',
      templateParameters: {
        title: 'T-Buddy | Profile'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'profile/requests.html',
      chunks: ['profile'],
      template: 'requests.hbs',
      templateParameters: {
        title: 'T-Buddy | Requests'
      }
    }),
  ],
  devtool: 'inline-source-map',
};

module.exports = development;
