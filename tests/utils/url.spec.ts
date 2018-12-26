import * as urlUtil from '../../src/utils/url';

describe('url', function () {
	describe('sanitizeQueryParams', () => {
		const noQueryTests = [
			'/foo',
			'/foo/bar',
			'/foo?',
			'/foo/bar?',
			'/foo/bar?&',
			'/foo/bar?&&&'
		];

		it('Should return the original url when no query params exist', () => {
			noQueryTests.forEach((testDatum) => {
				const val = urlUtil.sanitizeQueryParams(testDatum);
				expect(val).toEqual(testDatum);
			});
		});

		const sanitizedQueryTests = [
			{ data: '/foo?', expected: '/foo?' },
			{ data: '/foo?&', expected: '/foo?&' },
			{ data: '/foo?&&', expected: '/foo?&&' },
			{ data: '/foo#', expected: '/foo#' },
			{ data: '/foo?#', expected: '/foo?#' },
			{ data: '/foo?zork', expected: '/foo?zork=' },
			{ data: '/foo?zork=', expected: '/foo?zork=' },
			{ data: '/foo?zork=true', expected: '/foo?zork=true' },
			{ data: '/foo?zork=true&york=foobar', expected: '/foo?zork=true&york=foobar' },
			{ data: '/foo?zip=zxcv123', expected: '/foo?zip=***MASKED***' },
			{ data: '/foo?zap=9876', expected: '/foo?zap=***MASKED***' },
			{ data: '/foo?ZIP=zxcv123', expected: '/foo?ZIP=***MASKED***' },
			{ data: '/foo?zAP=9876', expected: '/foo?zAP=***MASKED***' },
			{ data: '/foo?zip=zxcv123&zap=9876asdf', expected: '/foo?zip=***MASKED***&zap=***MASKED***' },
			{ data: '/foo?zork=true&york=foobar', expected: '/foo?zork=true&york=foobar' },
			{ data: '/foo?zip=zxcv123&zap=9876asdf&zork=true&york=foobar', expected: '/foo?zip=***MASKED***&zap=***MASKED***&zork=true&york=foobar' },
			{ data: '/foo?ZIp=zxcv123&zap=9876asdf&zork=true&york=foobar', expected: '/foo?ZIp=***MASKED***&zap=***MASKED***&zork=true&york=foobar' },
			{ data: '/foo?zork=true&york=foobar&zip=zxcv123&zap=9876asdf', expected: '/foo?zork=true&york=foobar&zip=***MASKED***&zap=***MASKED***' },
			{ data: '/foo/bar/asdf?zork=true&york=foobar&zip=zxcv123&zap=9876asdf&boo', expected: '/foo/bar/asdf?zork=true&york=foobar&zip=***MASKED***&zap=***MASKED***&boo=' },
			{ data: '/foo/bar/asdf?zork=true&york=foobar&Zip=123&zip=zxcv123&zap=9876asdf&boo', expected: '/foo/bar/asdf?zork=true&york=foobar&Zip=***MASKED***&zip=***MASKED***&zap=***MASKED***&boo=' },
			{ data: '/foo/bar/asdf?zork=true&york=foobar&zip=123&zip=zxcv123&zap=9876asdf&boo', expected: '/foo/bar/asdf?zork=true&york=foobar&zip=***MASKED1***&zip=***MASKED2***&zap=***MASKED***&boo=' }
		];

		sanitizedQueryTests.forEach((testDatum) => {
			it(`Should return ${testDatum.expected} for ${testDatum.data}`, () => {
				const val = urlUtil.sanitizeQueryParams(testDatum.data, ['ZiP', 'zaP']);
				expect(val).toEqual(testDatum.expected);
			});
		});
	});
});
