
export default class ConfigService {
	private static config = {
		'servicePort': Number(process.env.PORT) || 43210,
		'mongo': {
			'user': process.env.MONGO_USER || 'someuser',
			'uri': process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wodbook',
			'keepAlive': process.env.MONGO_KEEP_ALIVE || '5000',
			'connectTimeoutMS': process.env.MONGO_CONN_TIMEOUT || '30000'
		}
	};

	/**
	 * This can be extended to talk to external
	 * sources, such as Vault.
	 */
	public static async getConfig() {
		return ConfigService.config;
	}
}
