import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as HttpStatus from 'http-status-codes';

import { MovementService } from '../services/movement';
import BaseRouter from './base';
import ExpressError from '../utils/express.error';

export default class MovementRouter extends BaseRouter {
	public path: string = 'movements';
	public router: express.Router;
	private movementService: MovementService;

	constructor(options: any = {}) {
		super(options);
		this.movementService = options.movementService || new MovementService(options);
		this.initRoutes();
	}

	initRoutes() {
		this.router.use(bodyParser.json());

		this.router.route(`/`)
			.get(this.list.bind(this))
			.post(this.requireJSON.bind(this), this.create.bind(this));

		this.router.route(`/:id`)
			.get(this.get.bind(this))
			.post(this.update.bind(this));
	}

	requireJSON(req: express.Request, _res: express.Response, next: express.NextFunction) {
		if (!req.is('json')) {
			next(new ExpressError('Unsupported media type', 'The request must be a JSON object', HttpStatus.UNSUPPORTED_MEDIA_TYPE));
		} else {
			next();
		}
	}

	async list(req: express.Request, res: express.Response) {
		const movements = await this.movementService.getMovements(req['user']);
		res.status(200).send({
			'data': movements
		});
	}

	async get(req: express.Request, res: express.Response) {
		const movementId: string = req.params.id;
		const data = await this.movementService.getMovement(req['user'], movementId);

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
			const data = await this.movementService.createMovement(req['user'], movementData);

			return res.status(HttpStatus.CREATED).send({
				'data': data
			});
		} catch (err) {
			console.error(err);
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
		}
	}

	async update(req: express.Request, res: express.Response) {
		const movementId: string = req.params.id;

		try {
			const { score } = req.body.data;
			const data = await this.movementService.addScore(req['user'], movementId, score);
			res.status(HttpStatus.CREATED).send({
				'data': data
			});
		} catch (err) {
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ 'msg': `Could not add score: ${err}` });
		}
	}
}
