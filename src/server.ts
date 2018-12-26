import * as http from 'http';
import * as Koa from 'koa';
import * as terminus from '@godaddy/terminus';
import { logContextInjector } from './utils/logger/log.context.injector';
import { Logger } from './utils/logger/logger';
import { ConfigService } from './services/config';
import { Mongo } from './models/mongo';
import { routes } from './routes';
import { WorkoutDao } from './dao/workout';
import { MovementDao } from './dao/movement';
import { UserDao } from './dao/user';
import { MyWodService } from './services/my.wod';
import { UserService } from './services/user';
import { AuthService } from './services/auth';
import { WorkoutService } from './services/workout';
import { MovementService } from './services/movement';
import { HealthService } from './services/health';
import { WorkoutScoreDao } from './dao/workout.score';
import { MovementScoreDao } from './dao/movement.score';

const logger = new Logger('server');
const app = new Koa();

async function start() {
	const configService = new ConfigService();
	const config = configService.getConfig();

	const mongo = new Mongo({ config });
	try {
		await mongo.connect();
	} catch (err) {
		logger.error('Connection to Mongo failed', { err: err.stack });
		throw err;
	}

	app.use(logContextInjector());
	const userDao = new UserDao(mongo);
	const userService = new UserService({ userDao });
	const workoutDao = new WorkoutDao(mongo);
	const workoutScoreDao = new WorkoutScoreDao(mongo);
	const movementDao = new MovementDao(mongo);
	const movementScoreDao = new MovementScoreDao(mongo);
	const workoutService = new WorkoutService({ workoutDao, workoutScoreDao });
	const movementService = new MovementService({ movementDao, movementScoreDao });
	const myWodService = new MyWodService({ userService, workoutService, movementService, workoutScoreDao, movementScoreDao });
	const authService = new AuthService({ userDao });

	routes(app, { config, authService, userService, movementService, workoutService, myWodService });

	const server = http.createServer(app.callback());
	const healthService = new HealthService({ mongo });

	terminus.createTerminus(server, {
		healthChecks: { '/health': healthService.isHealthy.bind(healthService) },
		onSignal: async () => {
			await mongo.close();
		}
	});

	server.listen(config.servicePort);
	logger.info(`Listening on port ${config.servicePort}`);
}

start().catch((err) => {
	logger.error('Server failed to start', { stack: err.stack });
	process.exit(1);
});
