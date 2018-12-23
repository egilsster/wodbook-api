import * as fs from 'fs';

export class ConfigService {
	getConfig() {
		return {
			servicePort: Number(this._read('PORT')) || 43210,
			mongo: {
				uri: this._read('MONGO_URI')!
			},
			jwtConfig: {
				publicKey: 'cHVibGljS2V5'
			}
		};
	}

	_read(envName: string) {
		let envValue: string | undefined = process.env[envName];
		const envFilePath: string | undefined = process.env[`${envName}_FILE`];
		if (envValue) {
			envValue = process.env[envName];
		} else if (envFilePath) {
			try {
				envValue = fs.readFileSync(envFilePath, 'utf-8');
			} catch (err) {
				throw new Error(`Could not read file "${envFilePath}" provided by environment variable "${envName}_FILE"`);
			}
		}
		return envValue;
	}
}
