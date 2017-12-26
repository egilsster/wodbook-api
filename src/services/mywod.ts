import * as fs from 'fs';
import * as path from 'path';
import * as mongoose from 'mongoose';
import * as sqlite from 'sqlite';
import * as HttpStatus from 'http-status-codes';

import { UserModel, UserType } from '../models/user';
import { WorkoutModel, WorkoutType } from '../models/workout';
import ExpressError from '../utils/express.error';
import { MywodUtils } from '../utils/mywod.utils';

export class MywodService {
	public static FILE_LOCATION = `${process.cwd()}/sql`;
	private userModel: mongoose.Model<UserType>;
	private workoutModel: mongoose.Model<WorkoutType>;

	constructor(public options: any = {}) {
		this.userModel = this.options.userModel || new UserModel().createModel();
		this.workoutModel = this.options.workoutModel || new WorkoutModel().createModel();
	}

	public async saveAthlete(user: any, data: any) {
		const model = await this.userModel.findOne({ email: user.email });

		if (!model) {
			throw new ExpressError('Not found', 'Could not detect a user logged in', HttpStatus.NOT_FOUND);
		}

		data.gender = MywodUtils.mapGender(data.gender);
		this.updateUser(model, data);
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
	}

	public async saveWorkouts(user: UserType, data: any[]) {
		const savedWorkouts: string[] = [];
		for (const workout of data) {
			try {
				if (workout.description.startsWith('This is a sample custom WOD')) {
					continue; // Ignore the sample wod made by myWOD
				}
				workout.scoreType = MywodUtils.mapWorkoutType(workout.scoreType);
				workout.createdBy = user._id;
				const model = new this.workoutModel(workout);
				await model.save();
				savedWorkouts.push(model.title);
			} catch (err) {
				console.log(`Error migrating workout ${workout.title}. Error: ${err}`);
			}
		}
		return savedWorkouts;
	}

	public async readContentsFromDatabase(filename: string) {
		const resolvedPath = this.resolvePath(filename);
		const db = await sqlite.open(resolvedPath);

		const athlete = await db.get('SELECT * FROM Athlete LIMIT 1;');
		const workouts = await db.all('SELECT * FROM CustomWODs;');

		return {
			athlete,
			workouts
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
