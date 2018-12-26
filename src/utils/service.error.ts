import * as _ from 'lodash';

export class ServiceError extends Error {
	public status: number;
	public title: string;

	constructor(template: ErrorTemplate, options?: any) {
		super(template.title);
		this.status = template.status;
		this.title = template.title;
		_.merge(this, options);
	}
}
