
export class DateUtils {
	public static parseDate(date: string | Date) {
		if (typeof date === 'string') {
			date = new Date(date);
		}
		return date;
	}
}
