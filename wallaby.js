module.exports = function (wallaby) {
  return {
    files: [
      { pattern: './src/scripts/*.js', load: false },
      { pattern: './src/scripts/*.test.js', ignore: true, load: false },
    ],

    tests: [
      { pattern: 'src/scripts/*.test.js', load: false }
    ],

    env: {
      kind: 'chrome'
    },

    postprocessor: wallaby.postprocessors.webpack({
      // webpack options, such as
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true
              }
            }
          },
          {
            test: /\.(hbs|handlebars)$/,
            use: "handlebars-loader"
          },
        ]
      },
    }),

    setup: function () {
      // required to trigger test loading
      window.__moduleBundler.loadTests();
    },
  };
};
