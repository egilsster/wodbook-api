import * as sinon from 'sinon';
import * as HttpStatus from 'http-status-codes';
import * as _ from 'lodash';
import { WorkoutScoreDao } from '../../src/dao/workout.score';
import { WorkoutScore } from '../../src/models/workout.score';
import { Workout } from '../../src/models/workout';
import { ServiceError } from '../../src/utils/service.error';
import { ErrorUtils } from '../../src/utils/error.utils';
import { ERROR_TEMPLATES } from '../../src/utils/error.templates';

describe('WorkoutScoreDao', () => {
	let workoutScoreDao: WorkoutScoreDao, _workoutScoreDao: sinon.SinonMock;
	let mongo;
	let _workoutScoreCollection: sinon.SinonMock;
	let _errorUtils: sinon.SinonMock;

	const dateProps = ['createdAt', 'updatedAt'];
	const userId = 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx';
	const claims: any = { userId: userId };
	const workout = new Workout({
		id: '5L129VaYljbRepTqO7zI39oRHvgeYWK6',
		name: 'Fran',
		measurement: 'time',
		userId: 'KkZogjZCwjq6IzE1QAQmrXaKTTMuUp4D'
	});
	const workoutScore = new WorkoutScore({
		workoutId: workout.id,
		measurement: workout.measurement,
		score: '1:59',
		userId: 'npTfBw-jllcCUAQ6PeCQZSUYl70_R1tx'
	});

	beforeEach(() => {
		mongo = {
			workoutScores: { insertOne() { }, findOne() { }, find() { }, updateOne() { } }
		};

		_workoutScoreCollection = sinon.mock(mongo.workoutScores);

		workoutScoreDao = new WorkoutScoreDao(mongo);
		_workoutScoreDao = sinon.mock(workoutScoreDao);

		_errorUtils = sinon.mock(ErrorUtils);
	});

	afterEach(() => {
		_workoutScoreCollection.verify();
		_workoutScoreDao.verify();
		_errorUtils.verify();
	});

	describe('createWorkoutScore', () => {
		it('should call insertOne to create a new workoutScore', async () => {
			_workoutScoreCollection.expects('insertOne').resolves({
				ops: [workoutScore.toObject()]
			});
			const createdWorkoutScore = await workoutScoreDao.createWorkoutScore(workoutScore);

			expect(_.omit(createdWorkoutScore, dateProps)).toEqual(_.omit(workoutScore, dateProps));
		});

		it('should throw error when insertOne fails', async () => {
			const serviceErr = new ServiceError(ERROR_TEMPLATES.CONFLICT);
			const err = new Error();
			_workoutScoreCollection.expects('insertOne').rejects(err);
			_errorUtils.expects('convertMongoErrorToServiceError').withArgs(err).returns(serviceErr);

			await expect(workoutScoreDao.createWorkoutScore(workoutScore)).rejects.toEqual(expect.any(ServiceError));
		});
	});

	describe('getWorkoutScores', () => {
		it('should call find to get the workoutScores', async () => {
			const cursorRes = {
				toArray: sinon.stub().resolves([workoutScore.toObject()])
			};
			_workoutScoreCollection.expects('find').returns(cursorRes);

			await expect(workoutScoreDao.getWorkoutScores(workout.id, claims)).resolves.toEqual([workoutScore]);
		});

		it('should return empty array if no workoutScores exist', async () => {
			const cursorRes = {
				toArray: sinon.stub().resolves([])
			};
			_workoutScoreCollection.expects('find').returns(cursorRes);

			await expect(workoutScoreDao.getWorkoutScores(workout.id, claims)).resolves.toEqual([]);
		});
	});

	describe('getWorkoutScoreById', () => {
		it('should call findOne to get the workoutScore', async () => {
			_workoutScoreCollection.expects('findOne').resolves(workoutScore.toObject());

			await expect(workoutScoreDao.getWorkoutScoreById(workoutScore.id, claims)).resolves.toEqual(workoutScore);
		});

		it('should throw exception with status 404 if workoutScore is not found', async () => {
			_workoutScoreCollection.expects('findOne').resolves();

			await expect(workoutScoreDao.getWorkoutScoreById(workoutScore.id, claims)).rejects.toHaveProperty('status', HttpStatus.NOT_FOUND);
		});
	});

	describe('updateWorkoutScoreById', () => {
		it('should update workoutScore', async () => {
			_workoutScoreCollection.expects('updateOne').resolves(workoutScore);

			await expect(workoutScoreDao.updateWorkoutScoreById(workoutScore.id, workoutScore, claims)).resolves.toEqual(workoutScore);
		});

		it('should throw error when updateOne errors', async () => {
			const serviceErr = new ServiceError(ERROR_TEMPLATES.CONFLICT);
			const err = new Error();
			_workoutScoreCollection.expects('updateOne').rejects(err);
			_errorUtils.expects('convertMongoErrorToServiceError').withArgs(err).returns(serviceErr);

			await expect(workoutScoreDao.updateWorkoutScoreById(workoutScore.id, workoutScore, claims)).rejects.toEqual(expect.any(ServiceError));
		});
	});
});
