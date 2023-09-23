import { GetRecordWithIds, t } from "../Utils";

export type Action = {
	id: string,
	title?: string,
	emoji?: string,
	returnEmoji?: string,
	returnText?: string,
	returnToStart?: boolean,
	hideReturn?: boolean,
	time?: number,
	text: string[],
	actions?: string[],
	isRest?: boolean,
	cost?: Cost,
	location?: string,
	character?: string | null,
	isHandled?: boolean
}

type _Action = Omit<Action, 'id'>


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

const sleepAction = (hours: number):_Action => {
	return {
		title: `Sleep for ${hours} hour${hours > 1 ? "s" : ""}`, emoji: "💤", time: t(hours, 0), isRest: true, returnEmoji: '🥱', returnText: 'Wake up',
		text: [
			`Let's get some rest. \nYou sleep for ${hours} hours.`,
			`Time to have some sleep. The bed us comfy. \nYou sleep for ${hours} hours`
		]
	};
}

const _ACTIONS: Record<string, _Action> = {
	intro_0: {
		text: [
			"You're in a subway car, the doors just closed, and you're on your way to Sara, your friend you've been conversing with online for years now. \n\n" +
			"You're just about to reach the station where she's waiting for you.",
		],
		returnText: "Start",
		returnEmoji: "▶️"
	},
	intro_1: {
		title: "Get ready to get out", emoji: "🚪",
		text: [
			"This is your stop. Time to step off into the unknown and finally meet Sara."
		],
		actions: ["intro_get_out"],
		hideReturn: true
	},
	intro_get_out: {
		title: "Get out", emoji: "🏃🏻",
		text: [
			"She said she'd be waiting for me at the station."
		],
		location: "subway",
		returnText: "Look out"
	},
	intro_greeting: {
		title: "Excuse me?", emoji: "😳",
		text: [
			"b: H-hey! Is... is that you? Enkada?\n" +
			"a: Yea, that's me, hi.\n" +
			"b: Nice to meet you in person.\n" +
			"b: I feel like I already know you, but at the same time, you're a complete stranger to me.\n" +
			"b: So, shall we go?\n"		
		],
		actions: ["intro_go_home"],
		hideReturn: true
	},
	intro_go_home: {
		title: "Yep", emoji: "🚶🏻",
		text: [
			"You are at home street."
		],
		location: "home_street",
		character: null,
		actions: ["intro_3"],
		hideReturn: true
	},
	intro_3: {
		title: "Continue", emoji: "👀",
		text: [
			"You are at home stairwell."
		],
		location: "stairwell",
		actions: ["intro_4"],
		hideReturn: true
	},
	intro_4: {
		title: "Continue", emoji: "👀",
		text: [
			"You are at home."
		],
		location: "home",
		returnText: "Nice"
	},
	bath: {
		title: "Take a bath", emoji: "🛁", time: t(0, 30),
		text: [
			`You've just had a nice bath.`,
			`It's always good to take a bath once in a while.`
		]
	},
	work_freelance: {
		title: "Work as freelancer", emoji: "👨‍💻", time: t(1, 0),
		cost: { energy: 8 },
		text: [
			'You spend some time to find a job to do.',
			'You are trying to find a proper task to do for some money.',
			'You are in search of a job to do.',
		]
	},
	market_eat: {
		title: "Buy and eat hotdog", emoji: "🌭", time: t(0, 8),
		cost: { money: 5, energy: -10 },
		text: [
			'You bought a hotdog and ate it.',
			'You purchased hotdog, it tastes nice.',
		]
	},
	bed: {
		title: "Bed", emoji: "🛏",
		text: [
			'You are in bed right now.',
			'You are in your bed right now.'
		],
		actions: ["sleep_1", "sleep_2", "sleep_3", "sleep_4", "sleep_5", "sleep_6", "sleep_7"]
	},
	sleep_1: sleepAction(1),
	sleep_2: sleepAction(2),
	sleep_3: sleepAction(3),
	sleep_4: sleepAction(4),
	sleep_5: sleepAction(5),
	sleep_6: sleepAction(6),
	sleep_7: sleepAction(7),
	burger_king_application: {
		title: "Apply for a job", emoji: "👔", time: t(0, 30),
		text: [
			'You apply for a job at Burger King.',
		],
	},
	work_burger_king: {
		title: "Work", emoji: "👔", time: t(8, 0),
		cost: { energy: 10, food: -30 },
		text: [
			'You work at Burger King.',
		]
	},
	sara_examine: {
		title: "Examine", emoji: "🔍",
		text: [
			'Archive note 2.',
		],
		actions: ["sara_examine_look", "sara_examine_character"]
	},
	college_medical_checkup: {
		text: [
			'You notice students standing in line at the infirmary.',
		],
		actions: ["sara_examine_look"], returnText: "Don't care"
	},
	college_medical_checkup_check: {
		title: "Check infirmary", emoji: "🩺",
		text: [
			'college_medical_checkup_yes PLACEHOLDER',
		],
		actions: ["sara_examine_look"], returnText: "Don't care"
	},
	sara_examine_look: {
		title: "Her look", emoji: "👀",
		text: [
			'PLACEHOLDER sara_examine_look',
		]
	},
	sara_examine_character: {
		title: "Her character", emoji: "✨",
		text: [
			'PLACEHOLDER sara_examine_character',
		]
	},
	sara_ask: {
		title: "Ask a question", emoji: "🤔",
		text: [
			'sara_ask.',
		],
		actions: ["sara_question_01", "sara_question_02"]
	},
	sara_question_01: {
		title: "sara_question_01", emoji: "❔",
		text: [
			'PLACEHOLDER sara_question_01',
		]
	},
	sara_question_02: {
		title: "sara_question_02", emoji: "❔",
		text: [
			'PLACEHOLDER sara_question_02',
		],
		actions: ["sara_question_02_yes", "sara_question_02_no"],
		hideReturn: true
	},
	sara_question_02_yes: {
		title: "Yea", emoji: "👍",
		text: [
			'PLACEHOLDER sara_question_02_yes',
		],
		returnToStart: true
	},
	sara_question_02_no: {
		title: "Nope", emoji: "👎",
		text: [
			'PLACEHOLDER sara_question_02_no',
		],
		returnToStart: true
	}
};

export const ACTIONS = GetRecordWithIds(_ACTIONS) as Record<string, Action>;