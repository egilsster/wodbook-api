import * as Koa from 'koa';
import * as YAML from 'yamljs';
import * as Router from 'koa-router';
import * as HttpStatus from 'http-status-codes';

export class OpenApiRouter extends Router {
	init(app: Koa) {
		this.get('/openapi', ctx => this.getApi(ctx));
		app.use(this.routes());
	}

	async getApi(ctx: Koa.Context) {
		ctx.body = YAML.load('./api-docs.yml');
		ctx.status = HttpStatus.OK;
	}
}
