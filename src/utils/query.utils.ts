
export class QueryUtils {
	static forMany(userId: string) {
		return { $or: [{ createdBy: userId }, { global: true }] };
	}

	static forOne(filter: object, userId: string) {
		return { $and: [filter, { $or: [{ createdBy: userId }, { global: true }] }] };
	}
}
