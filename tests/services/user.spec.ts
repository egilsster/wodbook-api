import * as sinon from 'sinon';

import { UserService } from '../../src/services/user';

describe('UserService', () => {
	const user: any = {
		'id': 'userId',
		'email': 'user@email.com'
	};
	let service: UserService;
	let _service: sinon.SinonMock;
	let modelInstance;
	let _modelInstance: sinon.SinonMock;
	let _model: sinon.SinonMock;
	class MockModel {
		constructor() { return modelInstance; }
		save() { return null; }
		static find() { return null; }
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

		service = new UserService(options);
		_service = sinon.mock(service);
	});

	afterEach(() => {
		_model.verify();
		_service.verify();
		_modelInstance.verify();
	});

	it('should create an instance without any options', () => {
		const service = new UserService();
		expect(service).toBeDefined();
	});

	describe('getUsers', () => {
		it('should return list of workouts', async () => {
			const items = ['user1', 'user2'];
			_model.expects('find').returns(items);

			const res = await service.getUsers();
			expect(res).toEqual(items);
		});
	});

	describe('getUser', () => {
		it('should user with specified email', async () => {
			_model.expects('findOne').withArgs({ 'email': user.email }).returns(user);

			const res = await service.getUser(user);
			expect(res).toEqual(user);
		});
	});
});
