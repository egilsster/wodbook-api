import { Logger } from '../../utils/logger/logger';
// import { MongoClient } from 'mongodb';

export class Migrations {
	private logger: Logger;
	// private client: MongoClient | undefined;

	constructor(options: any) {
		this.logger = options.logger || new Logger('migrations:index');
		// this.client = options.client;
	}

	async startMigration() {
		// let start = Date.now();

		try {
			// Migrations go here, remember to un-comment test in migrations/index.spec.ts if there are no migrations
			return true;
		} catch (err) {
			this.logger.error(`Error during a migration, stopping the migration process`, err);
			throw err;
		}
	}
}
