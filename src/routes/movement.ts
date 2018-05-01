import { MovementModel } from '../models/movement';
import { MovementScoreModel } from '../models/movement.score';
import { TrainingRouter } from './training';

export class MovementRouter extends TrainingRouter {
	constructor(options: any = {}) {
		super('movements', options);
		const model = this.options.movementModel || new MovementModel().createModel();
		const scoreModel = this.options.movementScoreModel || new MovementScoreModel().createModel();
		this.initService(options, model, scoreModel);
		this.initRoutes();
	}
}
