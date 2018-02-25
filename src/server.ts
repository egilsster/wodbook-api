import * as http from 'http';
import * as express from 'express';
import { Connection } from 'mongoose';

import RouterUtils from './utils/router.utils';
import ConfigService from './services/config';
import Models from './models';
import { Logger } from './utils/logger/logger';

export default class Server {
	private routerUtils: RouterUtils;
	private logger: Logger;
	public app: express.Express;
	private server: http.Server;

	constructor(public config: ConfigService = new ConfigService(), public routers?, public middleware?, public models?: Models, options: any = {}) {
		this.app = express();
		this.app.disable('x-powered-by');
		this.logger = options.logger || new Logger('server');
		this.routerUtils = options.routerUtils || new RouterUtils(options);
		this.server = http.createServer(this.app as any);
	}

	public async start() {
		const config = await ConfigService.getConfig();

		this.models = new Models({
			'uri': config.mongo.uri
		});

		this.models.connect((err: any, connection: Connection) => {
			if (err) {
				this.logger.error(`Error connecting to Mongo`, err);
				throw err;
			}

			this.routerUtils.registerMiddleware(this.app, this.logger);
			this.routerUtils.registerRoutes(this.app, config);

			this.server.listen(config.servicePort, () => {
				this.logger.info(`Listening on port ${config.servicePort}`);
			});

			connection.once('disconnected', () => {
				this.server.close();
			});

			connection.once('error', (e) => {
				this.logger.error(`Mongo error encountered: ${e}`);
				this.server.close();
			});
		});
	}

	public close() {
		if (this.server) {
			this.server.close();
			this.logger.info('Express server stopped');
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
