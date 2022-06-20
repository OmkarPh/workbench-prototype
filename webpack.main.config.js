module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main.ts',
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  target: 'electron-renderer',
  // browser: {
  //   "fs": false,
  //    "path": false,
  //    "os": false
  // },
  // node: {
  //   global: true,
  //   fs: "empty",
  //   os: "empty",
  // },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    // fallback: {
    //   "fs": false,
    //   "os": false
    // },
  },
};
