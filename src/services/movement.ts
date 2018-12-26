import { MovementDao } from '../dao/movement';
import { MovementScoreDao } from '../dao/movement.score';
import { Movement } from '../models/movement';
import { MovementScore } from '../models/movement.score';

export class MovementService {
	private movementDao: MovementDao;
	private movementScoreDao: MovementScoreDao;

	constructor(options: any) {
		this.movementDao = options.movementDao;
		this.movementScoreDao = options.movementScoreDao;
	}

	async createMovement(body, claims: Claims) {
		body.userId = claims.userId;
		const movement = new Movement(body);
		return this.movementDao.createMovement(movement);
	}

	async getMovements(claims: Claims) {
		return this.movementDao.getMovements(claims);
	}

	async getMovementById(id: string, claims: Claims) {
		return this.movementDao.getMovementById(id, claims);
	}

	async getScores(movementId: string, claims: Claims) {
		const movement = await this.getMovementById(movementId, claims);
		return this.movementScoreDao.getMovementScores(movement.id, claims);
	}

	async addScore(movementId: string, score, claims: Claims) {
		const movement = await this.getMovementById(movementId, claims);
		score.movementId = movement.id;
		score.userId = claims.userId;
		const movementScore = new MovementScore(score);
		return this.movementScoreDao.createMovementScore(movementScore);
	}
}
