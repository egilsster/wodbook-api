import ConfigService from '../../src/services/config';

describe('ConfigService', function () {
	it('should get preset config', async () => {
		const config = await ConfigService.getConfig();
		expect(config).toHaveProperty('servicePort');
		expect(config).toHaveProperty('mongo');
	});
});
