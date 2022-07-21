// import rules from './webpack.rules';
// import plugins from './webpack.plugins';

const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

// rules.push(
//    // Add support for native node modules
//   {
//     test: /\.node$/,
//     use: 'node-loader',
//   },
//   // {
//   //   test: /\.(m?js|node)$/,
//   //   parser: { amd: false },
//   //   use: {
//   //     loader: '@marshallofsound/webpack-asset-relocator-loader',
//   //     options: {
//   //       outputAssetBase: 'native_modules',
//   //     },
//   //   },
//   // },
// )

module.exports = {
  module: {
    rules,
  },
  target: 'node',
  // externals: [ 'electron' ],
  externals: {
    electron: 'commonjs2 electron',
    // sqlite3: "commonjs2 sqlite3",
    // sqlite3: 'commonjs2 sqlite3',
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
