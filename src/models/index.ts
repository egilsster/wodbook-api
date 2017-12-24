import * as _ from 'lodash';
import { Mongoose } from 'mongoose';
import * as mongoose from 'mongoose';

const CONN_TO = 30000;
const KEEP_ALIVE = 5000;
const MAX_RECONNECT_ATTEMPTS = 5;

export default class Models {
	public mongoose: Mongoose;
	public reconnectTimer: NodeJS.Timer;

	constructor(public options: any = {}, providedMongoose?) {
		this.options = options;
		this.mongoose = providedMongoose || mongoose;
		this.mongoose.Promise = global.Promise;
	}

	connect(callback) {
		const connection = this.mongoose.connection;
		let uri = this.options.uri;
		const serverOptions = {
			'autoReconnect': true,
			'keepAlive': KEEP_ALIVE,
			'connectTimeoutMS': CONN_TO
		};
		const mongooseOptions: any = {
			'useMongoClient': true
		};
		_.merge(mongooseOptions, serverOptions);

		// Only use the TLS/SSL config when running in the cloud
		if (this.options.sslAuth) {
			uri += '&authMechanism=MONGODB-X509';
			mongooseOptions.authSource = '$external';
			mongooseOptions.sslCA = [this.options.sslAuth.sslCA];
			_.merge(mongooseOptions, this.options.sslAuth);
		}

		let callbackCalled = false;
		let retryCount = MAX_RECONNECT_ATTEMPTS;
		this.mongoose.connect(uri, mongooseOptions, (err) => {
			if (err && !callbackCalled) {
				console.error(err.message);
				callback(err);
				callbackCalled = true;
			}
		});

		connection.once('error', (err) => {
			if (!callbackCalled) {
				console.error(`Error connecting: ${err}`);
				callback(err);
			}
		});

		connection.on('open', () => {
			console.info(`Opening connection to: ${uri}`);
		});

		connection.once('close', () => {
			console.error('Mongo connection closed');
		});

		connection.on('connected', () => {
			console.info(`Connecting to: ${uri}`);
			callback(null, connection);
			callbackCalled = true;
		});

		connection.on('reconnected', () => {
			clearTimeout(this.reconnectTimer);
			console.info(`Reconnected to: ${uri}`);
		});

		connection.on('disconnected', () => {
			if (retryCount <= 0) {
				throw new Error(`Too many disconnections from ${uri}. Giving up.`);
			}
			console.warn(`Lost connection to: ${uri}. Starting reconnect timer (${retryCount} attempt(s) remaining)...`);
			this.reconnectTimer = setTimeout(() => {
				throw new Error(`Lost connection to: ${uri} and could not reconnect in time.`);
			}, CONN_TO);
			retryCount--;
		});
	}
}
