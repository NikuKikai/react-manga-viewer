const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/index.tsx', // Your entry point (adjust if needed)
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'index.js', // Output file
    libraryTarget: 'umd', // Allows your package to be used in different environments (e.g., CommonJS, AMD)
    clean: true, // Clean the dist folder before each build
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'], // Resolve these file extensions
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/, // For TypeScript files
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/, // For CSS files (CSS Modules)
        use: [
            'style-loader', 'css-loader'
        ],
      },
    ],
  },
  externals: [
    nodeExternals(), // Exclude node_modules from the bundle
  ],
  mode: 'production', // Use 'development' mode if you need debugging
};