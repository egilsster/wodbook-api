import { MywodUtils } from '../../src/utils/mywod.utils';

describe('MywodUtils', () => {
	describe('mapDate', () => {
		it('should parse date string to a date', () => {
			const res = MywodUtils.mapDate('01-01-2018');
			expect(res.toISOString().startsWith('2018-01-01')).toBe(true);
		});

		it('should return date if parameter is not a string', () => {
			const date = new Date();
			const res = MywodUtils.mapDate(date);
			expect(res).toEqual(date);
		});
	});

	describe('mapScoreType', () => {

	});

	describe('mapGender', () => {
		it('should map valid numerical values to its appropriate string value', () => {
			const genders = ['female', 'male', 'other'];

			for (let i = 0; i < genders.length; ++i) {
				const gender = genders[i];
				const res = MywodUtils.mapGender(i);
				expect(res).toEqual(gender);
			}
		});

		it(`should get 'other' if numerical value does not map to female or male`, () => {
			const res = MywodUtils.mapGender(3);
			expect(res).toEqual('other');
		});
	});
});
