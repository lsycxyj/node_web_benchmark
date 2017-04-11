var koa = require('koa');
function createApp({middlewareAmount = 0}){
	var router = require('koa-router')(),

		app = new koa();

	var body = 'Hello world';

	async function handle(ctx, next) {
		await next();
		ctx.body = body;
	}

	var i = middlewareAmount;
	while (i-- > 0) {
		app.use(async function(ctx, next) {
			next();
		});
	}

	router.get('/', handle);
	router.post('/', handle);

	app.use(router.routes());

	return app;
}

module.exports = {
	createApp
};
