import * as Koa from 'koa';
import * as path from 'path';
import * as Static from 'koa-static';

export class StaticRouter {
	init(app: Koa) {
		const rootPath = path.resolve(process.cwd(), 'public');
		const koaStatic = Static(rootPath);
		app.use(koaStatic);
	}
}
