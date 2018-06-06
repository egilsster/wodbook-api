import * as bodyParser from 'body-parser';
import * as express from 'express';
const HttpStatus = require('http-status-codes');

import BaseRouter from './base';
import requireJSON from '../middleware/require.json';
import { ExpressError } from '../utils/express.error';
import { TrainingService } from '../services/training';

export class TrainingRouter extends BaseRouter {
	protected trainingService!: TrainingService;

	constructor(moduleName, options: any = {}) {
		super(options, moduleName);
		this.initRoutes();
	}

	initService(options: any, model, scoreModel) {
		this.trainingService = options.trainingService || new TrainingService(model, scoreModel);
	}

	initRoutes() {
		this.validateIdAsUuid();
		this.router.use(bodyParser.json());

		this.router.route(`/`)
			.get(this.list.bind(this))
			.post(requireJSON.bind(this), this.create.bind(this));

		this.router.route(`/:id`)
			.get(this.get.bind(this));

		this.router.route(`/:id/scores`)
			.get(this.getScores.bind(this))
			.post(this.addScore.bind(this));

		super.useLogger();
	}

	async list(req: express.Request, res: express.Response) {
		const userId: string = req['user'].id;
		const item = await this.trainingService.getMany(userId);
		return res.status(200).send({
			'data': item
		});
	}

	async get(req: express.Request, res: express.Response, next: express.NextFunction) {
		const itemId: string = req.params.id;
		const userId: string = req['user'].id;

		try {
			const data = await this.trainingService.getOne(userId, itemId);
			if (!data) {
				throw new ExpressError('Item not found', HttpStatus.NOT_FOUND);
			}

			return res.send({
				'data': data
			});
		} catch (err) {
			next(err);
		}
	}

	async create(req: express.Request, res: express.Response, next: express.NextFunction) {
		try {
			const itemPayload: any = req.body.data;
			itemPayload.createdBy = req['user'].id;
			const data = await this.trainingService.create(itemPayload);

			return res.status(HttpStatus.CREATED).send({
				'data': data
			});
		} catch (err) {
			next(err);
		}
	}

	async getScores(req: express.Request, res: express.Response, next: express.NextFunction) {
		try {
			const itemId: string = req.params.id;
			const userId: string = req['user'].id;
			const data = await this.trainingService.getScores(userId, itemId);

			return res.send({
				'data': data
			});
		} catch (err) {
			next(err);
		}
	}

	async addScore(req: express.Request, res: express.Response, next: express.NextFunction) {
		try {
			const itemId: string = req.params.id;
			const userId: string = req['user'].id;
			const score: any = req.body.data;
			const data = await this.trainingService.addScore(userId, itemId, score);

			return res.status(HttpStatus.CREATED).send({
				'data': data
			});
		} catch (err) {
			next(err);
		}
	}
}
