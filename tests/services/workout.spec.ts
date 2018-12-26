import * as sinon from 'sinon';
import { WorkoutService } from '../../src/services/workout';
import { WorkoutScoreDao } from '../../src/dao/workout.score';
import { WorkoutDao } from '../../src/dao/workout';
import { Workout } from '../../src/models/workout';

describe('WorkoutService', () => {
	const workout = new Workout({
		id: '5L129VaYljbRepTqO7zI39oRHvgeYWK6',
		name: 'Fran',
		measurement: 'time',
		userId: 'KkZogjZCwjq6IzE1QAQmrXaKTTMuUp4D'
	});

	const claims: any = { userId: 'KkZogjZCwjq6IzE1QAQmrXaKTTMuUp4D' };

	let service: WorkoutService, _service: sinon.SinonMock;
	let workoutDao: WorkoutDao, _workoutDao: sinon.SinonMock;
	let workoutScoreDao: WorkoutScoreDao, _workoutScoreDao: sinon.SinonMock;

	beforeEach(() => {
		const anyOptions: any = {};
		workoutDao = new WorkoutDao(anyOptions);
		_workoutDao = sinon.mock(workoutDao);
		workoutScoreDao = new WorkoutScoreDao(anyOptions);
		_workoutScoreDao = sinon.mock(workoutScoreDao);

		service = new WorkoutService(anyOptions);
		_service = sinon.mock(service);

		const options = {
			workoutDao,
			workoutScoreDao
		};

		service = new WorkoutService(options);
		_service = sinon.mock(service);
	});

	afterEach(() => {
		_service.verify();
		_workoutDao.verify();
		_workoutScoreDao.verify();
	});

	describe('constructor', () => {
		it('should create new instance of service', () => {
			const instance = new WorkoutService({});
			expect(instance).toBeDefined();
		});
	});

	describe('createWorkout', () => {
		it('should create new workout', async () => {
			_workoutDao.expects('createWorkout').withExactArgs(workout).resolves(workout);

			await expect(service.createWorkout(workout.toObject(), claims))
				.resolves.toEqual(workout);
		});
	});

	describe('getWorkouts', () => {
		it('should return list of workouts', async () => {
			_workoutDao.expects('getWorkouts').withExactArgs(claims).resolves([workout]);

			await expect(service.getWorkouts(claims))
				.resolves.toEqual([workout]);
		});
	});

	describe('getWorkoutById', () => {
		it('should return workout with specified id', async () => {
			_workoutDao.expects('getWorkoutById').withExactArgs(workout.id, claims).resolves(workout);

			await expect(service.getWorkoutById(workout.id, claims))
				.resolves.toEqual(workout);
		});
	});

	describe('getWorkoutByName', () => {
		it('should return workout with specified name', async () => {
			_workoutDao.expects('getWorkoutByName').withExactArgs(workout.name, claims).resolves(workout);

			await expect(service.getWorkoutByName(workout.name, claims))
				.resolves.toEqual(workout);
		});
	});

	describe('getScores', () => {
		it('should return scores for specified workout', async () => {
			_service.expects('getWorkoutById').withExactArgs(workout.id, claims).resolves(workout);
			_workoutScoreDao.expects('getWorkoutScores').withExactArgs(workout.id, claims).resolves([]);

			await expect(service.getScores(workout.id, claims))
				.resolves.toEqual([]);
		});
	});

	describe('addScore', () => {
		const score = {
			workoutId: workout.id,
			measurement: 'time',
			score: '1:59'
		};

		it('should add score linked to workout', async () => {
			_service.expects('getWorkoutById').withExactArgs(workout.id, claims).resolves(workout);
			_workoutScoreDao.expects('createWorkoutScore').resolves(score);

			await expect(service.addScore(workout.id, score, claims))
				.resolves.toEqual(score);
		});
	});
});
