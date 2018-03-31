import * as sinon from 'sinon';
import * as HttpStatus from 'http-status-codes';

import ExpressError from '../../src/utils/express.error';
import { WorkoutService } from '../../src/services/workout';
import { QueryUtils } from '../../src/utils/query.utils';

describe('WorkoutService', () => {
	const user = {
		'id': 'userId',
		'email': 'user@email.com'
	};
	const workout = {
		'title': 'Amanda',
		'id': '5a4704ca46425f97c638bcaa'
	};
	const score: any = {
		'workoutTitle': workout.id,
		'score': '1:23',
		'measurement': 'weight',
		'rx': true,
		'notes': '',
		'date': new Date('2014-01-03')
	};
	let service: WorkoutService;
	let _service: sinon.SinonMock;
	let modelInstance;
	let _modelInstance: sinon.SinonMock;
	let _model: sinon.SinonMock;
	let WorkoutModel: any = function () {
		this.title = 'Amanda';
		this.measurement = 'time';
		this.description = 'desc';
		this.save = () => workout;
		return modelInstance;
	};
	WorkoutModel.find = () => { };
	WorkoutModel.findOne = () => { };

	beforeEach(() => {
		modelInstance = new WorkoutModel();
		_modelInstance = sinon.mock(modelInstance);
		_model = sinon.mock(WorkoutModel);

		const options = {
			'workoutModel': WorkoutModel,
			'workoutScoreModel': WorkoutModel,
			'logger': {
				info() { },
				warn() { },
				error() { }
			}
		};

		service = new WorkoutService(options);
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
		const service = new WorkoutService();
		expect(service).toBeDefined();
	});

	describe('getWorkouts', () => {
		it('should return list of workouts', async () => {
			const items = ['item1', 'item2'];
			_model.expects('find').returns(items);

			const res = await service.getWorkouts(user.id);
			expect(res).toEqual(items);
			verifyAll();
		});
	});

	describe('getWorkout', () => {
		it('should get single workout if workout exists', async () => {
			_model.expects('findOne').withArgs(QueryUtils.forOne({ '_id': workout.id }, user.id)).returns(workout);

			const res = await service.getWorkout(user.id, workout.id);
			expect(res).toEqual(workout);
			verifyAll();
		});

		it('should get nothing if workout does not exist', async () => {
			_model.expects('findOne').withArgs(QueryUtils.forOne({ '_id': 'notId' }, user.id)).returns(null);

			const res = await service.getWorkout(user.id, 'notId');
			expect(res).toEqual(null);
			verifyAll();
		});
	});

	describe('getWorkoutByTitle', () => {
		it('should query model by workout title', async () => {
			_model.expects('findOne').withArgs(QueryUtils.forOne({'title': workout.title}, user.id)).returns(workout);

			const res = await service.getWorkoutByTitle(workout.title, user.id);
			expect(res).toEqual(workout);
			verifyAll();
		});
	});

	describe('getWorkoutScores', () => {
		it('should scores for workout if workout exists', async () => {
			_service.expects('getWorkout').withExactArgs(user.id, workout.id).resolves(workout);
			_model.expects('find').withArgs(QueryUtils.forOne({ 'workoutId': workout.id }, user.id)).returns([]);

			const res = await service.getWorkoutScores(user.id, workout.id);
			expect(res).toEqual([]);
			verifyAll();
		});

		it('should throw error if workout does not exist', async () => {
			const err = new ExpressError('Object not found', `Entity with identity '${workout.id}' does not exist`, HttpStatus.NOT_FOUND);
			_service.expects('getWorkout').withExactArgs(user.id, workout.id).resolves(null);

			const promise = service.getWorkoutScores(user.id, workout.id);
			await expect(promise).rejects.toEqual(err);
			verifyAll();
		});
	});

	describe('createWorkout', () => {
		it('should return saved model when saved', async () => {
			_modelInstance.expects('save').resolves(workout);

			const promise = service.createWorkout(workout);
			await expect(promise).resolves.toEqual(workout);
			verifyAll();
		});

		it('should throw exception if resource already exists', async () => {
			_modelInstance.expects('save').throws();

			const promise = service.createWorkout(workout);
			await expect(promise).rejects.toBeDefined();
			verifyAll();
		});
	});

	describe('addScore', () => {
		it('should add score to a workout if it exists', async () => {
			_service.expects('getWorkout').resolves(modelInstance);
			_modelInstance.expects('save').resolves('data');

			const promise = service.addScore(user.id, workout.id, score);
			await expect(promise).resolves.toEqual('data');
			verifyAll();
		});

		it('should throw exception if workout does not exist', async () => {
			_service.expects('getWorkout').resolves();

			const promise = service.addScore(user.id, workout.id, score);
			await expect(promise).rejects.toHaveProperty('status', HttpStatus.NOT_FOUND);
			verifyAll();
		});
	});
});
