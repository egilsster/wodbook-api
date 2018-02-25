import * as sinon from 'sinon';
import * as HttpStatus from 'http-status-codes';

import ExpressError from '../../src/utils/express.error';
import { WorkoutService } from '../../src/services/workout';

describe('WorkoutService', () => {
	const user = {
		'id': 'userId',
		'email': 'user@email.com'
	};
	const workout = {
		'title': 'Amanda',
		'id': '5a4704ca46425f97c638bcaa',
		'scores': [],
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
		this.scores = [];
		this.measurement = 'time';
		this.description = 'desc';
		this.populate = () => { };
		this.save = () => workout;
		return modelInstance;
	};
	WorkoutModel.populate = () => { };
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
			_model.expects('find').returns(WorkoutModel);
			_model.expects('populate').resolves(items);

			const res = await service.getWorkouts(user);
			expect(res).toEqual(items);
			verifyAll();
		});
	});

	describe('getWorkout', () => {
		it('should get single workout if workout exists', async () => {
			_model.expects('findOne').withArgs({ '_id': workout.id, 'createdBy': user.id }).returns(WorkoutModel);
			_model.expects('populate').withArgs('scores').resolves(workout);

			const res = await service.getWorkout(user, workout.id);
			expect(res).toEqual(workout);
			verifyAll();
		});

		it('should get nothing if workout does not exist', async () => {
			_model.expects('findOne').withArgs({ '_id': 'notId', 'createdBy': user.id }).returns(WorkoutModel);
			_model.expects('populate').withArgs('scores').resolves(null);

			const res = await service.getWorkout(user, 'notId');
			expect(res).toEqual(null);
			verifyAll();
		});
	});

	describe('createWorkout', () => {
		it('should return saved model when saved', async () => {
			_service.expects('getWorkout').resolves(null);
			_modelInstance.expects('save').resolves(workout);

			const promise = service.createWorkout(user, workout);
			await expect(promise).resolves.toEqual(workout);
			verifyAll();
		});

		it('should throw exception if resource already exists', async () => {
			_service.expects('getWorkout').resolves(workout);

			const promise = service.createWorkout(user, workout);
			await expect(promise).rejects.toHaveProperty('status', HttpStatus.CONFLICT);
			verifyAll();
		});
	});

	describe('addScore', () => {
		it('should add score to a workout if it exists', async () => {
			_service.expects('getWorkout').resolves(modelInstance);
			_modelInstance.expects('save').resolves();
			_modelInstance.expects('save').resolves();
			_modelInstance.expects('populate').resolves('data');

			const promise = service.addScore(user, workout.id, score);
			await expect(promise).resolves.toEqual('data');
			verifyAll();
		});

		it('should throw exception if workout does not exist', async () => {
			_service.expects('getWorkout').resolves();

			const promise = service.addScore(user, workout.id, score);
			await expect(promise).rejects.toHaveProperty('status', HttpStatus.NOT_FOUND);
			verifyAll();
		});
	});
});
