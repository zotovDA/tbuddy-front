const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const paths = require('./paths');

module.exports = {
  context: paths.src,
  entry: {
    landing: './scripts/landing/index.js',

    auth: './scripts/authorization/index.js',
    login: './scripts/authorization/login.js',
    reset: './scripts/authorization/reset.js',
    resetConfirm: './scripts/authorization/resetConfirm.js',

    home: './scripts/requests/index.js',
    profile: './scripts/profile/index.js',

    common: './scripts/common.js'
  },
  output: {
    filename: `scripts/[name].[hash:8].js`,
    path: paths.build,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(css|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [require('autoprefixer'), require('postcss-flexbugs-fixes')],
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.html$/,
        use: 'html-loader',
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/,
        use: {
          loader: 'file-loader',
          options: {
            publicPath: '../fonts',
            outputPath: 'fonts',
            name: '[name].[hash:8].[ext]',
          },
        },
      },
      {
        test: /\.(gif|ico|jpe?g|png|svg|webp)$/,
        use: {
          loader: 'file-loader',
          options: {
            esModule: false,
            publicPath: './images',
            outputPath: 'images',
            name: '[name].[hash:8].[ext]',
          },
        },
      },
      {
        test: /\.(hbs|handlebars)$/,
        use: [{
          loader: "handlebars-loader",
          options: {
            inlineRequires: "/images/",
            rootRelative: paths.src + '/templates/'
          }
        }],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[hash:8].css',
    }),
    new CopyWebpackPlugin([
      { from: paths.static },
    ]),
  ],
};
