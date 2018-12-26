import { BodyParser } from '../../src/middleware/body.parser';

describe('BodyParser', () => {
	it('should export the middleware stack', () => {
		const bodyParser = new BodyParser();

		expect(bodyParser).toBeDefined();
		expect(bodyParser.init instanceof Function).toBe(true);
	});

	it('should add itself to the app', (done) => {
		const bodyParser: any = new BodyParser();
		bodyParser.init({
			use: (middleware) => {
				expect(middleware).toBeDefined();
				done();
			}
		});
	});
});
