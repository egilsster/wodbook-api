import * as sinon from 'sinon';
import { HealthService } from '../../src/services/health';

describe('HealthService', () => {
	let healthService: HealthService;
	let mongo;
	let client: { isConnected: Function }, _client: sinon.SinonMock;

	beforeEach(() => {
		client = {
			isConnected() { }
		};
		mongo = { client };
		_client = sinon.mock(client);
		healthService = new HealthService({ mongo });
	});

	describe('isHealthy', () => {
		it('should resolve if mongo is connected', async () => {
			_client.expects('isConnected').resolves(true);
			await expect(healthService.isHealthy()).resolves.toEqual(undefined);
		});

		it('should reject if mongo.client is falsy', async () => {
			healthService = new HealthService({ mongo: {} });
			_client.expects('isConnected').resolves(false);
			await expect(healthService.isHealthy()).rejects.toHaveProperty('message', 'Mongo client is not connected');
		});

		it('should reject if mongo.isConnected returns false', async () => {
			_client.expects('isConnected').resolves(false);
			await expect(healthService.isHealthy()).rejects.toHaveProperty('message', 'Mongo client is not connected');
		});

		it('should reject if mongo.isConnected rejects', async () => {
			_client.expects('isConnected').rejects(new Error('crash'));
			await expect(healthService.isHealthy()).rejects.toHaveProperty('message', 'crash');
		});
	});
});
