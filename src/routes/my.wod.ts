import * as express from 'express';
import * as multer from 'multer';
import * as HttpStatus from 'http-status-codes';

import ExpressError from '../utils/express.error';
import BaseRouter from './base';
import { MyWodService } from '../services/my.wod';

const storage = multer.diskStorage({ destination: MyWodService.FILE_LOCATION });
const upload = multer({ storage });

export default class MywodRouter extends BaseRouter {
	public path: string = 'mywod';
	private mywodService: MyWodService;

	constructor(options: any = {}) {
		super(options, 'router:mywod');
		this.mywodService = options.mywodService || new MyWodService(options);
		this.initRoutes();
	}

	protected initRoutes() {
		this.router.route('/migrate')
			.post(upload.single('file'), this.migrate.bind(this));

		super.useLogger();
	}

	async migrate(req: express.Request, res: express.Response, next: express.NextFunction) {
		const file = req.file;
		try {
			if (!file) {
				throw new ExpressError('Bad request', 'The form contains no file', HttpStatus.BAD_REQUEST);
			}

			const contents = await this.mywodService.readContentsFromDatabase(file.filename);
			const user = await this.mywodService.saveAthlete(req['user'], contents.athlete);
			const workouts = await this.mywodService.saveWorkouts(user, contents.workouts);
			const movements = await this.mywodService.saveMovementsAndMovementScores(user, contents.movements, contents.movementScores);
			await this.mywodService.saveWorkoutScores(user, contents.workoutScores);

			// Add serializer

			return res.status(HttpStatus.OK).send({
				'data': {
					'user': user,
					'workouts': workouts,
					'movements': movements
				}
			});
		} catch (err) {
			next(err);
		} finally {
			this.mywodService.deleteDatabaseFile(file.filename);
		}
	}
}
