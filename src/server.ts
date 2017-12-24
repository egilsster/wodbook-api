import * as http from 'http';
import * as express from 'express';
import { Connection } from 'mongoose';

import RouterUtils from './utils/router.utils';
import ConfigService from './services/config';
import Models from './models';

export default class Server {
	private routerUtils: RouterUtils;
	public app: express.Express;
	private server: http.Server;

	constructor(public config: ConfigService = new ConfigService(), public routers?, public middleware?, public models?: Models, options: any = {}) {
		this.app = express();
		this.app.disable('x-powered-by');
		this.routerUtils = options.routerUtils || new RouterUtils(options);
	}

	public async start() {
		const config = await ConfigService.getConfig();

		const server = http.createServer(this.app as any);

		this.models = new Models({
			'uri': config.mongo.uri
		});

		this.models.connect((err: any, connection: Connection) => {
			if (err) {
				console.error(`Error connecting to Mongo`, err);
				throw err;
			}

			this.routerUtils.registerMiddleware(this.app);
			this.routerUtils.registerRoutes(this.app);

			server.listen(config.servicePort, () => {
				console.info(`Listening on port ${config.servicePort}`);
			});

			connection.once('disconnected', () => {
				server.close();
			});

			connection.once('error', (e) => {
				console.error(`Mongo error encountered: ${e}`);
				server.close();
			});
		});
	}

	public close() {
		if (this.server) {
			this.server.close();
			console.info('Express server stopped');
		}
	}
}

if (!String(process.env.NODE_ENV).startsWith('test')) {
	const server = new Server();
	process.nextTick(() => {
		server.start();
	});

	/*
	* Handle SIGTERM gracefully
	*/
	process.on('SIGTERM', () => {
		if (server) {
			server.close();
		}
		// Wait for all SIGTERM listeners to gracefully stop before forcing process exit
		process.nextTick(() => {
			process.exit();
		});
	});
}

process.on('unhandledRejection', (reason, p) => {
	// call handler here
	console.log(reason, p);
});
