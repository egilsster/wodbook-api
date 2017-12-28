import * as mongoose from 'mongoose';
import * as HttpStatus from 'http-status-codes';
import { MovementModel, MovementType } from '../models/movement';
import ExpressError from '../utils/express.error';

export class MovementService {
	private movementModel: mongoose.Model<MovementType>;

	constructor(private options: any = {}) {
		this.movementModel = this.options.movementModel || new MovementModel().createModel();
	}

	async getMovements(user: any) {
		return this.movementModel.find({ 'createdBy': user.id }).populate('scores');
	}

	async getMovement(user: any, id: string) {
		return this.movementModel.findOne({ '_id': id, 'createdBy': user.id }).populate('scores');
	}

	async createMovement(data: any, user: any) {
		const movement = await this.getMovement(user, data.movement);

		if (movement) {
			console.error(`Conflict, movement '${data.movement}' already exists`);
			throw new ExpressError('Conflict', `movement: ${data.movement}, already exists`, HttpStatus.CONFLICT);
		}

		const model = new this.movementModel(data);

		return model.save();
	}

	async addScore(user: any, movement: string, _score: string) {
		const model = await this.getMovement(user, movement);

		if (!model) {
			throw new ExpressError('Object not found', `Entity with identity '${movement}' does not exist`, HttpStatus.NOT_FOUND);
		}

		// model.scores.push(score);
		return model.save();
	}
}
