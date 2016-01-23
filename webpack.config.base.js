var path = require('path');
var webpack = require('webpack');
var HtmlPlugin = require('html-webpack-plugin');
var CleanPlugin = require('clean-webpack-plugin');
var CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    context: __dirname,
    entry: [
        './src/index.js'
    ],
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'bundle.js'
        //publicPath: 'build/'
    },
    devtool: 'source-map',
    plugins: [
        new webpack.NoErrorsPlugin(),
        new CopyPlugin([
            {from: './src/Font.js', to: 'Font.js'}
        ]),
        new HtmlPlugin({
            template: 'src/index.html'
        })
    ],
    resolve: {
        root: path.join(__dirname, 'src'),
        extensions: ['', '.js', '.jsx']
    },
    //node: {
    //    fs: true
    //},
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loaders: ['babel-loader'],
                exclude: /node_modules/
            },
            {
                test: /\.less?$/,
                loader: "style!css!less"
            },
            {
                test: /\.json$/,
                loader: "json"
            }
        ]
    }
};
