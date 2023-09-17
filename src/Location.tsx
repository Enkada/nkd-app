import { DOW, Time, isBetween, t } from "./Utils"

export type LocationPath = {
	id: string,
	time: Time
}

export type Location = {
	id?: string,
	title: string,
	image?: string,
	emoji: string,
	descriptions: string[],
	actions?: string[],
	children?: LocationPath[],
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
	your_home: {
		title: "Your home",
		image: "your_home.jpg",
		emoji: "🏠",
		actions: [
			"work",
			"sleep"
		],
		descriptions: [
			"This place appears to be your home.",
			"You are at home right now."
		],
		children: [
			{ id: "your_bathroom", time: new Time(0) },
			{ id: "your_pc", time: new Time(0) }
		]
	},
	your_pc: {
		title: "PC",
		image: "pc.jpg",
		emoji: "💻",
		descriptions: [
			"PC.",
		],
	},
	your_bathroom: {
		title: "Your bathroom",
		image: "your_bathroom.jpg",
		emoji: "🛁",
		actions: [
			"bath"
		],
		descriptions: [
			"This place appears to be your bathroom.",
			"You are in your bathroom right now."
		]
	},
	home_street: {
		title: "Market Street",
		image: "home_street.jpg",
		emoji: "🏙",
		descriptions: [
			"This place is kinda sus.",
			"You feel sussy."
		],
		children: [
			{ id: "your_home", time: new Time(5) },
			{ id: "market", time: new Time(5) },
		]
	},
	market: {
		title: "Market",
		image: "market.jpg",
		emoji: "🏬",
		actions: ["market_eat"],
		descriptions: [
			"This place appears to be a local market.",
			"You are in local market right now."
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
			{ id: "college", time: new Time(15) },
			{ id: "sara_home", time: new Time(5) },
			{ id: "home_street", time: new Time(10) }
		]
	},
	sara_home: {
		title: "Sara's home",
		image: "sara_home.jpg",
		emoji: "🏡",
		descriptions: [
			"You are at Sara's home.",
			"This is where Sara lives."
		],
		unavailability: (time: number, dayOfTheWeek: number): Reason | null => {
			switch (true) {
				case isBetween(dayOfTheWeek, DOW.Monday, DOW.Friday):

					return checkUnavailability(time, [
						{
							from: t(0, 0), to: t(6, 0),
							reason: {
								short: "sleeping",
								full: [
									"Sara is having a nice sleep."
								]
							}
						},
						{
							from: t(9, 0), to: t(16, 0),
							reason: {
								short: "at college",
								full: [
									"Sara is at college."
								]
							}
						},
						{
							from: t(20, 0), to: t(24, 0),
							reason: {
								short: "sleeping",
								full: [
									"Sara is having a nice sleep."
								]
							}
						},

					]);
				default: return {
					short: "on vacation",
					full: [
						"Sara is on vacation."
					]
				};
			}
		},
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
	}
};