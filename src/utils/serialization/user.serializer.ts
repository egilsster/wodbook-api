import * as _ from 'lodash';
import { UserType } from '../../models/user';

const PUBLIC_USER_PROPERTIES = [
	'firstName', 'lastName', 'email', 'updatedAt', 'createdAt',
	'boxName', 'dateOfBirth', 'gender', 'height', 'weight', 'avatarUrl'
];

export class UserSerializer {
	constructor(public options: any = {}) { }

	serialize(user: UserType, req) {
		if (!user.id) {
			user.id = user._id;
		}

		let allowedProperties = _.clone(PUBLIC_USER_PROPERTIES);
		if (_.get(req, 'user.admin', false)) {
			allowedProperties.push('id');
		}

		return _.pick(user, allowedProperties);
	}
}
