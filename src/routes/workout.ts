import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as HttpStatus from 'http-status-codes';

import { WorkoutService } from '../services/workout';
import BaseRouter from './base';
import requireJSON from '../middleware/require.json';
import ExpressError from '../utils/express.error';

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
			.get(this.get.bind(this));

		this.router.route(`/:id/scores`)
			.get(this.getScores.bind(this))
			.post(this.addScore.bind(this));

		super.useLogger();
	}

	async list(req: express.Request, res: express.Response) {
		const userId: string = req['user'].id;
		const workouts = await this.workoutService.getWorkouts(userId);
		return res.status(200).send({
			'data': workouts
		});
	}

	async get(req: express.Request, res: express.Response, next: express.NextFunction) {
		const workoutId: string = req.params.id;
		const userId: string = req['user'].id;

		try {
			const data = await this.workoutService.getWorkout(userId, workoutId);
			if (!data) {
				throw new ExpressError('404 Not found', 'Workout not found', HttpStatus.NOT_FOUND);
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
			const workoutData: any = req.body.data;
			workoutData.createdBy = req['user'].id;
			const data = await this.workoutService.createWorkout(workoutData);

			return res.status(HttpStatus.CREATED).send({
				'data': data
			});
		} catch (err) {
			next(err);
		}
	}

	async getScores(req: express.Request, res: express.Response, next: express.NextFunction) {
		try {
			const workoutId: string = req.params.id;
			const userId: string = req['user'].id;
			const data = await this.workoutService.getWorkoutScores(userId, workoutId);

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
			const data = await this.workoutService.addScore(userId, workoutId, score);

			return res.status(HttpStatus.CREATED).send({
				'data': data
			});
		} catch (err) {
			next(err);
		}
	}
}
