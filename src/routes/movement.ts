import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as HttpStatus from 'http-status-codes';

import { MovementService } from '../services/movement';
import BaseRouter from './base';
import requireJSON from '../middleware/require.json';

export default class MovementRouter extends BaseRouter {
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
			.get(this.get.bind(this))
			.post(this.update.bind(this));

		this.router.route(`/:id/scores`)
			.get(this.getScores.bind(this));

		super.useLogger();
	}

	async list(req: express.Request, res: express.Response) {
		const userId: string = req['user'].id;
		const movements = await this.movementService.getMovements(userId);
		res.status(200).send({
			'data': movements
		});
	}

	async get(req: express.Request, res: express.Response) {
		const movementId: string = req.params.id;
		const userId: string = req['user'].id;
		const data = await this.movementService.getMovement(userId, movementId);

		if (!data) {
			return res.status(HttpStatus.NOT_FOUND).send({ 'msg': `Movement not found` });
		}

		res.send({
			'data': data
		});
	}

	async create(req: express.Request, res: express.Response) {
		try {
			const movementData: any = req.body.data;
			movementData.createdBy = req['user'].id;
			const data = await this.movementService.createMovement(movementData);

			return res.status(HttpStatus.CREATED).send({
				'data': data
			});
		} catch (err) {
			this.logger.error(err);
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
		}
	}

	async update(req: express.Request, res: express.Response) {
		const movementId: string = req.params.id;
		const userId: string = req['user'].id;

		try {
			const { score } = req.body.data;
			const data = await this.movementService.addScore(userId, movementId, score);
			res.status(HttpStatus.CREATED).send({
				'data': data
			});
		} catch (err) {
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ 'msg': `Could not add score: ${err}` });
		}
	}

	async getScores(req: express.Request, res: express.Response) {
		const movementId: string = req.params.id;
		const userId: string = req['user'].id;
		const data = await this.movementService.getMovementScores(userId, movementId);

		res.send({
			'data': data
		});
	}
}
