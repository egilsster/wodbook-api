import * as fs from 'fs-extra';
import * as path from 'path';
import * as sinon from 'sinon';
import * as HttpStatus from 'http-status-codes';
import * as sqlite from 'sqlite';

import { MyWodService } from '../../src/services/my.wod';
import { TrainingService } from '../../src/services/training';

describe('MywodService', () => {
	const user: any = {
		_id: 'userId',
		id: 'userId',
		email: 'user@email.com'
	};
	const filename = 'filename';
	let _sqlite: sinon.SinonMock;
	let db, _db: sinon.SinonMock;
	let _fs: sinon.SinonMock;
	let service: MyWodService, _service: sinon.SinonMock;
	let trainingService, _trainingService: sinon.SinonMock;
	let modelInstance, _modelInstance: sinon.SinonMock;
	let _model: sinon.SinonMock;
	class MockModel {
		constructor() { return modelInstance; }
		save() { return null; }
		static findOne() { return null; }
	}

	beforeEach(() => {
		const logger = {
			info() { },
			warn() { },
			error() { }
		};

		_sqlite = sinon.mock(sqlite);
		db = {
			get() { },
			all() { }
		};
		_db = sinon.mock(db);
		_fs = sinon.mock(fs);

		modelInstance = new MockModel();
		_modelInstance = sinon.mock(modelInstance);
		_model = sinon.mock(MockModel);

		trainingService = new TrainingService(MockModel, MockModel);
		_trainingService = sinon.mock(trainingService);

		const options = {
			userModel: MockModel,
			workoutModel: MockModel,
			workoutScoreModel: MockModel,
			workoutService: trainingService,
			movementModel: MockModel,
			movementScoreModel: MockModel,
			logger: logger
		};

		service = new MyWodService(options);
		_service = sinon.mock(service);
	});

	afterEach(() => {
		_sqlite.verify();
		_db.verify();
		_fs.verify();
		_model.verify();
		_service.verify();
		_modelInstance.verify();
	});

	it('should create an instance without any options', () => {
		const service = new MyWodService();
		expect(service).toBeDefined();
	});

	describe('saveAthlete', () => {
		const userData = {
			id: 'someid',
			firstName: 'firstname',
			lastName: 'lastname',
			gender: 1,
			email: 'user@email.com',
			dateOfBirth: '1000-10-01',
			height: 100,
			weight: 100,
			boxName: 'string'
		};

		it('should successfully update a user if he exists', async (done) => {
			try {
				_model.expects('findOne').resolves(modelInstance);
				_modelInstance.expects('save').resolves(userData);

				const promise = service.saveAthlete(user, userData);
				await expect(promise).resolves.toEqual(userData);
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should throw 403 Forbidden if the email from the backup dont match', async (done) => {
			try {
				const promise = service.saveAthlete({ email: 'another@email.com' }, userData);
				await expect(promise).rejects.toHaveProperty('status', HttpStatus.FORBIDDEN);
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should throw 404 Not found if the user info in the JWT does not exist', async (done) => {
			try {
				_model.expects('findOne').resolves(null);

				const promise = service.saveAthlete(user, userData);
				await expect(promise).rejects.toHaveProperty('status', HttpStatus.NOT_FOUND);
				done();
			} catch (err) {
				done(err);
			}
		});
	});

	describe('saveWorkouts', () => {
		const workouts = [
			{
				id: 'id1',
				description: 'This is a sample custom WOD',
				title: 'w1',
				scoreType: 'For Time:'
			},
			{
				id: 'id2',
				description: 'Great workout',
				title: 'w2',
				scoreType: 'For Time:'
			}
		];

		it('should successfully save a list of workouts to a user', async (done) => {
			try {
				_modelInstance.expects('save').resolves();

				const res = await service.saveWorkouts(user, workouts);
				expect(res).toBeInstanceOf(Array);
				expect(res.length).toBe(1);
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should ignore failed migrations', async (done) => {
			try {
				_modelInstance.expects('save').rejects(new Error('Saving failed'));

				const res = await service.saveWorkouts(user, workouts);
				expect(res).toBeInstanceOf(Array);
				expect(res.length).toBe(0);
				done();
			} catch (err) {
				done(err);
			}
		});
	});

	describe('saveWorkoutScores', () => {
		const scores = [
			{
				primaryClientID: 'i-1fa65b03fbd343ef86270ad1bad1c369-2017-01-02 17:32:34 +0000',
				primaryRecordID: 1,
				hasChangesForServer: 0,
				parseId: 'OPssEL9w2Q',
				title: '181017',
				date: '2017-11-18',
				scoreType: 'For Time:',
				score: '14:20',
				personalRecord: 0,
				asPrescribed: 1,
				description: '5 rounds:\n15 ft rope climb, 3 ascents,\n10 toes-to-bar,\n21 walking lunges with 20.4/13.6kg plate overhead,\n400 meter run',
				notes: '',
				heartRate: 'NA',
				deleted: 0
			},
			{
				primaryClientID: 'i-2fb15b03cbs313ef86270ad1eff1a340-2017-01-02 12:14:48 +0000',
				primaryRecordID: 1,
				hasChangesForServer: 0,
				parseId: 'OPssEL9w2Q',
				title: 'Fran',
				date: '2017-12-06',
				scoreType: 'For Time:',
				score: '3:22',
				personalRecord: 1,
				asPrescribed: 1,
				description: 'You already know what it is',
				notes: '',
				heartRate: 'NA',
				deleted: 0
			}
		];

		it('should save workout scores', async () => {
			_trainingService.expects('getByFilter').resolves({ id: 'workoutId' });
			_modelInstance.expects('save').once().resolves();
			_trainingService.expects('getByFilter').resolves();

			const promise = service.saveWorkoutScores(user, scores);
			await expect(promise).resolves.toBeUndefined();
		});

		it('should not care about failed score migration', async () => {
			_trainingService.expects('getByFilter').twice().resolves({ id: 'workoutId' });
			_modelInstance.expects('save').twice().rejects();

			const promise = service.saveWorkoutScores(user, scores);
			await expect(promise).resolves.toBeUndefined();
		});
	});

	describe('saveMovementsAndMovementScores', () => {
		const movements = [
			{
				primaryClientID: 'initial',
				primaryRecordID: 1,
				hasChangesForServer: 1,
				parseId: null,
				name: 'Thruster',
				type: 0,
				everModifiedByAthlete: 0,
				deleted: 0
			},
			{
				primaryClientID: 'initial',
				primaryRecordID: 3,
				hasChangesForServer: 1,
				parseId: null,
				name: 'Snatch',
				type: 0,
				everModifiedByAthlete: 0,
				deleted: 0
			},
			{
				primaryClientID: 'i-1fa65b03fbd343ef86270ad1bad1c369-2017-01-02 17:32:34 +0000',
				primaryRecordID: 5,
				hasChangesForServer: 1,
				parseId: null,
				name: 'HSPU',
				type: 2,
				everModifiedByAthlete: 1,
				deleted: 0
			}
		];

		const movementScores = [
			{
				primaryClientID: 'i-1fa65b03fbd343ef86270ad1bad1c369-2017-01-02 17:32:34 +0000',
				primaryRecordID: 50,
				foreignMovementClientID: 'i-1fa65b03fbd343ef86270ad1bad1c369-2017-01-02 17:32:34 +0000',
				foreignMovementRecordID: 5,
				hasChangesForServer: 1,
				parseId: null,
				date: '2017-11-07',
				measurementAValue: 7,
				measurementAUnitsCode: 8,
				measuermentB: '0:00',
				sets: '1',
				notes: '',
				deleted: 0
			},
			{
				primaryClientID: 'i-1fa65b03fbd343ef86270ad1bad1c369-2017-01-02 17:32:34 +0000',
				primaryRecordID: 44,
				foreignMovementClientID: 'initial',
				foreignMovementRecordID: 3,
				hasChangesForServer: 1,
				parseId: null,
				date: '2017-04-11',
				measurementAValue: 70,
				measurementAUnitsCode: 1,
				measuermentB: '1',
				sets: '1',
				notes: '',
				deleted: 0
			}
		];

		it('should save movements and scores', async (done) => {
			try {
				// 3 times for each model in the end of saveScoresForMovement
				// 2 times when adding score for two of the movements
				_modelInstance.expects('save').resolves();
				_modelInstance.expects('save').resolves();
				_modelInstance.expects('save').resolves();
				_modelInstance.expects('save').resolves();
				_modelInstance.expects('save').resolves();

				const savedMovements = await service.saveMovementsAndMovementScores(user, movements, movementScores);
				expect(savedMovements.length).toBe(3);
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should not care if migration for a movements fails', async (done) => {
			try {
				_modelInstance.expects('save').rejects();
				_modelInstance.expects('save').rejects();
				_modelInstance.expects('save').resolves();
				_modelInstance.expects('save').resolves();

				const savedMovements = await service.saveMovementsAndMovementScores(user, movements, movementScores);
				expect(savedMovements.length).toBe(1);
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should not care if migration fails for a score', async (done) => {
			try {
				_modelInstance.expects('save').resolves();
				_modelInstance.expects('save').resolves();
				_modelInstance.expects('save').rejects();
				_modelInstance.expects('save').resolves();
				_modelInstance.expects('save').rejects();

				const savedMovements = await service.saveMovementsAndMovementScores(user, movements, movementScores);
				expect(savedMovements.length).toBe(3);
				done();
			} catch (err) {
				done(err);
			}
		});
	});

	describe('readContentsFromDatabase', () => {
		it('should return an object with the contents', async (done) => {
			try {
				_service.expects('resolvePath').returns('path');
				_sqlite.expects('open').withArgs('path').resolves(db);
				_db.expects('get').resolves('athletes');
				_db.expects('all').resolves('customwods');
				_db.expects('all').resolves('movements');
				_db.expects('all').resolves('movementscores');
				_db.expects('all').resolves('mywods');

				const res = await service.readContentsFromDatabase('filename');
				expect(res).toHaveProperty('athlete');
				expect(res).toHaveProperty('workouts');
				expect(res).toHaveProperty('movements');
				expect(res).toHaveProperty('movementScores');
				expect(res).toHaveProperty('workoutScores');
				done();
			} catch (err) {
				done(err);
			}
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
});
