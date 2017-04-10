var koa = require('koa'),
	router = require('koa-router')(),

	config = require('./config'),

	app = new koa();

var body = 'Hello world';

async function handle(ctx, next) {
	await next();
	ctx.body = body;
}

router.get('/', handle);
router.post('/', handle);

app.use(router.routes());

app.listen(config.LISTEN_PORT, function() {
	console.log('koa ready');
});