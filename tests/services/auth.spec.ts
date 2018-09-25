import * as sinon from 'sinon';
import * as HttpStatus from 'http-status-codes';

import { AuthService } from '../../src/services/auth';
import { UserType } from '../../src/models/user';

describe('AuthService', () => {
	const data = {
		'id': 'someId',
		'password': 'pass',
		'email': 'some@email.com',
		'admin': false
	} as UserType;
	let service: AuthService;
	let _service: sinon.SinonMock;
	let modelInstance;
	let _modelInstance: sinon.SinonMock;
	let _model: sinon.SinonMock;
	class MockModel {
		constructor() { return modelInstance; }
		save() { return null; }
		static findOne() { return null; }
	}

	beforeEach(() => {
		modelInstance = new MockModel();
		_modelInstance = sinon.mock(modelInstance);
		_model = sinon.mock(MockModel);

		const options = {
			'userModel': MockModel,
			'logger': {
				info() { },
				warn() { },
				error() { }
			}
		};

		service = new AuthService(options);
		_service = sinon.mock(service);
	});

	afterEach(() => {
		_model.verify();
		_service.verify();
		_modelInstance.verify();
	});

	it('should create an instance without any options', () => {
		const service = new AuthService();
		expect(service).toBeDefined();
	});

	describe('register', () => {
		it('should register a user successfully', async () => {
			_modelInstance.expects('save').resolves(data);

			const promise = service.register(data);
			await expect(promise).resolves.toEqual(data);
		});
	});

	describe('login', () => {
		it('should successfully login if user exists', async () => {
			_model.expects('findOne').withArgs({ email: data.email }).resolves(data);

			const promise = service.login(data);
			await expect(promise).resolves.toEqual(data);
		});

		it('should throw unauthorized exception if user does not exist', async () => {
			_model.expects('findOne').resolves();

			const promise = service.login(data);
			await expect(promise).rejects.toHaveProperty('status', HttpStatus.UNAUTHORIZED);
		});

		it('should throw unauthorized exception if user exists but password does not match', async () => {
			_model.expects('findOne').resolves({ email: data.email, password: 'anotherPassword' });

			const promise = service.login(data);
			await expect(promise).rejects.toHaveProperty('status', HttpStatus.UNAUTHORIZED);
		});
	});
});
