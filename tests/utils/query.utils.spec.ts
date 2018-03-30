import { QueryUtils } from '../../src/utils/query.utils';

describe('QueryUtils', () => {
	const userId = 'someId';

	describe('forMany', () => {
		it('should build query with userId', () => {
			const expected = {
				'$or': [{ 'createdBy': userId }, { 'global': true }]
			};

			const res = QueryUtils.forMany(userId);

			expect(res).toEqual(expected);
		});
	});

	describe('forOne', () => {
		it('should build query with filter and userId', () => {
			const filter = { 'title': 'Fran' };
			const expected = { '$and': [filter, { '$or': [{ 'createdBy': userId }, { 'global': true }] }] };

			const res = QueryUtils.forOne(filter, userId);

			expect(res).toEqual(expected);
		});
	});
});
