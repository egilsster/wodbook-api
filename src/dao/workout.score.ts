import * as _ from 'lodash';
import { Mongo } from '../models/mongo';
import { WorkoutScore } from '../models/workout.score';
import { ServiceError } from '../utils/service.error';
import { QueryUtils } from '../utils/query.utils';
import { ERROR_TEMPLATES } from '../utils/error.templates';
import { ErrorUtils } from '../utils/error.utils';

export class WorkoutScoreDao {
	constructor(private mongo: Mongo) { }

	async createWorkoutScore(workoutScore: WorkoutScore) {
		const now = new Date();
		workoutScore.createdAt = now;
		workoutScore.updatedAt = now;

		const workoutScoreToInsert = workoutScore.toObject();

		try {
			await this.mongo.workoutScores.insertOne(workoutScoreToInsert);
		} catch (err) {
			throw ErrorUtils.convertMongoErrorToServiceError(err);
		}
		return workoutScore;
	}

	async getWorkoutScores(workoutId: string, claims: Claims) {
		const result = await this.mongo.workoutScores.find(QueryUtils.forManyWithFilter({ workoutId: workoutId }, claims)).toArray();
		return _.map(result, (rawWorkoutScore) => new WorkoutScore(rawWorkoutScore));
	}

	async getWorkoutScoreById(id: string, claims: Claims) {
		const data = await this.mongo.workoutScores.findOne(QueryUtils.forOne(id, claims));
		if (!data) {
			throw new ServiceError(ERROR_TEMPLATES.NOT_FOUND);
		}
		return new WorkoutScore(data);
	}

	async updateWorkoutScoreById(id: string, workoutScore: WorkoutScore, claims: Claims) {
		workoutScore.updatedAt = new Date();
		const workoutScoreToUpdate = workoutScore.toObject();

		try {
			await this.mongo.workoutScores.updateOne(QueryUtils.forOne(id, claims), { $set: workoutScoreToUpdate });
		} catch (err) {
			throw ErrorUtils.convertMongoErrorToServiceError(err);
		}
		return workoutScore;
	}
}
