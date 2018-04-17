import * as http from 'http';
import * as express from 'express';
import * as config from 'config';
import { Connection } from 'mongoose';

import RouterUtils from './utils/router.utils';
import Models from './models';
import { Logger } from './utils/logger/logger';

export default class Server {
	private routerUtils: RouterUtils;
	private logger: Logger;
	public app: express.Express;
	private server: http.Server;

	constructor(public routers?, public middleware?, public models?: Models, options: any = {}) {
		this.app = express();
		this.app.disable('x-powered-by');
		this.logger = options.logger || new Logger('server');
		this.routerUtils = options.routerUtils || new RouterUtils(options);
		this.server = http.createServer(this.app as any);
	}

	public async start() {
		const serverConfig = config.get<ServerConfig>('server');

		this.models = new Models({
			'uri': process.env.MONGO_URI
		});

		this.models.connect((err: any, connection: Connection) => {
			if (err) {
				this.logger.error(`Error connecting to Mongo`, err);
				throw err;
			}

			this.routerUtils.registerMiddleware(this.app, this.logger);
			this.routerUtils.registerRoutes(this.app);

			this.server.listen(serverConfig.port, () => {
				this.logger.info(`Listening on port ${serverConfig.port}`);
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
