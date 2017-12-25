import * as sinon from 'sinon';
import * as HttpStatus from 'http-status-codes';

import ExpressError from '../../src/utils/express.error';
import { UserService } from '../../src/services/user';
import { UserType } from '../../src/models/user';
import { Mongoose } from 'mongoose';

describe('UserService', () => {
	const data = {
		'id': 'someid',
		'password': 'pass',
		'email': 'some@email.com',
		'admin': false
	} as UserType;
	let service: UserService;
	let _service: sinon.SinonMock;
	let modelInstance;
	let _modelInstance: sinon.SinonMock;
	let _model: sinon.SinonMock;
	let MockModel: any = function () {
		this.email = 'some@email.com';
		this.athleteId = undefined;
		this.save = () => data;
		return modelInstance;
	};
	MockModel.findOne = () => { };

	beforeEach(() => {
		modelInstance = new MockModel();
		_modelInstance = sinon.mock(modelInstance);
		_model = sinon.mock(MockModel);

		const options = {
			'userModel': MockModel
		};

		service = new UserService(options);
		_service = sinon.mock(service);
	});

	afterEach(() => {
		_model.restore();
		_service.restore();
		_modelInstance.restore();
	});

	function verifyAll() {
		_model.verify();
		_service.verify();
		_modelInstance.verify();
	}

	it('should create an instance without any options', () => {
		const service = new UserService();
		expect(service).toBeDefined();
	});

	describe('register', () => {
		it('should register a user succesfully', async (done) => {
			try {
				_modelInstance.expects('save').resolves(data);

				const res = await service.register(data);
				expect(res).toEqual(data);
				done();
			} catch (err) {
				done(err);
			}
		});
	});

	describe('login', () => {
		it('should successfully login if user exists', async (done) => {
			try {
				_model.expects('findOne').withArgs({ email: data.email }).resolves(data);

				const res = await service.login(data);
				expect(res).toEqual(data);
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should throw unauthorized exception if user does not exist', async (done) => {
			try {
				_model.expects('findOne').resolves();

				const promise = service.login(data);
				await expect(promise).rejects.toHaveProperty('status', HttpStatus.UNAUTHORIZED);
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should throw unauthorized exception if user exists but password does not match', async (done) => {
			try {
				_model.expects('findOne').resolves({ email: data.email, password: 'anotherPassword' });

				const promise = service.login(data);
				await expect(promise).rejects.toHaveProperty('status', HttpStatus.UNAUTHORIZED);
				done();
			} catch (err) {
				done(err);
			}
		});
	});
});
