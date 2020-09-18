'use strict';

const HtmlWebpackPlugin = require('html-webpack-plugin');

const development = {
  plugins: [
    // !!! Не забыть добавить новые страницы в production
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'pages/index.hbs',
      chunks: ['landing'],
      templateParameters: {
        title: 'Travel Buddy'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'about.html',
      template: 'pages/static/about.hbs',
      chunks: ['common'],
      templateParameters: {
        title: 'T-Buddy | About'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'auth.html',
      chunks: ['auth'],
      template: 'pages/authHandler.hbs',
      templateParameters: {
        title: 'T-Buddy | Authentification'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'login.html',
      chunks: ['login'],
      template: 'pages/login.hbs',
      templateParameters: {
        title: 'T-Buddy | Authentification'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'reset.html',
      chunks: ['reset'],
      template: 'pages/reset.hbs',
      templateParameters: {
        title: 'T-Buddy | Restore access'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'resetConfirm.html',
      chunks: ['resetConfirm'],
      template: 'pages/resetConfirm.hbs',
      templateParameters: {
        title: 'T-Buddy | Restore access'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'profile.html',
      chunks: ['profile'],
      template: 'pages/profile.hbs',
      templateParameters: {
        title: 'T-Buddy | Profile'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'profile/requests.html',
      chunks: ['profile'],
      template: 'pages/requests.hbs',
      templateParameters: {
        title: 'T-Buddy | Requests'
      }
    }),
  ],
  devtool: 'inline-source-map',
};

module.exports = development;
