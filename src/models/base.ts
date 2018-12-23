import * as mongoose from 'mongoose';

export class BaseModel {
	private MODEL_DEFINITION: mongoose.SchemaDefinition;
	private MODEL_NAME: string;
	private options: any;

	constructor(name: string, definition: mongoose.SchemaDefinition, options: any = {}) {
		this.MODEL_NAME = name;
		this.MODEL_DEFINITION = definition;
		this.options = options;
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
		const schema = new mongoose.Schema(this.MODEL_DEFINITION, {
			timestamps: true,
			versionKey: false
		});

		if (this.options.indices && this.options.unique) {
			schema.index(this.options.indices, this.options.unique);
		}

		return schema;
	}
}
