import { Time } from "./Utils";

export type Action = {
	id?: string,
	title?: string,
	emoji?: string,
	returnEmoji?: string,
	returnText?: string,
	returnToStart?: boolean,
	hideReturn?: boolean,
	time?: Time,
	text: string[],
	actions?: string[],
	isRest?: boolean,
	cost?: Cost
}

export type Cost = {
	money?: number,
	energy?: number,
}

export const _ACTIONS: Record<string, Action> = {
	bath: {
		title: "Take a bath", emoji: "🛁", time: new Time(30),
		text: [
			`You've just had a nice bath.`,
			`It's always good to take a bath once in a while.`
		]
	},
	work: {
		title: "Work", emoji: "👨‍💻", time: new Time(60),
		cost: { energy: 10 },
		text: [
			'You spend some time to find a job to do.',
			'You are trying to find a proper task to do for some money.',
		]
	},
	market_eat: {
		title: "Buy and eat hotdog", emoji: "🌭", time: new Time(8),
		cost: { money: 5, energy: -10 },
		text: [
			'You bought a hotdog and ate it.',
			'You purchased hotdog, it tastes nice.',
		]
	},
	sleep: {
		title: "Sleep", emoji: "💤", time: new Time(7, 0), isRest: true, returnEmoji: '🥱', returnText: 'Wake up',
		text: [
			"Let's get some rest. \nYou sleep for 7 hours.",
			"Time to have some sleep. The bed us comfy. \nYou sleep for 7 hours"
		]
	},
	start: {
		text: [`So, welcome to this app I made. I created this place because of one particular girl, a girl names Sara. This universe just for her and her only. I might sound obsessed with this girl, but believe me, I am.\nI could tell you so many things about Sara, but.. why don't you speak with her by yourself? This application allows you to enter the world she lives in. I want this journey to be a little bit challenging for you, so I won't give you any starting bonus.\nIt is Wednesday today, 8 in the morning, I think it is a good time for a walk.`],
		returnEmoji: '▶️',
		returnText: "Start"
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