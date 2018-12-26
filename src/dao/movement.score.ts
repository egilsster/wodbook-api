import * as _ from 'lodash';
import { Mongo } from '../models/mongo';
import { MovementScore } from '../models/movement.score';
import { ServiceError } from '../utils/service.error';
import { QueryUtils } from '../utils/query.utils';
import { ERROR_TEMPLATES } from '../utils/error.templates';
import { ErrorUtils } from '../utils/error.utils';

export class MovementScoreDao {
	constructor(private mongo: Mongo) { }

	async createMovementScore(movementScore: MovementScore) {
		const now = new Date();
		movementScore.createdAt = now;
		movementScore.updatedAt = now;

		const movementScoreToInsert = movementScore.toObject();

		try {
			await this.mongo.movementScores.insertOne(movementScoreToInsert);
		} catch (err) {
			throw ErrorUtils.convertMongoErrorToServiceError(err);
		}
		return movementScore;
	}

	async getMovementScores(movementId: string, claims: Claims) {
		const result = await this.mongo.movementScores.find(QueryUtils.forManyWithFilter({ movementId: movementId }, claims)).toArray();
		return _.map(result, (rawMovementScore) => new MovementScore(rawMovementScore));
	}

	async getMovementScoreById(movementId: string, claims: Claims) {
		const data = await this.mongo.movementScores.findOne(QueryUtils.forOneWithFilter({ movementId: movementId }, claims));
		if (!data) {
			throw new ServiceError(ERROR_TEMPLATES.NOT_FOUND);
		}
		return new MovementScore(data);
	}

	async updateMovementScoreById(id: string, movementScore: MovementScore, claims: Claims) {
		movementScore.updatedAt = new Date();
		const movementScoreToUpdate = movementScore.toObject();

		try {
			await this.mongo.movementScores.updateOne(QueryUtils.forOne(id, claims), { $set: movementScoreToUpdate });
		} catch (err) {
			throw ErrorUtils.convertMongoErrorToServiceError(err);
		}
		return movementScore;
	}
}
