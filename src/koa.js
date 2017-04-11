var koa = require('koa'),
	router = require('koa-router')(),

	app = new koa();

var body = 'Hello world';

async function handle(ctx, next) {
	await next();
	ctx.body = body;
}

router.get('/', handle);
router.post('/', handle);

app.use(router.routes());

module.exports = {
	app: app
};
