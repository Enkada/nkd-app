import seedrandom from 'seedrandom';
import { Stat } from './App';

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

export type Reason = {
	short: string,
	full: string[]
}

export type Condition = {
	isNegative?: boolean,
	time?: {
		from: number,
		to: number
	},
	eval?: string,
	dayOfTheWeek?: number[],
	reason?: Reason,
	location?: string,
}

export const checkConditions = (conditions: Condition[] | undefined, stat: Stat, breakAfterPass: boolean = false) => {
	const { time, day, variables } = stat;

	if (conditions) {
		let reason: Reason | null | undefined = undefined;
		let location: string | null | undefined = undefined;
		for (const condition of conditions) {
			let pass = true;
			if (condition.eval) {
				pass = eval(condition.eval);
			}
			if (condition.time && !isBetween(time, condition.time.from, condition.time.to)) {
				pass = false;
			}
			if (condition.dayOfTheWeek && !condition.dayOfTheWeek.some(x => getDayOfTheWeek(getDate(day)) == x)) {
				pass = false;
			}

			if (condition.isNegative) {
				pass = !pass;
			}

			if (!pass && !breakAfterPass || pass && breakAfterPass) {
				reason = condition.reason ?? null;
				location = condition.location ?? null;
				break;
			}
		}
		return {reason, location};
	}
	return undefined;
}

export function isBetween(x: number, min: number, max: number): boolean {
	x = x % (24 * 60);
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

export const getDate = (day: number): Date => {
	return new Date(new Date(2000, 8, 23).getTime() + (day - 1) * 86400000);
}

export const getDayOfTheWeek = (date: Date): number => {
	const day = date.getDay();
	return day === 0 ? 6 : day;
}

export const formatMoney = (money: number): string => {
	return money.toFixed(2).replace('.00', '').replace('-0', '0')
}

export const formatText = (text: string): string => {
	text = text.replace(/a: (.*)/g, '<span class="line self-line">$1</span>');
	text = text.replace(/b: (.*)/g, '<span class="line character-line">$1</span>');
	text = text.replace(/\n/g, '<br>');
	text = text.replace(/Sara/g, '<span class="sara">Sara</span>');
	text = text.replace(/\d+(\.\d+)?\$/g, "<span class='money'>$&</span>");
	text = text.replace(/(?<!\*)\*([^*]*?)\*(?!\*)/g, '<span class="subtext">$1</span>');

	return text;
}

export const rand = (start: number, end: number, seed: string | number | null = null) => {
	if (seed === null) {
		seed = Math.random().toString(36);
	}

    return Math.floor((randomWithSeed(seed) * (end - start + 1))) + start;
}

export const randPow = (start: number, end: number, seed: string | number | null = null, power: number = 2) => {
	if (seed === null) {
		seed = Math.random().toString(36);
	}

    return Math.floor((Math.pow(randomWithSeed(seed), power) * (end - start + 1))) + start;
}