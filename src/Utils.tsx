export class Time {
	value: number;

	constructor(hoursOrMinutes: number, minutes?: number) {
		if (minutes === undefined) {
			// If only one argument is provided, assume it's in minutes
			this.value = hoursOrMinutes;
		} else {
			// If both hours and minutes are provided, convert to minutes
			this.value = hoursOrMinutes * 60 + minutes;
		}
	}

	// Method to display the time as a string
	toString(): string {
		const hours = Math.floor(this.value / 60);
		const minutes = this.value % 60;
		return `${hours}:${minutes.toString().padStart(2, '0')}`;
	}
}

// Days Of Week
export enum DOW { 
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
    Sunday
}

export function isBetween(x: number, min: number, max: number): boolean {
    return x >= min && x <= max;
}

export function t(h:number, m: number) {
    return h * 60 + m;
}

export function GetRecordWithIds<T>(record: Record<string, T>) {
	let newRecord: Record<string, T> = {};
	for (const key in record) {
		if (record.hasOwnProperty(key)) {
			const user = record[key];
			newRecord[key] = { ...user, id: key };
		}
	}
	return newRecord;
}

export const getRandom = (array: any[]): string => {
    return array[Math.floor((Math.random() * array.length))];
}

export const rand = (start: number, end: number) => {
    return Math.floor((Math.random() * end)) + start;
}