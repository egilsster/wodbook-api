import { Logger } from '../utils/logger/logger';
import { MongoClient, Db, Collection, MongoClientOptions } from 'mongodb';
import { Migrations } from './migrations';

const CONNECTION_TIMEOUT = Number(process.env.MONGO_CONN_TIMEOUT || 30000);
const mongoOptions: MongoClientOptions = {
	autoReconnect: true,
	connectTimeoutMS: CONNECTION_TIMEOUT,
	poolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 5),
	promiseLibrary: global.Promise,
	useNewUrlParser: true
};

export class Mongo {
	private logger!: Logger;
	private static instance: Mongo | undefined;
	private config!: Config;
	public client: MongoClient | undefined;
	private db!: Db;
	public users!: Collection;
	public movements!: Collection;
	public movementScores!: Collection;
	public workouts!: Collection;
	public workoutScores!: Collection;

	constructor(private options: any) {
		if (!Mongo.instance) {
			this.logger = this.options.logger || new Logger('models:mongo');
			this.config = this.options.config;
			Mongo.instance = this;
		}
		return Mongo.instance;
	}

	/**
	 * Connect to mongo
	 */
	async connect() {
		if (this.client) {
			// Already connected
			return;
		}
		const uri = this.config.mongo.uri;
		this.client = await MongoClient.connect(uri, mongoOptions);
		this.db = this.client.db();

		this.users = this.db.collection('users');
		await this.users.createIndex({ email: 1 }, { unique: true });
		this.movements = this.db.collection('movements');
		await this.movements.createIndex({ userId: 1, name: 1 }, { unique: true });
		this.movementScores = this.db.collection('movementscores');
		this.workouts = this.db.collection('workouts');
		await this.workouts.createIndex({ userId: 1, name: 1 }, { unique: true });
		this.workoutScores = this.db.collection('workoutscores');

		const migrations = new Migrations({ client: this.client });
		// Dont wait for migrations before starting
		Promise.all([
			migrations.startMigration()
		]).catch((err) => {
			this.logger.error(`Error migrating data, exiting. ${err}`);
		});
	}

	/**
	 * Close mongo connection
	 */
	async close() {
		if (this.client) {
			this.client.close();
		}
	}
}
