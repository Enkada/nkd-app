import { DOW, isBetween, t } from "./Utils";

export type Character = {
	id?: string,
    name: string;
    availability?: (time: number, dayOfTheWeek: number) => string | null;
    actions?: string[];
    greetings: string[];
}

const defaultGreetings = [
    "Hi.", "Nice to see you there.", "Glad to see ya.", "It's good to see you again.",
    "Hello.", "Pleased to meet you.", "Yo!", "Hey!", "Greetings!", "There you are!",
    "Great to see you!", "Good to see you!", "Hi there!"
]

export const _CHARACTERS = {
    sara: {
        name: "Sara",
        availability: (time: number, dayOfTheWeek: number): string | null => {
            switch (true) {
                case isBetween(dayOfTheWeek, DOW.Monday, DOW.Friday):
                    if (isBetween(time, t(0, 0), t(7, 59)))
                        return "home";
                    if (isBetween(time, t(8, 0), t(15, 59)))
                        return "college";
                    if (isBetween(time, t(16, 0), t(24, 0)))
                        return "home";
                    break;
                case isBetween(dayOfTheWeek, DOW.Saturday, DOW.Sunday):
                    if (isBetween(time, t(0, 0), t(24, 0)))
                        return "home";
                    break;
            }
            return null;
        },
        actions: [
            "sara_ask", "sara_examine"
        ],
        greetings: defaultGreetings
    },
    vika: {
        name: "Vika",
        availability: (time: number, dayOfTheWeek: number): string | null => {
            switch (true) {
                case isBetween(dayOfTheWeek, DOW.Monday, DOW.Friday):
                    if (isBetween(time, t(13, 0), t(15, 0)))
                        return "market";
                    if (isBetween(time, t(15, 0), t(16, 0)))
                        return "home_street";
                    break;
                case isBetween(dayOfTheWeek, DOW.Saturday, DOW.Sunday):
                    if (isBetween(time, t(12, 0), t(16, 0)))
                        return "sara_street";
                    break;
            }
            return null;
        },
        greetings: defaultGreetings,
    },
    milana: {
        name: "Milana",
        greetings: defaultGreetings
    },
};