
export class QueryUtils {
	static forMany(claims: Claims) {
		return {
			$or: [
				{ userId: claims.userId },
				{ global: true }
			]
		};
	}

	static forManyWithFilter(filter: object, claims: Claims) {
		return {
			$and: [
				filter,
				{
					$or: [
						{ userId: claims.userId },
						{ global: true }
					]
				}
			]
		};
	}

	static forOne(resourceId: string, claims: Claims) {
		return { $and: [{ id: resourceId }, { $or: [{ userId: claims.userId }, { global: true }] }] };
	}

	static forOneWithFilter(filter: object, claims?: Claims) {
		if (claims) {
			return { $and: [filter, { $or: [{ userId: claims.userId }, { global: true }] }] };
		} else {
			return { $or: [filter, { global: true }] };
		}
	}
}
