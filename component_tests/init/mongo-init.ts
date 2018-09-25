import { MongoClient, Db } from 'mongodb';
import users from '../data/users';

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
			const client = await MongoClient.connect(this.uri);
			const db = client.db(this.dbName);
			db.dropDatabase();

			await Promise.all([
				this.initCollection(db, 'users', users)
			]);
		} catch (err) {
			console.error(err);
			throw err;
		}
	}

	public async initCollection(db: Db, collectionName: string, data: object[]) {
		try {
			const collection = await db.collection(collectionName);
			await collection.insertMany(data);
			return;
		} catch (err) {
			throw err;
		}
	}
}
