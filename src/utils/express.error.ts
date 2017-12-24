
export default class ExpressError extends Error {
	constructor(public title: string, public detail: string, public status: number) {
		super(title);
	}
}
