import * as mongoose from 'mongoose';
import { Logger } from '../utils/logger/logger';

const CONN_TO = 30000;
const KEEP_ALIVE = 5000;
const MAX_RECONNECT_ATTEMPTS = 5;

export default class Models {
	public logger: Logger;
	public mongoose: mongoose.Mongoose;
	public reconnectTimer: NodeJS.Timer | undefined;

	constructor(public options: any = {}, providedMongoose?) {
		this.logger = this.options.logger || new Logger('models:index');
		this.mongoose = providedMongoose || mongoose;
		this.mongoose.Promise = global.Promise;
	}

	connect(callback) {
		const connection = this.mongoose.connection;
		let uri = this.options.uri;
		const mongooseOptions: mongoose.ConnectionOptions = {
			'autoReconnect': true,
			'keepAlive': KEEP_ALIVE,
			'connectTimeoutMS': CONN_TO
		};

		let callbackCalled = false;
		let retryCount = MAX_RECONNECT_ATTEMPTS;
		this.mongoose.connect(uri, mongooseOptions, (err) => {
			if (err && !callbackCalled) {
				this.logger.error(err.message);
				callback(err);
				callbackCalled = true;
			}
		});

		connection.once('error', (err) => {
			if (!callbackCalled) {
				this.logger.error(`Error connecting: ${err}`);
				callback(err);
			}
		});

		connection.on('open', () => {
			this.logger.info(`Opening connection to: ${uri}`);
		});

		connection.once('close', () => {
			this.logger.error('Mongo connection closed');
		});

		connection.on('connected', () => {
			this.logger.info(`Connecting to: ${uri}`);
			callback(null, connection);
			callbackCalled = true;
		});

		connection.on('reconnected', () => {
			clearTimeout(this.reconnectTimer!);
			this.logger.info(`Reconnected to: ${uri}`);
		});

		connection.on('disconnected', () => {
			if (retryCount <= 0) {
				throw new Error(`Too many disconnections from ${uri}. Giving up.`);
			}
			this.logger.warn(`Lost connection to: ${uri}. Starting reconnect timer (${retryCount} attempt(s) remaining)...`);
			this.reconnectTimer = setTimeout(() => {
				throw new Error(`Lost connection to: ${uri} and could not reconnect in time.`);
			}, CONN_TO);
			retryCount--;
		});
	}
}
