import seedrandom from 'seedrandom';

export const timeToString = (time: number) => {
	return `${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}`;
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

function randomWithSeed(seed: string | number): number {
	const rng = seedrandom(seed.toString()); // Initialize the random number generator with the seed
	return rng(); // Generate a random number between 0 and 1
}

export const getRandom = (array: any[] | undefined, seed: string | number | null = null): string => {
	if (seed === null) {
		seed = Math.random().toString(36);
	}

	if (array) {
		return array[Math.floor((randomWithSeed(seed) * array.length))];
	}
    return "";
}

export const rand = (start: number, end: number) => {
    return Math.floor((Math.random() * end)) + start;
}