import * as sinon from 'sinon';
import { routes } from '../../src/routes';

describe('RoutesIndex', () => {
	it('should set up the route stack', () => {
		let app, _app;
		app = { use() { } };
		_app = sinon.mock(app);
		const config = {
			servicePort: 123,
			mongo: {
				uri: 'mongoUri'
			},
			jwt: {
				publicKey: 'publicKey'
			}
		};
		_app.expects('use').atLeast(1);
		routes(app, {
			config,
			authService: {},
			userService: {},
			workoutService: {},
			movementService: {},
			myWodService: {}
		});
		_app.verify();
	});
});
