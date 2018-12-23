import { Db, MongoClient, MongoClientOptions } from 'mongodb';
import users from '../data/users';

const CONNECTION_TIMEOUT = Number(process.env.MONGO_CONN_TIMEOUT || 30000);
const mongoOptions: MongoClientOptions = {
	autoReconnect: true,
	connectTimeoutMS: CONNECTION_TIMEOUT,
	poolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 5),
	promiseLibrary: global.Promise,
	useNewUrlParser: true
};

export default class MongoInit {
	private uri: string;

	constructor() {
		this.uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wodbook-test';
	}

	private getMongoConnection() {
		return MongoClient.connect(this.uri, mongoOptions);
	}

	public async teardown() {
		const client = await this.getMongoConnection();
		const db = client.db();
		await db.dropDatabase();
	}

	public async setup() {
		const client = await this.getMongoConnection();
		const db = client.db();
		await db.dropDatabase();

		await Promise.all([
			this.initUsers(db)
		]);
	}

	public async initUsers(db: Db) {
		const collection = await db.collection('users');
		await collection.insertMany(users);
	}
}
