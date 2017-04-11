var path = require('path'),
	nodeExternals = require('webpack-node-externals');

var srcPath = path.resolve(__dirname, 'src'),
	distPath = srcPath;

module.exports = {
	target: 'node',
	externals: [nodeExternals({
		whitelist: [/^(?!koa).*/]
	})],
	entry: {
		koa_es5_build: ['babel-polyfill', path.resolve(srcPath, 'koa.js')]
	},
	output: {
		path: distPath,
		filename: '[name].js',
		libraryTarget: 'commonjs-module'
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				include: [
					srcPath
				],
				exclude: /node_modules/
			}
		]
	}
};