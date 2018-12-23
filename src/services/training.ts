import * as mongoose from 'mongoose';
import * as HttpStatus from 'http-status-codes';
import { ExpressError } from '../utils/express.error';
import { QueryUtils } from '../utils/query.utils';
import { MovementScoreType } from '../models/movement.score';
import { WorkoutScoreType } from '../models/workout.score';

export class TrainingService {
	private model: mongoose.Model<any>;
	private scoreModel: mongoose.Model<any>;

	constructor(model, scoreModel) {
		this.model = model;
		this.scoreModel = scoreModel;
	}

	async getMany(userId: string) {
		return this.model.find(QueryUtils.forMany(userId));
	}

	async getOne(userId: string, id: string) {
		return this.model.findOne(QueryUtils.forOne({ _id: id }, userId));
	}

	async getByFilter(userId: string, filter: object) {
		return this.model.findOne(QueryUtils.forOne(filter, userId));
	}

	async getScores(userId: string, parentId: string) {
		const mdl = await this.getOne(userId, parentId);
		if (!mdl) {
			throw new ExpressError(`Entity with identity '${parentId}' does not exist`, HttpStatus.NOT_FOUND);
		}
		return this.scoreModel.find(QueryUtils.forOne({ parentId: parentId }, userId));
	}

	async create(data: any) {
		await this.model.createIndexes();
		const model = new this.model(data);
		return model.save();
	}

	async addScore(userId: string, itemId: string, score: MovementScoreType | WorkoutScoreType) {
		const mdl = await this.getOne(userId, itemId);
		if (!mdl) {
			throw new ExpressError(`Entity with identity '${itemId}' does not exist`, HttpStatus.NOT_FOUND);
		}

		score.parentId = mdl.id;
		score.createdBy = userId;
		const scoreModel = new this.scoreModel(score);
		return scoreModel.save();
	}
}
