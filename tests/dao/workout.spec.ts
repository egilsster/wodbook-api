import * as sinon from 'sinon';
import * as HttpStatus from 'http-status-codes';
import { WorkoutDao } from '../../src/dao/workout';
import { Workout } from '../../src/models/workout';
import { ServiceError } from '../../src/utils/service.error';
import { ErrorUtils } from '../../src/utils/error.utils';
import { ERROR_TEMPLATES } from '../../src/utils/error.templates';

describe('WorkoutDao', () => {
	let workoutDao: WorkoutDao, _workoutDao: sinon.SinonMock;
	let mongo;
	let _workoutCollection: sinon.SinonMock;
	let _errorUtils: sinon.SinonMock;
	let workout: Workout;

	const userId = 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx';
	const claims: any = { userId: userId };

	beforeEach(() => {
		mongo = {
			workouts: { insertOne() { }, findOne() { }, find() { }, updateOne() { } }
		};

		_workoutCollection = sinon.mock(mongo.workouts);

		workoutDao = new WorkoutDao(mongo);
		_workoutDao = sinon.mock(workoutDao);

		_errorUtils = sinon.mock(ErrorUtils);

		workout = new Workout({
			name: 'Fran',
			measurement: 'time',
			score: '1:59',
			userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx'
		});
	});

	afterEach(() => {
		_workoutCollection.verify();
		_workoutDao.verify();
		_errorUtils.verify();
	});

	describe('createWorkout', () => {
		it('should call insertOne to create a new workout', async () => {
			_workoutCollection.expects('insertOne').resolves({
				ops: [workout.toObject()]
			});
			const createdWorkout = await workoutDao.createWorkout(workout);

			expect(createdWorkout.id).toEqual(workout.id);
			expect(createdWorkout.name).toEqual(workout.name);
			expect(createdWorkout.measurement).toEqual(workout.measurement);
			expect(createdWorkout.userId).toEqual(workout.userId);
			expect(new Date(createdWorkout.createdAt)).not.toBeNaN();
			expect(new Date(createdWorkout.updatedAt)).not.toBeNaN();
		});

		it('should throw error when insertOne fails', async () => {
			const serviceErr = new ServiceError(ERROR_TEMPLATES.CONFLICT);
			const err = new Error();
			_workoutCollection.expects('insertOne').rejects(err);
			_errorUtils.expects('convertMongoErrorToServiceError').withArgs(err).returns(serviceErr);

			await expect(workoutDao.createWorkout(workout)).rejects.toEqual(expect.any(ServiceError));
		});
	});

	describe('getWorkouts', () => {
		it('should call find to get the workouts', async () => {
			const cursorRes = {
				toArray: sinon.stub().resolves([workout.toObject()])
			};
			_workoutCollection.expects('find').returns(cursorRes);

			await expect(workoutDao.getWorkouts(claims)).resolves.toEqual([workout]);
		});

		it('should return empty array if no workouts exist', async () => {
			const cursorRes = {
				toArray: sinon.stub().resolves([])
			};
			_workoutCollection.expects('find').returns(cursorRes);

			await expect(workoutDao.getWorkouts(claims)).resolves.toEqual([]);
		});
	});

	describe('getWorkoutById', () => {
		it('should call findOne to get the workout', async () => {
			_workoutCollection.expects('findOne').resolves(workout.toObject());

			await expect(workoutDao.getWorkoutById(workout.id, claims)).resolves.toEqual(workout);
		});

		it('should throw exception with status 404 if workout is not found', async () => {
			_workoutCollection.expects('findOne').resolves();

			await expect(workoutDao.getWorkoutById(workout.id, claims)).rejects.toHaveProperty('status', HttpStatus.NOT_FOUND);
		});
	});

	describe('getWorkoutByName', () => {
		it('should call findOne to get the workout', async () => {
			_workoutCollection.expects('findOne').resolves(workout.toObject());

			await expect(workoutDao.getWorkoutByName(workout.name, claims)).resolves.toEqual(workout);
		});

		it('should return null if workout is not found', async () => {
			_workoutCollection.expects('findOne').resolves();

			await expect(workoutDao.getWorkoutByName(workout.name, claims)).resolves.toBeNull();
		});
	});

	describe('updateWorkoutById', () => {
		it('should update workout', async () => {
			_workoutCollection.expects('updateOne').resolves(workout);

			await expect(workoutDao.updateWorkoutById(workout.id, workout, claims)).resolves.toEqual(workout);
		});

		it('should throw error when updateOne errors', async () => {
			const serviceErr = new ServiceError(ERROR_TEMPLATES.CONFLICT);
			const err = new Error();
			_workoutCollection.expects('updateOne').rejects(err);
			_errorUtils.expects('convertMongoErrorToServiceError').withArgs(err).returns(serviceErr);

			await expect(workoutDao.updateWorkoutById(workout.id, workout, claims)).rejects.toEqual(expect.any(ServiceError));
		});
	});
});
