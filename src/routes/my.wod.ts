import * as _ from 'lodash';
import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as HttpStatus from 'http-status-codes';
import * as fs from 'fs-extra';
import { MyWodService } from '../services/my.wod';
import { ServiceError } from '../utils/service.error';
import { ERROR_TEMPLATES } from '../utils/error.templates';

export class MyWodRouter extends Router {
	private myWodService: MyWodService;

	constructor(options: any) {
		super();
		this.myWodService = options.myWodService || new MyWodService(options);
	}

	init(app: Koa) {
		this.prefix('/v1/mywod');
		this.post('/migrate', ctx => this.migrate(ctx));
		app.use(this.routes());
	}

	async migrate(ctx: Koa.Context) {
		const file = _.get(ctx, 'request.files.file');
		if (!file) {
			throw new ServiceError(ERROR_TEMPLATES.INVALID_PAYLOAD);
		}
		try {
			const claims: Claims = ctx.state.claims;
			const contents = await this.myWodService.readContentsFromDatabase(file.path);
			const user = await this.myWodService.saveAthlete(contents.athlete, claims);
			const workouts = await this.myWodService.saveWorkouts(contents.workouts, claims);
			const movements = await this.myWodService.saveMovementsAndMovementScores(contents.movements, contents.movementScores, claims);
			await this.myWodService.saveWorkoutScores(contents.workoutScores, claims);

			ctx.status = HttpStatus.OK;
			ctx.body = {
				user: user.toObject(),
				workouts: workouts.map(workout => workout.toObject()),
				movements: movements.map(movement => movement.toObject())
			};
		} catch (err) {
			throw err;
		} finally {
			fs.unlinkSync(file.path);
		}
	}
}
