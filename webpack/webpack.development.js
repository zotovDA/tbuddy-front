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
      filename: 'login.html',
      template: 'login.hbs',
      templateParameters: {
        title: 'T-Buddy | Авторизация'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'about.html',
      template: 'about.hbs',
      templateParameters: {
        title: 'T-Buddy | Как это работает'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'profile.html',
      template: 'profile.hbs',
      templateParameters: {
        title: 'T-Buddy | Личный кабинет'
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'profile/requests.html',
      template: 'requests.hbs',
      templateParameters: {
        title: 'T-Buddy | Заявки'
      }
    }),
  ],
  devtool: 'inline-source-map',
};

module.exports = development;
