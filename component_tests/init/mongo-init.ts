import { MongoClient } from 'mongodb';
import * as _ from 'lodash';

export default class MongoInit {
	constructor(private uri: string, private dbName: string) { }

	public async teardown() {
		try {
			const client = await MongoClient.connect(this.uri);
			const db = client.db(this.dbName);
			db.dropDatabase();
		} catch (err) {
			throw err;
		}
	}

	public async setup() {
		try {
			await this.teardown();
			await Promise.all([]);
		} catch (err) {
			console.error(err);
			throw err;
		}
	}
}
