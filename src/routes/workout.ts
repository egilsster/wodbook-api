import { WorkoutModel } from '../models/workout';
import { WorkoutScoreModel } from '../models/workout.score';
import { TrainingRouter } from './training';

export class WorkoutRouter extends TrainingRouter {
	constructor(options: any = {}) {
		super('workouts', options);
		const model = this.options.workoutModel || new WorkoutModel().createModel();
		const scoreModel = this.options.workoutScoreModel || new WorkoutScoreModel().createModel();
		this.initService(options, model, scoreModel);
		this.initRoutes();
	}
}
