import * as _ from 'lodash';
import { Mongo } from '../models/mongo';
import { Workout } from '../models/workout';
import { ServiceError } from '../utils/service.error';
import { QueryUtils } from '../utils/query.utils';
import { ERROR_TEMPLATES } from '../utils/error.templates';
import { ErrorUtils } from '../utils/error.utils';

export class WorkoutDao {
	constructor(private mongo: Mongo) { }

	async createWorkout(workout: Workout) {
		const now = new Date();
		workout.createdAt = now;
		workout.updatedAt = now;

		const workoutToInsert = workout.toObject();

		try {
			await this.mongo.workouts.insertOne(workoutToInsert);
		} catch (err) {
			throw ErrorUtils.convertMongoErrorToServiceError(err);
		}
		return workout;
	}

	async getWorkouts(claims: Claims) {
		const result = await this.mongo.workouts.find(QueryUtils.forMany(claims)).toArray();
		return _.map(result, (rawWorkout) => new Workout(rawWorkout));
	}

	async getWorkoutById(id: string, claims: Claims) {
		const data = await this.mongo.workouts.findOne(QueryUtils.forOne(id, claims));
		if (!data) {
			throw new ServiceError(ERROR_TEMPLATES.NOT_FOUND);
		}
		return new Workout(data);
	}

	async getWorkoutByName(name: string, claims: Claims) {
		const data = await this.mongo.workouts.findOne(QueryUtils.forOneWithFilter({ name: name }, claims));
		if (!data) {
			return null;
		}
		return new Workout(data);
	}

	async updateWorkoutById(id: string, workout: Workout, claims: Claims) {
		workout.updatedAt = new Date();
		const workoutToUpdate = workout.toObject();

		try {
			await this.mongo.workouts.updateOne(QueryUtils.forOne(id, claims), { $set: workoutToUpdate });
		} catch (err) {
			throw ErrorUtils.convertMongoErrorToServiceError(err, { meta: { resourceName: workoutToUpdate.name } });
		}
		return workout;
	}
}
