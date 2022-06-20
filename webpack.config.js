const webpack = require('webpack');

module.exports = {
  mode: "production",

  entry: "./src/ts/songapp.tsx",

  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer")
    }
  },

  output: {
    path: `${__dirname}/build/js`,
    filename: "songapp_main.js"
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-react",
                "@babel/preset-typescript"
              ],
              plugins: [
                ["@babel/plugin-transform-runtime", { "corejs":3 }]
              ]
            }
          }
        ]
      }
    ]
  },
  target: ["web", "es5"],
  plugins: [
    new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
        process: 'process/browser',
    }),
  ],
};
