import * as express from 'express';
import * as cls from 'continuation-local-storage';
const session = cls.createNamespace('logger');

/**
 * Stores the current request object using `continuation-local-storage` that
 * can be retrieved later in the request chain
 */
export function logContextInjector() {
	return function (req: express.Request, res: express.Response, next: express.NextFunction) {
		session.bindEmitter(req);
		session.bindEmitter(res);
		session.run(() => {
			session.set('req', req);
			next();
		});
	};
}
