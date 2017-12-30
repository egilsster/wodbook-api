import * as fs from 'fs';
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
import { MywodUtils } from '../utils/mywod.utils';

export class MywodService {
	public static FILE_LOCATION = `${process.cwd()}/mywod`;
	private userModel: mongoose.Model<UserType>;
	private workoutModel: mongoose.Model<WorkoutType>;
	private workoutScoreModel: mongoose.Model<WorkoutScoreType>;
	private movementModel: mongoose.Model<MovementType>;
	private movementScoreModel: mongoose.Model<MovementScoreType>;

	constructor(public options: any = {}) {
		this.userModel = this.options.userModel || new UserModel().createModel();
		this.workoutModel = this.options.workoutModel || new WorkoutModel().createModel();
		this.workoutScoreModel = this.options.workoutScoreModel || new WorkoutScoreModel().createModel();
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
		return model;
	}

	public async saveWorkouts(user: UserType, workouts: any[]) {
		const savedWorkouts: any[] = [];
		for (const workout of workouts) {
			try {
				if (workout.description.startsWith('This is a sample custom WOD')) {
					continue; // Ignore the sample wod made by myWOD
				}
				workout.createdBy = user._id;
				workout.measurement = workout.scoreType;
				const workoutModelInstance = new this.workoutModel(workout);
				await workoutModelInstance.save();
				savedWorkouts.push(workoutModelInstance.title);
			} catch (err) {
				console.log(`Error migrating workout ${workout.title}. Error: ${err}`);
			}
		}

		return savedWorkouts;
	}

	public async saveWorkoutScores(user: UserType, workoutScores: any[]) {
		const scoresSorted = _.sortBy(workoutScores, ['title']);
		for (const score of scoresSorted) {
			try {
				const scoreData = MywodUtils.parseWorkoutScore(score);
				const scoreModelInstance = new this.workoutScoreModel(scoreData);
				scoreModelInstance.createdBy = user._id;
				await scoreModelInstance.save();

				const workoutModel = await this.workoutModel.findOne({ 'title': score.title, 'createdBy': user._id });
				if (workoutModel) {
					workoutModel.scores.push(scoreModelInstance._id);
					await workoutModel.save();
				}
			} catch (err) {
				console.log(`Could not migrate score for ${score.title}`);
			}
		}
	}

	public async saveMovementsAndMovementScores(user: UserType, movements: any[], movementScores: any[]) {
		const savedMovements: string[] = [];

		for (const movement of movements) {
			try {
				movement.createdBy = user._id;
				movement.measurement = movement.type;
				const movementModelInstance = new this.movementModel(movement);

				const scores = MywodUtils.getScoresForMovement(movement, movementScores);
				await this.saveScoresForMovement(user, movement, movementModelInstance, scores);
				savedMovements.push(movementModelInstance.name);
			} catch (err) {
				console.log(`Error migrating movement '${movement.name}'. Error: ${err}`);
			}
		}
		return savedMovements;
	}

	private async saveScoresForMovement(user: UserType, movement: any, movementModelInstance: MovementType, scores: any[]) {
		for (const score of scores) {
			try {
				const scoreModelInstance = new this.movementScoreModel(score);
				scoreModelInstance.createdBy = user._id;
				await scoreModelInstance.save();
				movementModelInstance.scores.push(scoreModelInstance._id);
			} catch (err) {
				console.error(`Error migrating movement score '${score.score}' for '${movement.name}'`);
			}
		}
		return movementModelInstance.save();
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
		return path.resolve(process.cwd(), MywodService.FILE_LOCATION, filename);
	}
}
