import { Condition, GetRecordWithIds } from "../Utils";
import { _ACTIONS } from "./_ACTIONS";

export type Action = {
	id: string,
	title?: string,
	emoji?: string,
	returnEmoji?: string,
	returnText?: string,
	returnToStart?: boolean, // unused
	hideReturn?: boolean,
	time?: number,
	text: string[],
	actions?: string[],
	isRest?: boolean,
	cost?: Cost,
	location?: string,
	character?: string | null,
	isHandled?: boolean,
	conditions?: Condition[]
}

export type Cost = {
	money?: number,
	energy?: number,
	food?: number
}

export type ConditionalAction = {
	action: string,
	seenActions?: string[],
	unseenActions?: string[],
	time?: {
		from: number,
		to: number
	}
}

export const ACTIONS = GetRecordWithIds(_ACTIONS) as Record<string, Action>;