import * as _ from 'lodash';
import { Mongo } from '../models/mongo';
import { Movement } from '../models/movement';
import { ServiceError } from '../utils/service.error';
import { QueryUtils } from '../utils/query.utils';
import { ERROR_TEMPLATES } from '../utils/error.templates';
import { ErrorUtils } from '../utils/error.utils';

export class MovementDao {
	constructor(private mongo: Mongo) { }

	async createMovement(movement: Movement) {
		const now = new Date();
		movement.createdAt = now;
		movement.updatedAt = now;

		const movementToInsert = movement.toObject();

		try {
			await this.mongo.movements.insertOne(movementToInsert);
		} catch (err) {
			throw ErrorUtils.convertMongoErrorToServiceError(err);
		}
		return movement;
	}

	async getMovements(claims: Claims) {
		const result = await this.mongo.movements.find(QueryUtils.forMany(claims)).toArray();
		return _.map(result, (rawMovement) => new Movement(rawMovement));
	}

	async getMovementById(id: string, claims: Claims) {
		const data = await this.mongo.movements.findOne(QueryUtils.forOne(id, claims));
		if (!data) {
			throw new ServiceError(ERROR_TEMPLATES.NOT_FOUND);
		}
		return new Movement(data);
	}

	async updateMovementById(id: string, movement: Movement, claims: Claims) {
		movement.updatedAt = new Date();
		const movementToUpdate = movement.toObject();

		try {
			await this.mongo.movements.updateOne(QueryUtils.forOne(id, claims), { $set: movementToUpdate });
		} catch (err) {
			throw ErrorUtils.convertMongoErrorToServiceError(err, { meta: { resourceName: movementToUpdate.name } });
		}
		return movement;
	}
}
