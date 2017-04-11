var express = require('express'),

	app = express();

var body = 'Hello world';

function handle(req, res, next) {
	res.send(body);
}

app.get('/', handle);
app.post('/', handle);

module.exports = {
	app: app
};
