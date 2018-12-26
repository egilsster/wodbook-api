import { logContextInjector } from '../../../src/utils/logger/log.context.injector';
import * as cls from 'cls-hooked';
import * as Emitter from 'events';

let session = cls.getNamespace('logger');

describe('logContextInjector', function () {
	it('next middleware has access to request through continuation-local-storage', function (done) {
		let request = new Emitter();
		let state = { data: 'test' };
		logContextInjector()({ request, state }, () => {
			expect(session.get('req')).toEqual(request);
			expect(session.get('state')).toEqual(state);
			done();
		});
	});
	it('next middleware has access to request through continuation-local-storage using promise', function (done) {
		let request = new Emitter();
		let state = { data: 'test' };
		logContextInjector()({ request, state }, () => {
			return new Promise(() => {
				expect(session.get('req')).toEqual(request);
				expect(session.get('state')).toEqual(state);
				done();
			});
		});
	});
	it('next middleware has access to request through continuation-local-storage using async function', function (done) {
		let request = new Emitter();
		let state = { data: 'test' };
		logContextInjector()({ request, state }, async () => {
			expect(session.get('req')).toEqual(request);
			expect(session.get('state')).toEqual(state);
			done();
		});
	});
});
