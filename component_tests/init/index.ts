import MongoInit from './mongo-init';

export default class CompTestInit {
	private mongoInit: MongoInit;

	constructor() {
		let uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wodbook-test';
		this.mongoInit = new MongoInit(uri, 'wodbook-test');
	}

	public async before() {
		await this.mongoInit.setup();
	}

	public async after() {
		await this.mongoInit.teardown();
	}
}
