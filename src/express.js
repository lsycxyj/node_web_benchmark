var express = require('express');

function createApp({middlewareAmount = 0}){
	var	app = express();

	var body = 'Hello world';

	function handle(req, res, next) {
		res.send(body);
	}

	var i = middlewareAmount;
	while (i-- > 0) {
		app.use(function(req, res, next) {
			next();
		});
	}

	app.get('/', handle);
	app.post('/', handle);

	return app;
}

module.exports = {
	createApp
};
