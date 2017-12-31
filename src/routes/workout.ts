import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as HttpStatus from 'http-status-codes';

import WorkoutService from '../services/workout';
import BaseRouter from './base';
import requireJSON from '../middleware/require.json';

export default class WorkoutRouter extends BaseRouter {
	public path: string = 'workouts';
	private workoutService: WorkoutService;

	constructor(options: any = {}) {
		super(options, 'router:workout');
		this.workoutService = options.workoutService || new WorkoutService(options);
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

		super.useLogger();
	}

	async list(req: express.Request, res: express.Response) {
		const workouts = await this.workoutService.getWorkouts(req['user']);
		res.status(200).send({
			'data': workouts
		});
	}

	async get(req: express.Request, res: express.Response) {
		const workoutId: string = req.params.id;
		const data = await this.workoutService.getWorkout(req['user'], workoutId);

		if (!data) {
			return res.status(HttpStatus.NOT_FOUND).send({ 'msg': `workout not found` });
		}

		res.send({
			'data': data
		});
	}

	async create(req: express.Request, res: express.Response) {
		try {
			const workoutData: any = req.body.data;
			const data = await this.workoutService.createWorkout(req['user'], workoutData);

			return res.status(HttpStatus.CREATED).send({
				'data': data
			});
		} catch (err) {
			this.logger.error(err);
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
		}
	}

	async update(req: express.Request, res: express.Response) {
		const workoutId: string = req.params.id;

		try {
			const { score } = req.body.data;
			const data = await this.workoutService.addScore(req['user'], workoutId, score);
			res.status(HttpStatus.CREATED).send({
				'data': data
			});
		} catch (err) {
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ 'msg': `Could not add score: ${err}` });
		}
	}
}
