const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const cleanWebpackPlugin=require('clean-webpack-plugin');
module.exports = {
    devtool: false,
    entry: {
        index: path.join(__dirname, "./demo/src/app.js")
    },
    output: {
        filename: '[name].[hash].js',
        path: path.resolve(__dirname, 'demo/dist'),
        //publicPath: './'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: path.resolve(__dirname, "node_modules"),
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.(le|c)ss$/,
                use: [ 'style-loader', 'css-loader','less-loader' ]
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        }),
        new HtmlWebpackPlugin({
            title: 'Output Management',
            filename:'index.html',
            template:'./demo/src/index.html'
        }),
        new cleanWebpackPlugin(['*'], {
            root: path.resolve(__dirname,'./demo/dist'),
            verbose: true,
            dry: false
        }),
    ],
    devServer: {
port:4000,
        host: '192.168.98.152'
    }
}