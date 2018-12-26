
declare type ErrorTemplate = {
	status: number;
	title: string;
}

declare type Config = {
	servicePort: number;
	mongo: {
		uri: string;
	};
	jwtConfig: {
		publicKey: string;
	};
};

declare type Claims = {
	iat: number;
	exp: number;
	email: string;
	userId: string;
};
