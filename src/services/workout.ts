import * as mongoose from 'mongoose';
import * as HttpStatus from 'http-status-codes';
import { WorkoutModel, WorkoutType } from '../models/workout';
import { ExpressError } from '../utils/express.error';
import { WorkoutScoreType, WorkoutScoreModel } from '../models/workout.score';
import { QueryUtils } from '../utils/query.utils';

export class WorkoutService {
	private workoutModel: mongoose.Model<WorkoutType>;
	private workoutScoreModel: mongoose.Model<WorkoutScoreType>;

	constructor(private options: any = {}) {
		this.workoutModel = this.options.workoutModel || new WorkoutModel().createModel();
		this.workoutScoreModel = this.options.workoutScoreModel || new WorkoutScoreModel().createModel();
	}

	async getWorkouts(userId: string) {
		return this.workoutModel.find(QueryUtils.forMany(userId));
	}

	async getWorkout(userId: string, workoutId: string) {
		return this.workoutModel.findOne(QueryUtils.forOne({ '_id': workoutId }, userId));
	}

	async getWorkoutByTitle(title: string, userId: string) {
		return this.workoutModel.findOne(QueryUtils.forOne({ 'title': title }, userId));
	}

	async getWorkoutScores(userId: string, workoutId: string) {
		const workout = await this.getWorkout(userId, workoutId);
		if (!workout) {
			throw new ExpressError(`Entity with identity '${workoutId}' does not exist`, HttpStatus.NOT_FOUND);
		}
		return this.workoutScoreModel.find(QueryUtils.forOne({ 'workoutId': workoutId }, userId));
	}

	async createWorkout(data: any) {
		const model = new this.workoutModel(data);
		return model.save();
	}

	async addScore(userId: string, workoutId: string, score: any) {
		const workoutModel = await this.getWorkout(userId, workoutId);

		if (!workoutModel) {
			throw new ExpressError(`Entity with identity '${workoutId}' does not exist`, HttpStatus.NOT_FOUND);
		}

		score.createdBy = userId;
		score.workoutId = workoutModel.id;
		const workoutScoreModel = new this.workoutScoreModel(score);

		return workoutScoreModel.save();
	}
}
