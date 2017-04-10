var express = require('express'),

	config = require('./config'),

	app = express();

var body = 'Hello world';

function handle(req, res, next) {
	res.send(body);
}

app.get('/', handle);
app.post('/', handle);

app.listen(config.LISTEN_PORT, function() {
	console.log('Express ready');
});
