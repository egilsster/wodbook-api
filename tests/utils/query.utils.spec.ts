import { QueryUtils } from '../../src/utils/query.utils';

describe('QueryUtils', () => {
	const userId = 'KkZogjZCwjq6IzE1QAQmrXaKTTMuUp4D';
	const claims: any = { userId: userId };

	describe('forMany', () => {
		it('should build query with userId', () => {
			const expected = {
				$or: [{ userId: userId }, { global: true }]
			};

			const res = QueryUtils.forMany(claims);

			expect(res).toEqual(expected);
		});
	});

	describe('forManyWithFilter', () => {
		it('should build query with filter', () => {
			const filter = { email: 'email' };
			const expected = {
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

			const res = QueryUtils.forManyWithFilter(filter, claims);

			expect(res).toEqual(expected);
		});
	});

	describe('forOneWithFilter', () => {
		it('should build query with filter and userId', () => {
			const filter = { title: 'Fran' };
			const expected = { $and: [filter, { $or: [{ userId: userId }, { global: true }] }] };

			const res = QueryUtils.forOneWithFilter(filter, claims);

			expect(res).toEqual(expected);
		});
	});

	describe('forOne', () => {
		it('should build query with filter and userId', () => {
			const id = 'someId';
			const expected = { $and: [{ id: id }, { $or: [{ userId: claims.userId }, { global: true }] }] };

			const res = QueryUtils.forOne(id, claims);

			expect(res).toEqual(expected);
		});
	});

	describe('forOneWithFilter', () => {
		it('should build query with filter and userId', () => {
			const filter = { title: 'Fran' };
			const expected = { $and: [filter, { $or: [{ userId: userId }, { global: true }] }] };

			const res = QueryUtils.forOneWithFilter(filter, claims);

			expect(res).toEqual(expected);
		});

		it('should build query without claims', () => {
			const filter = { title: 'Fran' };
			const expected = { $or: [filter, { global: true }] };

			const res = QueryUtils.forOneWithFilter(filter);

			expect(res).toEqual(expected);
		});
	});
});
