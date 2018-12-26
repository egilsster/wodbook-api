import * as sinon from 'sinon';
import * as HttpStatus from 'http-status-codes';
import { JsonEnforcer } from '../../src/middleware/json.enforcer';

describe('JsonEnforcer', () => {
	it('should export the middleware stack', () => {
		const jsonEnforcer = new JsonEnforcer();

		expect(jsonEnforcer).toBeDefined();
		expect(jsonEnforcer.init instanceof Function).toBe(true);
	});

	it('should add itself to the app', (done) => {
		const jsonEnforcer: any = new JsonEnforcer();
		jsonEnforcer.init({
			use: (middleware) => {
				expect(middleware).toBeDefined();
				done();
			}
		});
	});

	const invalidJson = [
		'{ "k"ey": "value" }',
		'non json',
		'"key": "value"',
		123,
		false,
		true
	];

	invalidJson.forEach((data) => {
		it(`should throw error if body is not a valid JSON object (data: ${JSON.stringify(data)})`, async () => {
			const jsonEnforcer: any = new JsonEnforcer();
			const ctx: any = {
				get: () => 'multipart/whatever',
				request: {
					body: {
						data
					}
				}
			};

			await expect(jsonEnforcer.handle(ctx)).rejects.toHaveProperty('status', HttpStatus.UNSUPPORTED_MEDIA_TYPE);
		});
	});

	const validJson = [
		JSON.stringify({ name: 'foo' }),
		{ name: 'foo' }
	];

	validJson.forEach((data) => {
		it(`should continue down the chain if body is a valid JSON object (data: ${JSON.stringify(data)})`, async () => {
			const jsonEnforcer: any = new JsonEnforcer();
			const ctx: any = {
				get: () => 'multipart/whatever',
				request: {
					body: {
						data
					}
				}
			};
			const nextStub = sinon.stub();

			await jsonEnforcer.handle(ctx, nextStub);
			expect(nextStub.called).toBe(true);
		});
	});

	it('should continue if method is not post or patch', async () => {
		const jsonEnforcer: any = new JsonEnforcer();
			const ctx: any = {
				method: 'GET',
				get: () => 'application/json',
				request: {
					body: {
						name: 'foo'
					}
				}
			};
			const nextStub = sinon.stub();

			await expect(jsonEnforcer.handle(ctx, nextStub)).resolves.toBeUndefined;
			expect(nextStub.called).toBe(true);
	});
});
