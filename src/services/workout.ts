import * as mongoose from 'mongoose';
import * as HttpStatus from 'http-status-codes';
import { WorkoutModel, WorkoutType } from '../models/workout';
import ExpressError from '../utils/express.error';
import { WorkoutScoreType, WorkoutScoreModel } from '../models/workout.score';
import { Logger } from '../utils/logger/logger';

export class WorkoutService {
	private logger: Logger;
	private workoutModel: mongoose.Model<WorkoutType>;
	private workoutScoreModel: mongoose.Model<WorkoutScoreType>;

	constructor(private options: any = {}) {
		this.logger = options.logger || new Logger('service:workout');
		this.workoutModel = this.options.workoutModel || new WorkoutModel().createModel();
		this.workoutScoreModel = this.options.workoutScoreModel || new WorkoutScoreModel().createModel();
	}

	async getWorkouts(user: any) {
		return this.workoutModel.find({ 'createdBy': user.id }).populate('scores');
	}

	async getWorkout(user: any, id: string) {
		return this.workoutModel.findOne({ '_id': id, 'createdBy': user.id }).populate('scores');
	}

	async createWorkout(data: any, user: any) {
		const workout = await this.getWorkout(user, data.workout);

		if (workout) {
			this.logger.error(`Conflict, workout '${data.workout}' already exists`);
			throw new ExpressError('Conflict', `Workout: ${data.workout}, already exists`, HttpStatus.CONFLICT);
		}

		const model = new this.workoutModel(data);

		return model.save();
	}

	async addScore(user: any, workoutId: string, score: string) {
		const workoutModel = await this.getWorkout(user, workoutId);

		if (!workoutModel) {
			throw new ExpressError('Object not found', `Entity with identity '${workoutId}' does not exist`, HttpStatus.NOT_FOUND);
		}

		const workoutScoreModel = new this.workoutScoreModel(score);
		await workoutScoreModel.save();
		workoutModel.scores.push(workoutScoreModel._id);
		await workoutModel.save();
		return workoutModel.populate('scores');
	}
}
