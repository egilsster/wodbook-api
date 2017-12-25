import { DateUtils } from '../../src/utils/date.utils';

describe('DateUtils', () => {
	it('should parse date string to a date', () => {
		const res = DateUtils.parseDate('01-01-2018');
		expect(res.toISOString().startsWith('2018-01-01')).toBe(true);
	});

	it('should return date if parameter is not a string', () => {
		const date = new Date();
		const res = DateUtils.parseDate(date);
		expect(res).toEqual(date);
	});
});
