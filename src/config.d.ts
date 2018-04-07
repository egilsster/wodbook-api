declare type ServerConfig = {
	port: number;
};

declare type MongoConfig = {
	user: string;
	password: string;
	uri: string;
	keepAlive: number;
	connectTimeoutMS: number;
};

declare type WebTokenConfig = {
	public: string;
};
