import { Shop, _SHOPS } from "./Items"
import { DOW, isBetween, t } from "./Utils"

export type LocationPath = {
	id: string,
	time: number
}

export type Location = {
	id?: string,
	title: string,
	image?: string,
	emoji: string,
	descriptions?: string[],
	actions?: string[],
	children?: LocationPath[],
	shop?: Shop,
	unavailability?: (time: number, dayOfTheWeek: number) => Reason | null;
}

export type Reason = {
	short: string,
	full: string[]
}


type UnavailabilityPeriod = {
    from: number;
    to: number;
    reason: Reason
}

const checkUnavailability = (time: number, periods: UnavailabilityPeriod[]): Reason | null => {
	for (let index = 0; index < periods.length; index++) {
		const period = periods[index];
		
		if (isBetween(time, period.from, period.to - 1)) {
			return period.reason;
		}
	}

	return null;
}

export const _LOCATIONS: Record<string, Location> = {
	home: {
		title: "Your home",
		image: "home.jpg",
		emoji: "🚪",
		actions: [
			"work",
			"sleep"
		],
		descriptions: [
			"This place appears to be your home.",
			"You are at home right now."
		],
		children: [
			{ id: "bathroom", time: t(0, 0) },
			{ id: "pc", time: t(0, 0) }
		]
	},
	pc: {
		title: "PC",
		image: "pc.jpg",
		emoji: "💻",
	},
	bathroom: {
		title: "Your bathroom",
		image: "bathroom.jpg",
		emoji: "🛁",
		actions: [
			"bath"
		],
		descriptions: [
			"This place appears to be your bathroom.",
			"You are in your bathroom right now."
		]
	},
	stairwell: {
		title: "Home",
		image: "stairwell.jpg",
		emoji: "🏠",
		descriptions: [
			"This place appears to be a stairwell.",
		],
		children: [
			{ id: "home", time: t(0, 5) }
		]
	},
	home_street: {
		title: "Market Street",
		image: "home_street.jpg",
		emoji: "🏙",
		descriptions: [
			"There is a local market on this street.",
			"This street is full of local shops."
		],
		children: [
			{ id: "stairwell", time: t(0, 5) },
			{ id: "convenience_store", time: t(0, 5) },
		]
	},
	convenience_store: {
		title: "Convenience Store",
		image: "convenience_store.jpg",
		emoji: "🏬",
		shop: _SHOPS.grocery,
		descriptions: [
			"This place appears to be a convenience store.",
			"You are in convenience store right now."
		]
	},
	sara_street: {
		title: "Bright Street",
		image: "sara_street.jpg",
		emoji: "🏙",
		descriptions: [
			"There is a college on this street, you can see some student walking around.",
			"Some buildings and a college."
		],
		children: [
			{ id: "college", time: t(0, 15) },
			{ id: "home_street", time: t(0, 10) }
		]
	},
	college: {
		title: "College",
		image: "college.jpg",
		emoji: "🏫",
		descriptions: [
			"You are at local college.",
			"This is where people study."
		],
		unavailability: (time: number, dayOfTheWeek: number): Reason | null => {
			switch (true) {
				case isBetween(dayOfTheWeek, DOW.Monday, DOW.Friday):

					return checkUnavailability(time, [
						{
							from: t(0, 0), to: t(6, 0),
							reason: {
								short: "closed",
								full: [
									"It is too early to for college to open."
								]
							}
						},
						{
							from: t(19, 0), to: t(24, 0),
							reason: {
								short: "closed",
								full: [
									"It is too late to go to college."
								]
							}
						},
					]);
				default: return {
					short: "closed",
					full: [
						"It is not school day."
					]
				};
			}
		},
	},
	subway_train: {
		title: "Subway Train",
		image: "subway_train.jpg",
		emoji: "🚈",
		descriptions: [
			"You are in subway car.",
		]
	},
	subway: {
		title: "Subway",
		image: "subway.jpg",
		emoji: "🚇",
		descriptions: [
			"You are at local subway.",
			"This is where people go to work.",
			"You can see some people walking around.",
		]
	}
};