import * as fs from 'fs-extra';
import * as path from 'path';
import * as mongoose from 'mongoose';
import * as sqlite from 'sqlite';
import * as HttpStatus from 'http-status-codes';
import * as _ from 'lodash';

import { UserModel, UserType } from '../models/user';
import { WorkoutModel, WorkoutType } from '../models/workout';
import { MovementModel, MovementType } from '../models/movement';
import { MovementScoreModel, MovementScoreType } from '../models/movement.score';
import { WorkoutScoreModel, WorkoutScoreType } from '../models/workout.score';
import ExpressError from '../utils/express.error';
import { MyWodUtils } from '../utils/my.wod.utils';
import { Logger } from '../utils/logger/logger';
import { WorkoutService } from './workout';

export class MyWodService {
	public static FILE_LOCATION = `${process.cwd()}/mywod`;
	public static AVATAR_LOCATION = `${process.cwd()}/public/avatars`;
	private logger: Logger;
	private userModel: mongoose.Model<UserType>;
	private workoutModel: mongoose.Model<WorkoutType>;
	private workoutScoreModel: mongoose.Model<WorkoutScoreType>;
	private workoutService: WorkoutService;
	private movementModel: mongoose.Model<MovementType>;
	private movementScoreModel: mongoose.Model<MovementScoreType>;

	constructor(public options: any = {}) {
		this.logger = this.options.logger || new Logger('service:workout');
		this.userModel = this.options.userModel || new UserModel().createModel();
		this.workoutModel = this.options.workoutModel || new WorkoutModel().createModel();
		this.workoutScoreModel = this.options.workoutScoreModel || new WorkoutScoreModel().createModel();
		this.workoutService = this.options.workoutService || new WorkoutService();
		this.movementModel = this.options.movementModel || new MovementModel().createModel();
		this.movementScoreModel = this.options.movementScoreModel || new MovementScoreModel().createModel();
	}

	public async saveAthlete(user: any, data: any) {
		if (data.email !== user.email) {
			throw new ExpressError('Emails do not match', 'This myWOD backup does not belong to this email address', HttpStatus.FORBIDDEN);
		}

		let model = await this.userModel.findOne({ email: user.email });

		if (!model) {
			throw new ExpressError('Not found', 'Could not detect a user logged in', HttpStatus.NOT_FOUND);
		}

		model = this.updateUser(model, data);
		return model.save();
	}

	private updateUser(model: UserType, data: any) {
		model.firstName = data.firstName;
		model.lastName = data.lastName;
		model.height = data.height;
		model.weight = data.weight;
		model.gender = data.gender;
		model.dateOfBirth = data.dateOfBirth;
		model.boxName = data.boxName;
		model.avatarUrl = this.saveAvatar(model.id, data.avatar);
		return model;
	}

	private saveAvatar(userId: string, avatar: Buffer) {
		const filename = `${userId}.png`;
		const filepath = path.join(MyWodService.AVATAR_LOCATION, filename);
		fs.ensureDirSync(MyWodService.AVATAR_LOCATION);
		fs.writeFileSync(filepath, avatar);
		return `/public/avatars/${filename}`;
	}

	public async saveWorkouts(user: UserType, workouts: any[]) {
		const savedWorkouts: any[] = [];
		for (const workout of workouts) {
			try {
				if (workout.description.startsWith('This is a sample custom WOD')) {
					continue; // Ignore the sample wod made by myWOD
				}
				workout.createdBy = user._id;
				workout.measurement = MyWodUtils.mapWorkoutMeasurement(workout.scoreType);
				const workoutModelInstance = new this.workoutModel(workout);
				await workoutModelInstance.save();
				savedWorkouts.push(workout.title);
			} catch (err) {
				this.logger.info(`Error migrating workout ${workout.title}. Error: ${err}`);
			}
		}

		return savedWorkouts;
	}

	public async saveWorkoutScores(user: UserType, workoutScores: any[]) {
		const scoresSorted = _.sortBy(workoutScores, ['title']);
		for (const score of scoresSorted) {
			try {
				const workoutModel = await this.workoutService.getWorkoutByTitle(score.title, user.id);
				if (workoutModel) {
					score.workoutId = workoutModel.id;
				}
				const scoreData = MyWodUtils.parseWorkoutScore(score);
				const scoreModelInstance = new this.workoutScoreModel(scoreData);
				scoreModelInstance.createdBy = user._id;
				await scoreModelInstance.save();
			} catch (err) {
				this.logger.info(`Could not migrate score for ${score.title}`);
			}
		}
	}

	public async saveMovementsAndMovementScores(user: UserType, movements: any[], movementScores: any[]) {
		const savedMovements: any[] = [];
		for (const movement of movements) {
			try {
				movement.createdBy = user._id;
				movement.measurement = MyWodUtils.mapMovementMeasurement(movement.type);
				const movementModelInstance = new this.movementModel(movement);
				await movementModelInstance.save();
				savedMovements.push(movement.name);
				await this.saveScoresForMovement(user, movement, movementModelInstance, movementScores);
			} catch (err) {
				this.logger.info(`Error migrating movement '${movement.name}'. Error: ${err}`);
			}
		}

		return savedMovements;
	}

	private async saveScoresForMovement(user: UserType, movement: any, movementModelInstance: MovementType, movementScores: any[]) {
		const scores = MyWodUtils.getScoresForMovement(movement, movementScores);
		for (const score of scores) {
			try {
				score.movementId = movementModelInstance.id;
				const scoreModelInstance = new this.movementScoreModel(score);
				scoreModelInstance.createdBy = user._id;
				await scoreModelInstance.save();
			} catch (err) {
				this.logger.error(`Error migrating movement score '${score.score}' for '${movement.name}'`);
			}
		}
	}

	public async readContentsFromDatabase(filename: string) {
		const resolvedPath = this.resolvePath(filename);
		const db = await sqlite.open(resolvedPath);

		const athlete = await db.get('SELECT * FROM Athlete LIMIT 1;');
		const workouts = await db.all('SELECT * FROM CustomWODs;');
		const movements = await db.all('SELECT * FROM Movement;');
		const movementScores = await db.all('SELECT * FROM MovementSessions;');
		const workoutScores = await db.all('SELECT * FROM MyWODs;');

		return {
			athlete,
			workouts,
			movements,
			movementScores,
			workoutScores
		};
	}

	public deleteDatabaseFile(filename: string) {
		const resolvedPath = this.resolvePath(filename);
		fs.unlinkSync(resolvedPath);
	}

	public resolvePath(filename: string) {
		return path.resolve(process.cwd(), MyWodService.FILE_LOCATION, filename);
	}
}
