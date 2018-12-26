import { UID } from '../../src/utils/uid';

describe('UID', () => {
	describe('new', () => {
		it('should generate new UID of length 32', () => {
			const uid = UID.new();
			expect(uid.length).toBe(32);
		});
	});

	describe('isValid', () => {
		it('should validate UIDs', () => {
			const valid = [
				'_n4RwqLPv7ZngwPqgUZzfJeOahLtYB9L',
				'PU3yrBma8z4a5eoA9W5q66oS_rKaOMZU',
				'-7yr-0ktf6hexMi8ILcd4EvIec6Bd7vj',
				'jmTdpv-0Yt0f4YmTgu_DhcQ0PUAkbGn2'
			];

			valid.forEach(uid => {
				expect(UID.isValid(uid)).toBe(true);
			});
		});

		it('should return false for invalid UIDs', () => {
			const invalid = [
				'',
				'xxxA987FBC9-4BED-3078-CF07-9141BA07C9F3',
				'934859',
				'AAAAAAAA-1111-1111-AAAG-111111111111',
				'A987FBC9-4BED-5078-AF07-9141BA07C9F3',
				'A987FBC9-4BED-3078-CF07-9141BA07C9F3',
			];

			invalid.forEach(uid => {
				expect(UID.isValid(uid)).toBe(false);
			});
		});

		it('should throw exception if id is not a string', () => {
			const invalid: any[] = [
				null,
				undefined,
				123,
				false,
				true,
				{},
				[]
			];

			invalid.forEach(uid => {
				expect(() => UID.isValid(uid)).toThrow(TypeError);
			});
		});
	});
});
