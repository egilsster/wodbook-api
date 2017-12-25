import * as fs from 'fs';
import * as path from 'path';
import * as mongoose from 'mongoose';
import * as sqlite from 'sqlite';
import { AthleteModel, AthleteType } from '../models/athlete';
import { MongoError } from 'mongodb';

export class MywodService {
	public static FILE_LOCATION = `${process.cwd()}/sql`;
	private athleteModel: mongoose.Model<AthleteType>;

	constructor(public options: any = {}) {
		this.athleteModel = this.options.athleteModel || new AthleteModel().createModel();
	}

	public async saveAthlete(data: any) {
		data.gender = this.mapGender(data.gender);
		const model = new this.athleteModel(data);
		return model.save();
	}

	public async readContentsFromDatabase(filename: string) {
		const resolvedPath = this.resolvePath(filename);
		const db = await sqlite.open(resolvedPath);

		const athlete = await db.get('SELECT * FROM Athlete LIMIT 1;');

		return {
			athlete
		};
	}

	public deleteDatabaseFile(filename: string) {
		const resolvedPath = this.resolvePath(filename);
		fs.unlinkSync(resolvedPath);
	}

	public resolvePath(filename: string) {
		return path.resolve(process.cwd(), MywodService.FILE_LOCATION, filename);
	}

	/**
	 * myWOD app uses numerical values for genders. I want to have it
	 * as a string value so I map it to its correct value here.
	 *
	 * @param value a numeric value for gender
	 */
	public mapGender(value: number) {
		let mapped: string;
		switch (value) {
			case 0:
				mapped = 'female';
				break;
			case 1:
				mapped = 'male';
				break;
			case 2:
				mapped = 'other';
				break;
			default:
				throw new MongoError('Invalid value for gender');
		}
		return mapped;
	}
}
