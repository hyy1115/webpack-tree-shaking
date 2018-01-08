const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const PATHS = {
  app: path.join(__dirname, 'app', 'entry'),
  build: path.join(__dirname, 'build'),
  shaking: path.join(__dirname, 'app', 'shaking')
};

module.exports = [
    {
        entry: {
            vendor: ['react', 'react-dom'],
            app: PATHS.app,
        },
        output: {
            path: path.join(PATHS.build),
            filename: '[name].js',
        },
        plugins: [
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor'
            }),
            new UglifyJSPlugin()
        ],
        module: {
            rules: [{
                test: /\.js$/,
                use: {
                    loader: 'babel-loader'
                },
                exclude: /node_modules/
            }]
        }
    },
    {
        entry: {
            shaking: PATHS.shaking,
        },
        output: {
            path: path.join(PATHS.build),
            filename: '[name].js',
        },
        plugins: [
            new UglifyJSPlugin()
        ]
    }
];
