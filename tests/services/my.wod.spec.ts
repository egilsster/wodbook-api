import * as fs from 'fs-extra';
import * as sinon from 'sinon';
import * as HttpStatus from 'http-status-codes';
import * as sqlite from 'sqlite';
import { MyWodService } from '../../src/services/my.wod';
import { User } from '../../src/models/user';
import { UserService } from '../../src/services/user';
import { WorkoutService } from '../../src/services/workout';
import { MovementService } from '../../src/services/movement';
import { MyWodUtils } from '../../src/utils/my.wod.utils';
import { Movement } from '../../src/models/movement';

describe('MywodService', () => {
	const user = new User({
		id: 'GbCUZ36TQ1ebQmIF4W4JPu6RhP_MXD-7',
		email: 'some@email.com',
		password: 'pass',
		admin: false
	});
	const claims: any = user.toObject();

	// const filename = 'filename';
	let _sqlite: sinon.SinonMock;
	let db, _db: sinon.SinonMock;
	let _fs: sinon.SinonMock;
	let service: MyWodService, _service: sinon.SinonMock;

	let userService: UserService, _userService: sinon.SinonMock;
	let workoutService: WorkoutService, _workoutService: sinon.SinonMock;
	let movementService: MovementService, _movementService: sinon.SinonMock;
	let _myWodUtils: sinon.SinonMock;

	beforeEach(() => {
		const logger = {
			info() { },
			warn() { },
			error() { }
		};

		const anyOptions: any = {};
		userService = new UserService(anyOptions);
		_userService = sinon.mock(userService);

		workoutService = new WorkoutService(anyOptions);
		_workoutService = sinon.mock(workoutService);

		movementService = new MovementService(anyOptions);
		_movementService = sinon.mock(movementService);

		_myWodUtils = sinon.mock(MyWodUtils);

		_sqlite = sinon.mock(sqlite);
		db = {
			get() { },
			all() { }
		};
		_db = sinon.mock(db);
		_fs = sinon.mock(fs);

		const options = {
			logger,
			userService,
			workoutService,
			movementService
		};

		service = new MyWodService(options);
		_service = sinon.mock(service);
	});

	afterEach(() => {
		_sqlite.verify();
		_db.verify();
		_fs.verify();
		_service.verify();
		_userService.verify();
		_workoutService.verify();
		_movementService.verify();
		_myWodUtils.verify();
	});

	describe('constructor', () => {
		it('should create new instance of service', () => {
			const instance = new MyWodService({});
			expect(instance).toBeDefined();
		});
	});

	describe('saveAthlete', () => {
		it('should successfully update a user if he exists', async () => {
			_userService.expects('getUserByEmail').resolves(user);
			_service.expects('saveAvatar').returns('avatarUrl');
			_userService.expects('updateUserByEmail').withExactArgs(user, claims).resolves(user);

			await expect(service.saveAthlete(user, claims))
				.resolves.toEqual(user);
		});

		it('should throw 403 Forbidden if the email from the backup dont match', async () => {
			await expect(service.saveAthlete({ email: 'another@email.com' }, claims))
				.rejects.toHaveProperty('status', HttpStatus.FORBIDDEN);
		});

		it('should throw 404 Not found if the user does not exist', async () => {
			_userService.expects('getUserByEmail').resolves();

			await expect(service.saveAthlete(user, claims))
				.rejects.toHaveProperty('status', HttpStatus.NOT_FOUND);
		});
	});

	describe('saveAvatar', () => {
		it('should save avatar', () => {
			_fs.expects('ensureDirSync').returns(undefined);
			_fs.expects('writeFileSync').returns(undefined);

			expect(service.saveAvatar(user.id, Buffer.from('pic'))).toEqual(`/public/avatars/${user.id}.png`);
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
				_workoutService.expects('createWorkout').resolves();

				const res = await service.saveWorkouts(workouts, claims);
				expect(res).toBeInstanceOf(Array);
				expect(res.length).toBe(1);
				done();
			} catch (err) {
				done(err);
			}
		});

		it('should ignore failed migrations', async (done) => {
			try {
				_workoutService.expects('createWorkout').rejects(new Error('Saving failed'));

				const res = await service.saveWorkouts(workouts, claims);
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
			_workoutService.expects('getWorkoutByName').resolves({ id: 'workoutId' });
			_workoutService.expects('addScore').resolves();

			await expect(service.saveWorkoutScores(scores, claims))
				.resolves.toBeUndefined();
		});

		it('should not save workout scores if the workout is not registered', async () => {
			_workoutService.expects('getWorkoutByName').twice().resolves();
			_workoutService.expects('addScore').never();

			await expect(service.saveWorkoutScores(scores, claims))
				.resolves.toBeUndefined();
		});

		it('should not care about failed score migration', async () => {
			_workoutService.expects('getWorkoutByName').twice().resolves({ id: 'workoutId' });
			_workoutService.expects('addScore').twice().rejects();

			await expect(service.saveWorkoutScores(scores, claims))
				.resolves.toBeUndefined();
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
				measurementB: '0:00',
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
				measurementB: '1',
				sets: '1',
				notes: '',
				deleted: 0
			}
		];

		it('should save movements and scores', async () => {
			_movementService.expects('createMovement').resolves({ id: 'id1' });
			_movementService.expects('createMovement').resolves({ id: 'id2' });
			_movementService.expects('createMovement').resolves({ id: 'id3' });
			_service.expects('saveScoresForMovement').thrice().resolves();

			await expect(service.saveMovementsAndMovementScores(movements, movementScores, claims))
				.resolves.toHaveLength(3);
		});

		it('should not care if migration for a movements fails', async () => {
			_movementService.expects('createMovement').rejects();
			_movementService.expects('createMovement').rejects();
			_movementService.expects('createMovement').resolves({ id: 'id3' });
			_service.expects('saveScoresForMovement').once().resolves();

			await expect(service.saveMovementsAndMovementScores(movements, movementScores, claims))
				.resolves.toHaveLength(1);
		});

		it('should not care if migration fails for a score', async () => {
			_movementService.expects('createMovement').resolves({ id: 'id1' });
			_movementService.expects('createMovement').resolves({ id: 'id2' });
			_movementService.expects('createMovement').resolves({ id: 'id3' });
			_service.expects('saveScoresForMovement').once().resolves();
			_service.expects('saveScoresForMovement').twice().rejects();

			await expect(service.saveMovementsAndMovementScores(movements, movementScores, claims))
				.resolves.toHaveLength(3);
		});
	});

	describe('saveScoresForMovement', () => {
		const myWodMovement: any = {};
		const movement = new Movement({
			name: 'Thruster',
			measurement: 'weight'
		});
		const score = { movementId: movement.id };

		it('should save scores for movement', async () => {
			_myWodUtils.expects('getScoresForMovement').returns([score]);
			_movementService.expects('addScore').withExactArgs(movement.id, score, claims).resolves();

			await expect(service.saveScoresForMovement(myWodMovement, movement, [score], claims))
				.resolves.toBeUndefined();
		});

		it('should ignore when score can not be added', async () => {
			_myWodUtils.expects('getScoresForMovement').returns([score]);
			_movementService.expects('addScore').withExactArgs(movement.id, score, claims).rejects();

			await expect(service.saveScoresForMovement(myWodMovement, movement, [score], claims))
				.resolves.toBeUndefined();
		});
	});

	describe('readContentsFromDatabase', () => {
		it('should return an object with the contents', async (done) => {
			const filePath = 'filepath';
			try {
				_sqlite.expects('open').withArgs(filePath).resolves(db);
				_db.expects('get').resolves('athletes');
				_db.expects('all').resolves('customwods');
				_db.expects('all').resolves('movements');
				_db.expects('all').resolves('movementscores');
				_db.expects('all').resolves('mywods');

				const res = await service.readContentsFromDatabase(filePath);
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
});
