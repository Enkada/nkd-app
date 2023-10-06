import { Condition, DOW, GetRecordWithIds, t } from "../Utils";

export type Character = {
	id: string,
    name: string;
    image?: Record<string, string[]>;
    conditions: Condition[];
    // availability?: (time: number, dayOfTheWeek: number) => string | null;
    actions?: string[];
    greetings: string[];
}

type _Character = Omit<Character, 'id'>

const defaultGreetings = [
    "Hi.", "Nice to see you there.", "Glad to see ya.", "It's good to see you again.",
    "Hello.", "Pleased to meet you.", "Yo!", "Hey!", "Greetings!", "There you are!",
    "Great to see you!", "Good to see you!", "Hi there!"
]

export const _CHARACTERS: Record<string, _Character> = {
    sara: {
        name: "Sara",
        image: {
            cardigan: ['college'],
            camisole: ['sara_home']
        },
        conditions: [
            {
                time: { from: t(17, 0), to: t(17, 59) },
                eval: "day == variables.sara_date_day",
                location: "burger_king"
            },
            {
                dayOfTheWeek: [DOW.Monday, DOW.Tuesday, DOW.Wednesday, DOW.Thursday, DOW.Friday],
                time: { from: t(0, 0), to: t(7, 59) },
                location: "sara_home"
            },
            {
                dayOfTheWeek: [DOW.Monday, DOW.Tuesday, DOW.Wednesday, DOW.Thursday, DOW.Friday],
                time: { from: t(8, 0), to: t(15, 59) },
                location: "college"
            },
            {
                dayOfTheWeek: [DOW.Monday, DOW.Tuesday, DOW.Wednesday, DOW.Thursday, DOW.Friday],
                time: { from: t(16, 0), to: t(24, 0) },
                location: "sara_home"
            },
            {
                dayOfTheWeek: [DOW.Saturday, DOW.Sunday],
                time: { from: t(0, 0), to: t(24, 0) },
                location: "sara_home"
            }
        ],
        actions: [
            "sara_ask", "sara_examine"
        ],
        greetings: defaultGreetings
    },
};

export const CHARACTERS = GetRecordWithIds(_CHARACTERS) as Record<string, Character>;