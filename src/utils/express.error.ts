const HttpStatus = require('http-status-codes');

export class ExpressError extends Error {
	public title: string;
	constructor(public detail: string, public status: number) {
		super(HttpStatus.getStatusText(status));
		this.title = `${status} ${this.message}`;
	}
}
