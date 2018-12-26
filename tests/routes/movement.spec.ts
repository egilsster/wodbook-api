import * as Koa from 'koa';
import * as sinon from 'sinon';
import * as supertest from 'supertest';
import { Server } from 'http';
import * as HttpStatus from 'http-status-codes';
import * as _ from 'lodash';
import { MovementRouter } from '../../src/routes/movement';
import { MovementService } from '../../src/services/movement';
import { Movement } from '../../src/models/movement';
import { MovementScore } from '../../src/models/movement.score';

describe('Movement Router', () => {
	let request: supertest.SuperTest<supertest.Test>;
	let server: Server;
	let movementRouter: MovementRouter, _router: sinon.SinonMock;
	let movementService: MovementService, _movementService: sinon.SinonMock;
	const userId = 'GbCUZ36TQ1ebQmIF4W4JPu6RhP_MXD-7';
	const claims: any = { userId: userId };
	const movementId = '1';
	let ctx: Koa.Context;
	const movement = new Movement({
		id: 'GbCUZ36TQ1ebQmIF4W4JPu6RhP_MXD-7',
		name: 'Snatch',
		measurement: 'weight',
		userId
	});
	const movementScore = new MovementScore({
		movementId: movement.id,
		measurement: movement.measurement,
		score: 70,
		reps: 1,
		sets: 1
	});

	beforeEach(() => {
		ctx = {
			request: {
				body: movement.toObject()
			},
			params: {
				id: movement.id
			} as any,
			query: {} as any,
			state: { claims } as any
		} as Koa.Context;

		movementService = new MovementService({ policyService: {} });
		_movementService = sinon.mock(movementService);

		movementRouter = new MovementRouter({
			movementService
		});
		_router = sinon.mock(movementRouter);

		const app = new Koa();
		movementRouter.init(app);
		server = app.listen();
		request = supertest(server);
	});

	afterEach(() => {
		server.close();
		_movementService.verify();
		_router.verify();
	});

	describe('constructor', () => {
		it('should create new instance of service', () => {
			const instance = new MovementRouter({});
			expect(instance).toBeDefined();
		});
	});

	describe('init', () => {
		it('Should initialize the app', async () => {
			const app = {
				use: function (routesMiddleware) {
					this.routesMiddleware = routesMiddleware;
				}
			} as any;
			const appUseSpy = sinon.spy(app, 'use');
			const movementRouter = new MovementRouter({ movementService: {} });
			movementRouter.init(app);

			expect(appUseSpy.calledOnce).toBe(true);
		});
	});

	describe('getMovements', () => {
		it('should handle GET /v1/movements', async () => {
			movementRouter.getMovements = async (ctx) => { ctx.status = HttpStatus.OK; };
			await request.get('/v1/movements').expect(HttpStatus.OK);
		});

		it('should return 200 OK when no resources exist', async () => {
			_movementService.expects('getMovements').withExactArgs(claims).resolves([]);

			await movementRouter.getMovements(ctx);

			expect(ctx.status).toEqual(HttpStatus.OK);
		});

		it('should return 200 OK with array of resources', async () => {
			_movementService.expects('getMovements').withExactArgs(claims).resolves([movement]);

			await movementRouter.getMovements(ctx);

			expect(ctx.status).toEqual(HttpStatus.OK);
			expect(ctx.body).toEqual({
				data: [movement.toObject()]
			});
		});
	});

	describe('getMovement', () => {
		it('should handle GET /v1/movements/:id', async () => {
			movementRouter.getMovement = async (ctx) => { ctx.status = HttpStatus.OK; };
			await request.get('/v1/movements/1').expect(HttpStatus.OK);
		});

		it('should return movement when movement with id is found', async () => {
			_movementService.expects('getMovementById').withExactArgs(movementId, claims).resolves(movement);

			ctx.params.id = movementId;
			await movementRouter.getMovement(ctx);

			expect(ctx.status).toEqual(HttpStatus.OK);
			expect(ctx.body).toEqual(movement.toObject());
		});
	});

	describe('createMovement', () => {
		it('should handle POST /v1/movements', async () => {
			movementRouter.createMovement = async (ctx) => { ctx.status = HttpStatus.CREATED; };
			await request.post('/v1/movements').expect(HttpStatus.CREATED);
		});

		it('should return 201 CREATED when creating a movement', async () => {
			_movementService.expects('createMovement').withExactArgs(ctx.request.body, claims).resolves(movement);

			await movementRouter.createMovement(ctx);

			expect(ctx.status).toEqual(HttpStatus.CREATED);
			expect(ctx.body).toEqual(movement.toObject());
		});
	});

	describe('getScores', () => {
		it('should handle GET /v1/movements/:id/scores', async () => {
			movementRouter.getScores = async (ctx) => { ctx.status = HttpStatus.OK; };
			await request.get('/v1/movements/:id/scores').expect(HttpStatus.OK);
		});

		it('should return 200 OK when no scores exist', async () => {
			_movementService.expects('getScores').withExactArgs(movement.id, claims).resolves([]);

			await movementRouter.getScores(ctx);

			expect(ctx.status).toEqual(HttpStatus.OK);
		});

		it('should return 200 OK with array of scores', async () => {
			_movementService.expects('getScores').withExactArgs(movement.id, claims).resolves([movementScore]);

			await movementRouter.getScores(ctx);

			expect(ctx.status).toEqual(HttpStatus.OK);
			expect(ctx.body).toEqual({
				data: [movementScore.toObject()]
			});
		});
	});

	describe('addScore', () => {
		it('should handle POST /v1/movements/:id/scores', async () => {
			movementRouter.addScore = async (ctx) => { ctx.status = HttpStatus.CREATED; };
			await request.post('/v1/movements/:id/scores').expect(HttpStatus.CREATED);
		});

		it('should save score for movement', async () => {
			_.set(ctx, 'request.body', movementScore.toObject());

			_movementService.expects('addScore').withExactArgs(movement.id, movementScore.toObject(), claims).resolves(movementScore);

			await movementRouter.addScore(ctx);

			expect(ctx.status).toEqual(HttpStatus.CREATED);
			expect(ctx.body).toEqual(movementScore.toObject());
		});
	});
});
