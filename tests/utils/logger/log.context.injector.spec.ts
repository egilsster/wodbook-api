import * as cls from 'continuation-local-storage';
import * as Emitter from 'events';
import { logContextInjector } from '../../../src/utils/logger/log.context.injector';
const session = cls.getNamespace('logger');

describe('logContextInjector', () => {
	it('next middleware has access to request through continuation-local-storage', (done) => {
		const req: any = new Emitter();

		logContextInjector()(req, new Emitter() as any, () => {
			expect(session.get('req')).toEqual(req);
			done();
		});
	});

	it('next middleware has access to request through continuation-local-storage using promise', (done) => {
		const req: any = new Emitter();

		logContextInjector()(req, new Emitter() as any, () => {
			return new Promise(() => {
				expect(session.get('req')).toEqual(req);
				done();
			});
		});
	});
});
