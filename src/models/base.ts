import * as mongoose from 'mongoose';

export class BaseModel {
	private MODEL_DEFINITION: mongoose.SchemaDefinition;
	private MODEL_NAME: string;

	constructor(name: string, definition: mongoose.SchemaDefinition, public options: any = {}) {
		this.MODEL_NAME = name;
		this.MODEL_DEFINITION = definition;
	}

	/**
	 * Create the Blob model
	 * @return {Object} Blob mongoose model
	 */
	public createModel() {
		if ((mongoose as any).models[this.MODEL_NAME]) {
			return mongoose.model(this.MODEL_NAME);
		}
		return mongoose.model(this.MODEL_NAME, this.createSchema());
	}

	/**
	 * Setup the mongo schema.
	 * @return {mongoose.Schema} Created mongoose schema
	 */
	public createSchema(): mongoose.Schema {
		return new mongoose.Schema(this.MODEL_DEFINITION, {
			'timestamps': true,
			'versionKey': false
		});
	}
}
