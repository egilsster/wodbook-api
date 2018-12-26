import * as _ from 'lodash';
import { Mongo } from '../models/mongo';
import { User } from '../models/user';
import { ServiceError } from '../utils/service.error';
import { QueryUtils } from '../utils/query.utils';
import { ERROR_TEMPLATES } from '../utils/error.templates';
import { ErrorUtils } from '../utils/error.utils';

export class UserDao {
	constructor(private mongo: Mongo) { }

	async createUser(user: User) {
		const now = new Date();
		user.createdAt = now;
		user.updatedAt = now;

		const userToInsert = user.toObject();

		try {
			await this.mongo.users.insertOne(userToInsert);
		} catch (err) {
			throw ErrorUtils.convertMongoErrorToServiceError(err, { meta: { resourceName: userToInsert.email } });
		}
		return user;
	}

	async getUsers(claims: Claims) {
		const result = await this.mongo.users.find(QueryUtils.forMany(claims)).toArray();
		return _.map(result, (rawUser) => new User(rawUser));
	}

	async getUserById(id: string) {
		const data = await this.mongo.users.findOne({ id: id });
		if (!data) {
			throw new ServiceError(ERROR_TEMPLATES.NOT_FOUND);
		}
		return new User(data);
	}

	async getUserByEmail(email: string) {
		const data = await this.mongo.users.findOne({ email: email });
		if (!data) {
			throw new ServiceError(ERROR_TEMPLATES.NOT_FOUND);
		}
		return new User(data);
	}

	async updateUserByEmail(user: User, claims: Claims) {
		user.updatedAt = new Date();
		const userToUpdate = user.toObject();

		try {
			await this.mongo.users.updateOne(QueryUtils.forOneWithFilter({ email: claims.email }, claims), { $set: userToUpdate });
		} catch (err) {
			throw ErrorUtils.convertMongoErrorToServiceError(err);
		}
		return user;
	}
}
