import * as sinon from 'sinon';
import * as HttpStatus from 'http-status-codes';

import ExpressError from '../../src/utils/express.error';
import WorkoutService from '../../src/services/workout';

describe('WorkoutService', () => {
	const data = {
		'name': 'Amanda',
		'id': 'someid'
	};
	let service: WorkoutService;
	let _service: sinon.SinonMock;
	let modelInstance;
	let _modelInstance: sinon.SinonMock;
	let _model: sinon.SinonMock;
	let MockModel: any = function () {
		this.name = 'Amanda';
		this.scores = [];
		this.save = () => data;
		return modelInstance;
	};
	MockModel.find = () => { };
	MockModel.findById = () => { };

	beforeEach(() => {
		modelInstance = new MockModel();
		_modelInstance = sinon.mock(modelInstance);
		_model = sinon.mock(MockModel);

		const options = {
			'workoutModel': MockModel
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
			_model.expects('find').resolves(items);

			const res = await service.getWorkouts();
			expect(res).toEqual(items);
			verifyAll();
		});
	});

	describe('getWorkout', () => {
		it('should get single workout if workout exists', async () => {
			_model.expects('findById').withArgs(data.id).resolves(data);

			const res = await service.getWorkout(data.id);
			expect(res).toEqual(data);
			verifyAll();
		});

		it('should get nothing if workout does not exist', async () => {
			_model.expects('findById').resolves(null);

			const res = await service.getWorkout('notId');
			expect(res).toEqual(null);
			verifyAll();
		});
	});

	describe('createWorkout', () => {
		it('should return saved model when saved', async () => {
			_model.expects('findById').resolves(null);
			_modelInstance.expects('save').resolves(data);

			const promise = service.createWorkout(data);
			await expect(promise).resolves.toEqual(data);
			verifyAll();
		});

		it('should throw exception if resource already exists', async () => {
			_model.expects('findById').resolves('workout');

			const promise = service.createWorkout(data);
			const conflict = new ExpressError('Conflict', `Workout: ${data.name}, already exists`, HttpStatus.CONFLICT);
			await expect(promise).rejects.toEqual(conflict);
			verifyAll();
		});
	});

	describe('addScore', () => {
		it('should add score to a workout if it exists', async () => {
			_model.expects('findById').withArgs(modelInstance.id).resolves(modelInstance);
			_modelInstance.expects('save').resolves(modelInstance);

			const promise = service.addScore(modelInstance.id, 'new score');
			await expect(promise).resolves.toEqual(modelInstance);
			verifyAll();
		});

		it('should throw exception if workout does not exist', async () => {
			_model.expects('findById').resolves();

			const err = new ExpressError('Object not found', `Entity with identity 'Amanda' does not exist`, HttpStatus.NOT_FOUND);
			const promise = service.addScore(data.name, 'new score');
			await expect(promise).rejects.toEqual(err);
			verifyAll();
		});
	});
});
