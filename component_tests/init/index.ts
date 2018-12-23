import MongoInit from './mongo-init';

export default class CompTestInit {
	private mongoInit: MongoInit;

	constructor() {
		this.mongoInit = new MongoInit();
	}

	public async before() {
		await this.mongoInit.setup();
	}

	public async after() {
		await this.mongoInit.teardown();
	}
}
