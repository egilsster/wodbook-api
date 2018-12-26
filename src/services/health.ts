import { Mongo } from '../models/mongo';

export class HealthService {
	private mongo: Mongo;

	constructor(options) {
		this.mongo = options.mongo;
	}

	async isHealthy() {
		const err = new Error('Mongo client is not connected');
		if (!this.mongo.client) {
			throw err;
		}
		let isConnected = await this.mongo.client.isConnected();
		if (isConnected !== true) {
			throw err;
		}
	}
}
