import * as mongoose from 'mongoose';
import * as HttpStatus from 'http-status-codes';
import { WorkoutModel, WorkoutType } from '../models/workout';
import ExpressError from '../utils/express.error';

export default class WorkoutService {
	private workoutModel: mongoose.Model<WorkoutType>;

	constructor(private options: any = {}) {
		this.workoutModel = this.options.workoutModel || new WorkoutModel().createModel();
	}

	async getWorkouts() {
		return this.workoutModel.find();
	}

	async getWorkout(id: string) {
		return this.workoutModel.findById(id);
	}

	async createWorkout(data: any) {
		const workout = await this.getWorkout(data.workout);

		if (workout) {
			console.error(`Conflict, workout '${data.workout}' already exists`);
			throw new ExpressError('Conflict', `Workout: ${data.workout}, already exists`, HttpStatus.CONFLICT);
		}

		const model = new this.workoutModel(data);

		return model.save();
	}

	async addScore(workout: string, score: string) {
		const model = await this.getWorkout(workout);

		if (!model) {
			throw new ExpressError('Object not found', `Entity with identity '${workout}' does not exist`, HttpStatus.NOT_FOUND);
		}

		model.scores.push(score);
		return model.save();
	}
}
