const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  module: {
    rules,
  },
  target: 'node',
  // externals: [ 'electron' ],
  externals: {
    electron: 'commonjs2 electron',
    // 'pg-hstore': 'pg-hstore'
  },
  // externals: [
  //   (function () {
  //     const IGNORES = [
  //       'electron'
  //     ];
  //     return function (context, request, callback) {
  //       if (IGNORES.indexOf(request) >= 0) {
  //         return callback(null, "require('" + request + "')");
  //       }
  //       return callback();
  //     };
  //   })()
  // ],
  // target: ['node', 'web'],
  plugins: plugins,
  resolve: {
    fallback: {
      fs: false,
      os: false,
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
