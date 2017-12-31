import * as mongoose from 'mongoose';
import * as HttpStatus from 'http-status-codes';
import { MovementModel, MovementType } from '../models/movement';
import ExpressError from '../utils/express.error';
import { MovementScoreType, MovementScoreModel } from '../models/movement.score';
import { Logger } from '../utils/logger/logger';

export class MovementService {
	private logger: Logger;
	private movementModel: mongoose.Model<MovementType>;
	private movementScoreModel: mongoose.Model<MovementScoreType>;

	constructor(private options: any = {}) {
		this.logger = this.options.logger || new Logger('service:movement');
		this.movementModel = this.options.movementModel || new MovementModel().createModel();
		this.movementScoreModel = this.options.movementScoreModel || new MovementScoreModel().createModel();
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
			this.logger.error(`Conflict, movement '${data.movement}' already exists`);
			throw new ExpressError('Conflict', `movement: ${data.movement}, already exists`, HttpStatus.CONFLICT);
		}

		const model = new this.movementModel(data);
		return model.save();
	}

	async addScore(user: any, movementId: string, score: MovementScoreType) {
		const movementModel = await this.getMovement(user, movementId);

		if (!movementModel) {
			throw new ExpressError('Object not found', `Entity with identity '${movementId}' does not exist`, HttpStatus.NOT_FOUND);
		}

		const movementScoreModel = new this.movementScoreModel(score);
		await movementScoreModel.save();
		movementModel.scores.push(movementScoreModel._id);
		await movementModel.save();
		return movementModel.populate('scores');
	}
}
