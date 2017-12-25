import * as fs from 'fs';
import * as path from 'path';
import * as sinon from 'sinon';
import * as HttpStatus from 'http-status-codes';

import ExpressError from '../../src/utils/express.error';
import { MywodService } from '../../src/services/mywod';
import { MongoError } from 'mongodb';

describe('MywodService', () => {
	const filename = 'filename';
	let data = {
		'id': 'someid',
		'firstName': 'firstname',
		'lastName': 'lastname',
		'gender': 1,
		'email': 'some@email.com',
		'dateOfBirth': '1000-10-01',
		'height': 100,
		'weight': 100,
		'boxName': 'string'
	};
	let _fs: sinon.SinonMock;
	let service: MywodService, _service: sinon.SinonMock;
	let modelInstance, _modelInstance: sinon.SinonMock;
	let _model: sinon.SinonMock;
	let MockModel: any = function () {
		this.name = 'some@email.com';
		this.save = () => data;
		return modelInstance;
	};
	MockModel.findOne = () => { };

	beforeEach(() => {
		_fs = sinon.mock(fs);

		modelInstance = new MockModel();
		_modelInstance = sinon.mock(modelInstance);
		_model = sinon.mock(MockModel);

		const options = {
			'userModel': MockModel
		};

		service = new MywodService(options);
		_service = sinon.mock(service);
	});

	afterEach(() => {
		_fs.restore();
		_model.restore();
		_service.restore();
		_modelInstance.restore();
	});

	function verifyAll() {
		_fs.verify();
		_model.verify();
		_service.verify();
		_modelInstance.verify();
	}

	it('should create an instance without any options', () => {
		const service = new MywodService();
		expect(service).toBeDefined();
	});

	describe('saveAthlete', () => {
		it('should successfully save a user model', async (done) => {
			try {
				_modelInstance.expects('save').resolves(data);

				const promise = service.saveAthlete(data);
				await expect(promise).resolves.toEqual(data);
				verifyAll();
				done();
			} catch (err) {
				done(err);
			}
		});
	});

	describe('readContentsFromDatabase', () => {
		it('should return an object with the contents', () => {

		});
	});

	describe('deleteDatabaseFile', () => {
		it('should call unlinkSync with resolved path', () => {
			const fullPath = 'fullPath';

			_service.expects('resolvePath').withArgs(filename).returns(fullPath);
			_fs.expects('unlinkSync').withArgs(fullPath);

			service.deleteDatabaseFile(filename);
		});
	});

	describe('resolvePath', () => {
		it('should return resolved path', () => {
			const _pathResolve = sinon.stub(path, 'resolve');

			_pathResolve.returns('fullPath');

			const res = service.resolvePath(filename);
			expect(res).toEqual('fullPath');
			_pathResolve.restore();
		});
	});

	describe('mapGender', () => {
		it('should map valid numerical values to its appropriate string value', () => {
			const genders = ['female', 'male', 'other'];

			for (let i = 0; i < genders.length; ++i) {
				const gender = genders[i];
				const res = service.mapGender(i);
				expect(res).toEqual(gender);
			}
		});

		it('should throw exception if numerical value is not a valid gender', () => {
			expect(() => {
				service.mapGender(3);
			}).toThrow();
		});
	});
});
