import * as mongoose from 'mongoose';
import * as HttpStatus from 'http-status-codes';
import { MovementModel, MovementType } from '../models/movement';
import { ExpressError } from '../utils/express.error';
import { MovementScoreType, MovementScoreModel } from '../models/movement.score';
import { QueryUtils } from '../utils/query.utils';

export class MovementService {
	private movementModel: mongoose.Model<MovementType>;
	private movementScoreModel: mongoose.Model<MovementScoreType>;

	constructor(private options: any = {}) {
		this.movementModel = this.options.movementModel || new MovementModel().createModel();
		this.movementScoreModel = this.options.movementScoreModel || new MovementScoreModel().createModel();
	}

	async getMovements(userId: string) {
		return this.movementModel.find(QueryUtils.forMany(userId));
	}

	async getMovement(userId: string, id: string) {
		return this.movementModel.findOne(QueryUtils.forOne({ '_id': id }, userId));
	}

	async getMovementScores(userId: string, movementId: string) {
		const movement = await this.getMovement(userId, movementId);
		if (!movement) {
			throw new ExpressError(`Entity with identity '${movementId}' does not exist`, HttpStatus.NOT_FOUND);
		}
		return this.movementScoreModel.find(QueryUtils.forOne({ 'movementId': movementId }, userId));
	}

	async createMovement(data: any) {
		await this.movementModel.ensureIndexes();
		const model = new this.movementModel(data);
		return model.save();
	}

	async addScore(userId: string, movementId: string, score: MovementScoreType) {
		const movementModel = await this.getMovement(userId, movementId);

		if (!movementModel) {
			throw new ExpressError(`Entity with identity '${movementId}' does not exist`, HttpStatus.NOT_FOUND);
		}

		score.movementId = movementModel.id;
		score.createdBy = userId;
		const movementScoreModel = new this.movementScoreModel(score);

		return movementScoreModel.save();
	}
}
