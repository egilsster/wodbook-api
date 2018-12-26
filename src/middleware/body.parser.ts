import * as Koa from 'koa';
import * as koaBody from 'koa-body';

/**
 * Parses JSON bodies as well as multiform
 * bodies. Files are put on ctx.request.files
 */
export class BodyParser {
	init(app: Koa) {
		app.use(koaBody({
			multipart: true
		}));
	}
}
