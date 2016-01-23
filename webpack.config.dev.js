var webpack = require('webpack');
var _ = require('lodash');
var config = require('./webpack.config.base');

config = _.merge(config, {
    entry: [
        'webpack-dev-server/client?http://localhost:9898',
        'webpack/hot/only-dev-server'
    ].concat(config.entry),
    devServer: {
        port: 9898,
        contentBase: 'build',
        hot: true
    },
    plugins: config.plugins.concat([
        new webpack.HotModuleReplacementPlugin()
    ]),
    module: {
        loaders: [
            {loaders: ['react-hot'].concat(config.module.loaders[0].loaders)}
        ]
    }
});

module.exports = config;
