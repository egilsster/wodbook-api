import * as sinon from 'sinon';
import * as fs from 'fs';
import { ConfigService } from '../../src/services/config';

describe('ConfigService', () => {
	let configService: ConfigService, _configService: sinon.SinonMock;
	let _fs: sinon.SinonMock;

	beforeEach(() => {
		configService = new ConfigService();
		_configService = sinon.mock(configService);

		_fs = sinon.mock(fs);
	});

	afterEach(() => {
		_configService.verify();
		_fs.verify();
	});

	describe('getConfig', () => {
		it('should return config', () => {
			const config = configService.getConfig();
			expect(config).toHaveProperty('mongo');
			expect(config.mongo).toHaveProperty('uri', undefined);
			expect(config).toHaveProperty('servicePort', 43210);
			expect(config).toHaveProperty('jwtConfig');
		});

		it('should read values from environment', () => {
			const oldEnv = Object.assign({}, process.env);
			process.env.MONGO_URI = 'mongodb://uri/';
			process.env.PORT = '12345';

			const config = configService.getConfig();
			expect(config).toHaveProperty('mongo');
			expect(config.mongo).toHaveProperty('uri', process.env.MONGO_URI);
			expect(config).toHaveProperty('servicePort', Number(process.env.PORT));
			expect(config).toHaveProperty('jwtConfig');

			process.env = oldEnv;
		});
	});

	describe('_read', () => {
		it('should read property from environment', () => {
			process.env.TEST_VALUE = 'test';

			const value = configService._read('TEST_VALUE');
			expect(value).toEqual('test');

			delete process.env.TEST_VALUE;
		});

		it('should read file if property ends with "_FILE"', () => {
			process.env.TEST_FILE = 'path';

			_fs.expects('readFileSync').withExactArgs('path', 'utf-8').returns('test');

			const value = configService._read('TEST');
			expect(value).toEqual('test');

			delete process.env.TEST_FILE;
		});

		it('should return undefined if property is not present in environment', () => {
			const value = configService._read('NOT_PRESENT');
			expect(value).toBeUndefined();
		});

		it('should throw an error if a file from a FILE property does not exist', () => {
			process.env.TEST_FILE = 'path';

			_fs.expects('readFileSync').withExactArgs('path', 'utf-8').throws();
			expect (() => configService._read('TEST')).toThrow(/Could not read file/);

			delete process.env.TEST_FILE;
		});
	});
});
