import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as HttpStatus from 'http-status-codes';

import { MovementService } from '../services/movement';
import BaseRouter from './base';
import requireJSON from '../middleware/require.json';
import { ExpressError } from '../utils/express.error';

export class MovementRouter extends BaseRouter {
	public path: string = 'movements';
	private movementService: MovementService;

	constructor(options: any = {}) {
		super(options, 'router:movement');
		this.movementService = options.movementService || new MovementService(options);
		this.initRoutes();
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
		const movements = await this.movementService.getMovements(userId);
		return res.status(200).send({
			'data': movements
		});
	}

	async get(req: express.Request, res: express.Response, next: express.NextFunction) {
		const movementId: string = req.params.id;
		const userId: string = req['user'].id;

		try {
			const data = await this.movementService.getMovement(userId, movementId);
			if (!data) {
				throw new ExpressError('Movement not found', HttpStatus.NOT_FOUND);
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
			const movementData: any = req.body.data;
			movementData.createdBy = req['user'].id;
			const data = await this.movementService.createMovement(movementData);

			return res.status(HttpStatus.CREATED).send({
				'data': data
			});
		} catch (err) {
			next(err);
		}
	}

	async getScores(req: express.Request, res: express.Response, next: express.NextFunction) {
		const movementId: string = req.params.id;
		const userId: string = req['user'].id;

		try {
			const data = await this.movementService.getMovementScores(userId, movementId);

			return res.send({
				'data': data
			});
		} catch (err) {
			next(err);
		}
	}

	async addScore(req: express.Request, res: express.Response, next: express.NextFunction) {
		try {
			const workoutId: string = req.params.id;
			const userId: string = req['user'].id;
			const score: any = req.body.data;
			const data = await this.movementService.addScore(userId, workoutId, score);

			return res.status(HttpStatus.CREATED).send({
				'data': data
			});
		} catch (err) {
			next(err);
		}
	}
}
