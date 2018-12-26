import * as Koa from 'koa';
import {
	BodyParser,
	ErrorHandler,
	JwtHandler,
	JsonEnforcer,
	RequestLogger
} from '../middleware';
import { OpenApiRouter } from './open.api';
import { MovementRouter } from './movement';
import { WorkoutRouter } from './workout';
import { AuthRouter } from './auth';
import { MyWodRouter } from './my.wod';
import { UserRouter } from './user';
import { StaticRouter } from './static';

export const routes = (app: Koa, injectionContext) => {
	const { config, authService, userService, workoutService, movementService, myWodService } = injectionContext;
	const errHandler = new ErrorHandler();

	const handlers: any[] = [
		errHandler,
		errHandler.statusCodeInjector(),
		new RequestLogger({ config }),
		new BodyParser(),
		new OpenApiRouter(),
		new AuthRouter({ authService }),
		new JwtHandler({ config }),
		new JsonEnforcer(),
		new StaticRouter(),
		new UserRouter({ userService }),
		new MovementRouter({ movementService }),
		new WorkoutRouter({ workoutService }),
		new MyWodRouter({ myWodService })
	];

	handlers.forEach(handler => {
		handler.init(app);
	});
};

export {
	MyWodRouter,
	MovementRouter,
	WorkoutRouter,
	OpenApiRouter,
	AuthRouter,
	UserRouter
};
