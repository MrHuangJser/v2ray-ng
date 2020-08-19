const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const webpack = require('webpack');

module.exports = {
  mode: process.env.NODE_ENV,
  target: 'node',
  node: {
    __dirname: false,
  },
  entry: path.resolve(__dirname, 'src/main/main.ts'),
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: path.resolve(__dirname, 'dist'),
  },
  watch: process.env.NODE_ENV === 'development',
  watchOptions: { ignored: /node_modules/ },
  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [{ loader: 'ts-loader', options: { configFile: path.resolve(__dirname, './tsconfig.json') } }],
      },
      {
        test: /\.(png|svg|jeg|jpeg|gif)$/,
        use: [{ loader: 'file-loader', options: { name: '/assets/[name].[ext]' } }],
      },
    ],
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin({
      verbose: true,
      cleanOnceBeforeBuildPatterns: ['**/*', '!renderer', '!renderer/**/*'],
    }),
    new webpack.NormalModuleReplacementPlugin(/environments\/environment/gi, (resource) => {
      if (process.env.NODE_ENV === 'production') {
        resource.request = `${resource.request}.prod`;
      }
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, './src/main/assets'),
          to: path.resolve(__dirname, './dist/assets'),
        },
      ],
    }),
  ],
  externals: [nodeExternals()],
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
