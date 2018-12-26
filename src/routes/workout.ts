import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as HttpStatus from 'http-status-codes';
import { WorkoutService } from '../services/workout';

export class WorkoutRouter extends Router {
	protected workoutService!: WorkoutService;

	constructor(options: any) {
		super();
		this.workoutService = options.workoutService || new WorkoutService(options);
	}

	init(app: Koa) {
		this.prefix('/v1/workouts');
		this.get('/', ctx => this.getWorkouts(ctx));
		this.get('/:id', ctx => this.getWorkout(ctx));
		this.get('/:id/scores', ctx => this.getScores(ctx));
		this.post('/', ctx => this.createWorkout(ctx));
		this.post('/:id/scores', ctx => this.addScore(ctx));
		app.use(this.routes());
	}

	async getWorkouts(ctx: Koa.Context) {
		const claims: Claims = ctx.state.claims;
		const data = await this.workoutService.getWorkouts(claims);

		ctx.status = HttpStatus.OK;
		ctx.body = {
			data: data.map(item => item.toObject())
		};
	}

	async getWorkout(ctx: Koa.Context) {
		const claims: Claims = ctx.state.claims;
		const itemId: string = ctx.params.id;
		const data = await this.workoutService.getWorkoutById(itemId, claims);

		ctx.status = HttpStatus.OK;
		ctx.body = data.toObject();
	}

	async createWorkout(ctx: Koa.Context) {
		const claims: Claims = ctx.state.claims;
		const body = ctx.request.body;
		const data = await this.workoutService.createWorkout(body, claims);

		ctx.status = HttpStatus.CREATED;
		ctx.body = data.toObject();
	}

	async getScores(ctx: Koa.Context) {
		const claims: Claims = ctx.state.claims;
		const workoutId: string = ctx.params.id;
		const data = await this.workoutService.getScores(workoutId, claims);

		ctx.status = HttpStatus.OK;
		ctx.body = {
			data: data.map(item => item.toObject())
		};
	}

	async addScore(ctx: Koa.Context) {
		const claims: Claims = ctx.state.claims;
		const workoutId: string = ctx.params.id;
		const score = ctx.request.body;
		const data = await this.workoutService.addScore(workoutId, score, claims);

		ctx.status = HttpStatus.CREATED;
		ctx.body = data.toObject();
	}
}
