import * as cls from 'cls-hooked';
let session = cls.createNamespace('logger');

/**
 * Stores the current request object using `continuation-local-storage` that
 *  can be retrieved later in the request chain
 *
 */
export function logContextInjector() {
	return async (ctx, next) => {
		await session.runAndReturn(async () => {
			session.set('req', ctx.request);
			session.set('state', ctx.state);
			await next();
		});
	};
}
