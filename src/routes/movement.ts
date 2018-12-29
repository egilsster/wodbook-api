import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as HttpStatus from 'http-status-codes';
import * as _ from 'lodash';
import { MovementService } from '../services/movement';

export class MovementRouter extends Router {
	protected movementService!: MovementService;

	constructor(options: any) {
		super();
		this.movementService = options.movementService || new MovementService(options);
	}

	init(app: Koa) {
		this.prefix('/v1/movements');
		this.get('/', ctx => this.getMovements(ctx));
		this.get('/:id', ctx => this.getMovement(ctx));
		this.post('/', ctx => this.createMovement(ctx));
		this.post('/:id', ctx => this.addScore(ctx));
		app.use(this.routes());
	}

	async getMovements(ctx: Koa.Context) {
		const claims: Claims = ctx.state.claims;
		const data = await this.movementService.getMovements(claims);

		ctx.status = HttpStatus.OK;
		ctx.body = {
			data: data.map((extension) => extension.toObject())
		};
	}

	async getMovement(ctx: Koa.Context) {
		const claims: Claims = ctx.state.claims;
		const movementId: string = ctx.params.id;
		const movement = await this.movementService.getMovementById(movementId, claims);
		const scores = await this.movementService.getScores(movementId, claims);
		const data = movement.toObject();
		_.set(data, 'scores', scores.map(score => score.toObject()));

		ctx.status = HttpStatus.OK;
		ctx.body = data;
	}

	async createMovement(ctx: Koa.Context) {
		const claims: Claims = ctx.state.claims;
		const body = ctx.request.body;
		const data = await this.movementService.createMovement(body, claims);

		ctx.status = HttpStatus.CREATED;
		ctx.body = data.toObject();
	}

	async addScore(ctx: Koa.Context) {
		const claims: Claims = ctx.state.claims;
		const movementId: string = ctx.params.id;
		const score = ctx.request.body;
		const data = await this.movementService.addScore(movementId, score, claims);

		ctx.status = HttpStatus.CREATED;
		ctx.body = data.toObject();
	}
}
