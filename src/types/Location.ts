import { ConditionalAction } from "./Action"
import { DOW, GetRecordWithIds, isBetween, t } from "../Utils"
import { SHOPS, Shop } from "./Shop"

export type LocationPath = {
	id: string,
	time: number
}

export type Location = {
	id: string,
	title: string,
	image: LocationBackgroundPeriods,
	emoji: string,
	descriptions?: string[],
	actions?: (string | ConditionalAction)[],
	children?: LocationPath[],
	shop?: Shop,
	unavailability?: (time: number, dayOfTheWeek: number) => Reason | null;
}

type _Location = Omit<Location, 'id'>

export type Reason = {
	short: string,
	full: string[]
}

type UnavailabilityPeriod = {
    from: number;
    to: number;
    reason: Reason
}

export type LocationBackgroundPeriods = {
	day: string,
	night?: string,
	twilight?: string
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

const _LOCATIONS: Record<string, _Location> = {
	home: {
		title: "Your home",
		image: {
			day: "home.jpg"
		},
		emoji: "🚪",
		actions: [
			"work_freelance",
			"bed"
		],
		descriptions: [
			"This place appears to be your home.",
			"You are at home right now."
		],
		children: [
			{ id: "bathroom", time: 0 },
			{ id: "pc", time: 0 }
		]
	},
	pc: {
		title: "PC",
		image: {
			day: "pc.jpg",
		},
		emoji: "💻",
	},
	bathroom: {
		title: "Your bathroom",
		image: {
			day: "bathroom.jpg"
		},
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
		title: "Home Stairwell",
		image: {
			day: "stairwell.jpg",
		},
		emoji: "🏠",
		descriptions: [
			"This place appears to be a stairwell.",
		],
		children: [
			{ id: "home", time: 0 }
		]
	},
	home_street: {
		title: "Market Street",
		image: {
			day: "home_street.jpg",
			night: "home_street_night.jpg",
			twilight: "home_street_twilight.jpg"
		},
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
		image: {
			day: "convenience_store.jpg",
		},
		emoji: "🏬",
		shop: SHOPS.grocery,
		descriptions: [
			"This place appears to be a convenience store.",
			"You are in convenience store right now."
		]
	},
	sara_street: {
		title: "Bright Street",
		image: {
			day: "sara_street.jpg",
		},
		emoji: "🏙",
		descriptions: [
			"There is a college on this street, you can see some student walking around.",
			"Some buildings and a college."
		],
		children: [
			{ id: "college", time: t(0, 15) },
			{ id: "home_street", time: t(0, 10) },
			{ id: "burger_king", time: t(0, 5) },
		]
	},
	burger_king: {
		title: "Burger King",
		image: {
			day: "burger_king.jpg",
			night: "burger_king_night.jpg",
			twilight: "burger_king_twilight.jpg"
		},
		emoji: "🍔",
		shop: SHOPS.burger_king,
		actions: [
			{ action: "burger_king_application", unseenActions: ["burger_king_application"] },
			{ action: "work_burger_king", seenActions: ["burger_king_application"], time: { from: t(6, 0), to: t(9, 9) } }
		],
		descriptions: [
			"You are at local burger king.",
			"This is where people eat burgers."
		],
		unavailability: (time: number): Reason | null => {
			return checkUnavailability(time, [{
				from: t(1, 0), to: t(6, 0),
				reason: {
					short: "closed",
					full: [
						"Burger King is closed."
					]
				}
			},]);
		},
	},
	college: {
		title: "College",
		image: {
			day: "college.jpg",
		},
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
		image: {
			day: "subway_train.jpg",
		},
		emoji: "🚈",
		descriptions: [
			"You are in subway car. \n\n"+
			"*You can use the wait function by pressing the hourglass icon on the left. \nWait for 10 minutes.*",
		],
		actions: [
			{ action: "intro_1", unseenActions: ["intro_1"], time: { from: t(8, 10), to: t(24, 0) } }
		]
	},
	subway: {
		title: "Subway",
		image: {
			day: "subway.jpg",
		},
		emoji: "🚇",
		descriptions: [
			"You are at local subway.",
			"This is where people go to work.",
			"You can see some people walking around.",
		]
	}
};

export const LOCATIONS = GetRecordWithIds(_LOCATIONS) as Record<string, Location>;