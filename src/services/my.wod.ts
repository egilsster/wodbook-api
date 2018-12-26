import * as fs from 'fs-extra';
import * as path from 'path';
import * as sqlite from 'sqlite';
import * as _ from 'lodash';
import { Logger } from '../utils/logger/logger';
import { UserService } from './user';
import { WorkoutService } from './workout';
import { MyWodUtils } from '../utils/my.wod.utils';
import { MovementService } from './movement';
import { Movement } from '../models/movement';
import { ServiceError } from '../utils/service.error';
import { ERROR_TEMPLATES } from '../utils/error.templates';
import { Workout } from '../models/workout';

export class MyWodService {
	public static FILE_LOCATION = `${process.cwd()}/mywod`;
	public static AVATAR_LOCATION = `${process.cwd()}/public/avatars`;
	private logger: Logger;
	private userService: UserService;
	private workoutService: WorkoutService;
	private movementService: MovementService;

	constructor(options: any) {
		this.logger = options.logger || new Logger('service:workout');
		this.userService = options.userService || new UserService(options);
		this.workoutService = options.workoutService;
		this.movementService = options.movementService;
	}

	public async saveAthlete(data: any, claims: Claims) {
		if (data.email !== claims.email) {
			throw new ServiceError(ERROR_TEMPLATES.FORBIDDEN, { meta: { message: 'This myWOD backup does not belong to this email address' } });
		}

		const userToUpdate = await this.userService.getUserByEmail(data.email);

		if (!userToUpdate) {
			throw new ServiceError(ERROR_TEMPLATES.NOT_FOUND, { meta: { message: 'Could not detect a user logged in' } });
		}

		userToUpdate['boxName'] = data['boxName'];
		userToUpdate['dateOfBirth'] = new Date(data['dateOfBirth']);
		userToUpdate['email'] = data['email'];
		userToUpdate['firstName'] = data['firstName'];
		userToUpdate['height'] = data['height'];
		userToUpdate['lastName'] = data['lastName'];
		userToUpdate['weight'] = data['weight'];

		data.avatarUrl = this.saveAvatar(userToUpdate.id, data.avatar);
		return this.userService.updateUserByEmail(userToUpdate, claims);
	}

	public saveAvatar(userId: string, avatar: Buffer) {
		const filename = `${userId}.png`;
		const filepath = path.join(MyWodService.AVATAR_LOCATION, filename);
		fs.ensureDirSync(MyWodService.AVATAR_LOCATION);
		fs.writeFileSync(filepath, avatar);
		return `/public/avatars/${filename}`;
	}

	public async saveWorkouts(workouts: any[], claims: Claims) {
		const savedWorkouts: Workout[] = [];
		for (const workout of workouts) {
			try {
				if (workout.description.startsWith('This is a sample custom WOD')) {
					continue; // Ignore the sample wod made by myWOD
				}
				workout.userId = claims.userId;
				workout.measurement = MyWodUtils.mapWorkoutMeasurement(workout.scoreType);
				workout.name = workout.title;
				const newWorkout = await this.workoutService.createWorkout(workout, claims);
				savedWorkouts.push(newWorkout);
			} catch (err) {
				this.logger.info(`Error migrating workout ${workout.title}. Error: ${err}`);
			}
		}

		return savedWorkouts;
	}

	public async saveWorkoutScores(workoutScores: any[], claims: Claims) {
		const scoresSorted = _.sortBy(workoutScores, ['title']);
		for (const score of scoresSorted) {
			try {
				const workoutModel = await this.workoutService.getWorkoutByName(score.title, claims);
				if (!workoutModel) {
					continue; // Do not save scores that do not belong to a registered workout
				}
				const scoreData = MyWodUtils.parseWorkoutScore(score);
				const res = await this.workoutService.addScore(workoutModel.id, scoreData, claims);
				return res;
			} catch (err) {
				this.logger.info(`Could not migrate score for ${score.title}`);
			}
		}
	}

	public async saveMovementsAndMovementScores(movements: any[], movementScores: any[], claims: Claims) {
		const savedMovements: Movement[] = [];
		for (const movement of movements) {
			try {
				movement.userId = claims.userId;
				movement.measurement = MyWodUtils.mapMovementMeasurement(movement.type);
				const newMovement = await this.movementService.createMovement(movement, claims);
				savedMovements.push(newMovement);
				await this.saveScoresForMovement(movement, newMovement, movementScores, claims);
			} catch (err) {
				this.logger.info(`Error migrating movement '${movement.name}'. Error: ${err}`);
			}
		}

		return savedMovements;
	}

	public async saveScoresForMovement(myWodMovement: object, movement: Movement, movementScores: any[], claims: Claims) {
		const scores = MyWodUtils.getScoresForMovement(myWodMovement, movementScores);
		for (const score of scores) {
			try {
				await this.movementService.addScore(movement.id, score, claims);
			} catch (err) {
				this.logger.error(`Error migrating movement score '${score.score}' for '${movement.name}'`);
			}
		}
	}

	public async readContentsFromDatabase(filePath: string) {
		const db = await sqlite.open(filePath);

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
}
