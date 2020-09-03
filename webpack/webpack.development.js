'use strict';

const HtmlWebpackPlugin = require('html-webpack-plugin');

const development = {
  plugins: [
    // !!! Не забыть добавить новые страницы в production
    new HtmlWebpackPlugin({
      template: 'index.hbs',
      templateParameters: {
        title: 'Travel Buddy'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'auth.html',
      template: 'authHandler.hbs',
      templateParameters: {
        title: 'T-Buddy | Authentification'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'login.html',
      template: 'login.hbs',
      templateParameters: {
        title: 'T-Buddy | Authentification'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'about.html',
      template: 'about.hbs',
      templateParameters: {
        title: 'T-Buddy | How it works'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'profile.html',
      template: 'profile.hbs',
      templateParameters: {
        title: 'T-Buddy | Profile'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'profile/requests.html',
      template: 'requests.hbs',
      templateParameters: {
        title: 'T-Buddy | Requests'
      }
    }),
  ],
  devtool: 'inline-source-map',
};

module.exports = development;
