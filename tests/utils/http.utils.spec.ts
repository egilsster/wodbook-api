import * as _ from 'lodash';
import * as httpUtil from '../../src/utils/http.utils';

describe('sanitizeHeaders', () => {
	let invalidCases: any[] = [
		undefined, null, {}, 1, -1, 0, '', 'foobar'
	];

	invalidCases.forEach((testCase) => {
		it(`Should return empty header set for invalid set: ${testCase}`, () => {
			let val = httpUtil.sanitizeHeaders(testCase);
			expect(val).toEqual({});
		});
	});

	it('should return valid headers', () => {
		let headers = {
			foo: 'bar',
			'x-something-else': 'foobar'
		};
		let val = httpUtil.sanitizeHeaders(headers);
		expect(val).toEqual(headers);
	});

	it('should drop authorization header (case insensitive)', () => {
		const headers = { foo: 'bar', AUTHorization: 'Bearer 123asdf789' };
		let val = httpUtil.sanitizeHeaders(headers);
		expect(val).toEqual({ foo: 'bar' });
	});

	it('should drop cookie header (case insensitive)', () => {
		const headers = { bar: 'foo', COoKIE: 'asdf1234567890qwerty' };
		let val = httpUtil.sanitizeHeaders(headers);
		expect(val).toEqual({ bar: 'foo' });
	});

	it('custom headerLoggingBlacklist overrides default', () => {
		const testHeaders = {
			foo: 'bar',
			bar: 'foo',
			cookie: 'asdf1234567890qwerty',
			authorization: 'asdf 123 qwerty'
		};
		let val = httpUtil.sanitizeHeaders(testHeaders, ['foo']);
		// now cookie and authorization get logged since default blacklist was overridden
		expect(val).toEqual(_.pick(testHeaders, ['bar', 'cookie', 'authorization']));
	});

	it('custom headerLoggingBlacklist overrides default (case insensitive blacklist)', () => {
		const testHeaders = {
			foo: 'bar',
			bar: 'foo',
			cookie: 'asdf1234567890qwerty',
			authorization: 'asdf 123 qwerty'
		};
		let val = httpUtil.sanitizeHeaders(testHeaders, ['FOo']);
		// now cookie and authorization get logged since default blacklist was overridden
		expect(val).toEqual(_.pick(testHeaders, ['bar', 'cookie', 'authorization']));
	});

	it('custom headerLoggingBlacklist overrides default (case insensitive names)', () => {
		const testHeaders = {
			foo: 'bar',
			BAr: 'foo',
			coOKie: 'asdf1234567890qwerty',
			authorization: 'asdf 123 qwerty'
		};
		let val = httpUtil.sanitizeHeaders(testHeaders, ['foo']);
		// now cookie and authorization get logged since default blacklist was overridden
		expect(val).toEqual(_.pick(testHeaders, ['BAr', 'coOKie', 'authorization']));
	});

	it('throws error for non-string header names in blacklist', () => {
		const testHeaders = {
			foo: 'bar',
			bar: 'foo',
			cookie: 'asdf1234567890qwerty',
			authorization: 'asdf 123 qwerty'
		};
		expect(() => httpUtil.sanitizeHeaders(testHeaders, [1, 0, -1, null, undefined, 'a', {}, { foo: 'bar' }] as string[])).toThrow('Invalid header name: 1');
	});

	it('throws Error if passed a non-array for blacklist', () => {
		const testHeaders = {
			foo: 'bar',
			bar: 'foo',
			foobar: 'asdf',
			cookie: 'asdf1234567890qwerty',
			authorization: 'asdf 123 qwerty'
		};
		expect(() => httpUtil.sanitizeHeaders(testHeaders, 'foobar' as any)).toThrow('Invalid header blacklist supplied.');
	});
});
