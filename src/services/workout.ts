import { WorkoutDao } from '../dao/workout';
import { WorkoutScoreDao } from '../dao/workout.score';
import { Workout } from '../models/workout';
import { WorkoutScore } from '../models/workout.score';

export class WorkoutService {
	private workoutDao: WorkoutDao;
	private workoutScoreDao: WorkoutScoreDao;

	constructor(options: any) {
		this.workoutDao = options.workoutDao;
		this.workoutScoreDao = options.workoutScoreDao;
	}

	async createWorkout(body, claims: Claims) {
		body.userId = claims.userId;
		const workout = new Workout(body);
		return this.workoutDao.createWorkout(workout);
	}

	async getWorkouts(claims: Claims) {
		return this.workoutDao.getWorkouts(claims);
	}

	async getWorkoutById(id: string, claims: Claims) {
		return this.workoutDao.getWorkoutById(id, claims);
	}

	async getWorkoutByName(name: string, claims: Claims) {
		return this.workoutDao.getWorkoutByName(name, claims);
	}

	async getScores(workoutId: string, claims: Claims) {
		const workout = await this.getWorkoutById(workoutId, claims);
		return this.workoutScoreDao.getWorkoutScores(workout.id, claims);
	}

	async addScore(workoutId: string, score, claims: Claims) {
		const workout = await this.getWorkoutById(workoutId, claims);
		score.workoutId = workout.id;
		score.userId = claims.userId;
		const workoutScore = new WorkoutScore(score);
		return this.workoutScoreDao.createWorkoutScore(workoutScore);
	}
}
