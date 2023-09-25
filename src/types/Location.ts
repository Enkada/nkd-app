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
			{ id: "bus_stop_home_street", time: t(0, 5) }
		]
	},
	bus_stop_home_street: {
		title: "Bus Stop on Market Street",
		image: {
			day: "bus_stop.png",
		},
		emoji: "🚌",
		descriptions: [
			"You are at bus stop on Market Street.",
			"This is a bus stop on Market Street."
		],
		children: [
			{ id: "bus_stop_college_street", time: t(0, 15) },
			{ id: "bus_stop_grand_street", time: t(0, 15) }
		]
	},
	convenience_store: {
		title: "Convenience Store",
		image: {
			day: "convenience_store.jpg",
		},
		emoji: "🏪",
		shop: SHOPS.grocery,
		descriptions: [
			"This place appears to be a convenience store.",
			"You are in convenience store right now."
		]
	},
	college_street: {
		title: "Bright Street",
		image: {
			day: "college_street.png",
		},
		emoji: "🏙",
		descriptions: [
			"There is a college on this street, you can see some student walking around.",
			"Some buildings and a college."
		],
		children: [
			{ id: "college", time: t(0, 15) },
			{ id: "bus_stop_college_street", time: t(0, 5) }
		]
	},
	bus_stop_college_street: {
		title: "Bus Stop on Bright Street",
		image: {
			day: "bus_stop.png",
		},
		emoji: "🚌",
		descriptions: [
			"You are at bus stop on Bright Street.",
			"This is a bus stop on Bright Street."
		],
		children: [
			{ id: "bus_stop_grand_street", time: t(0, 15) }
		]
	},
	grand_street: {
		title: "Grand Street",
		image: {
			day: "grand_street.png",
		},
		emoji: "🏘",
		descriptions: [
			"There is a shopping mall on this street.",
			"You are on a Grand Street."
		],
		children: [
			{ id: "bus_stop_grand_street", time: t(0, 5) },
			{ id: "department_store", time: t(0, 5) }
		]
	},
	department_store: {
		title: "Department Store",
		image: {
			day: "department_store.png",
		},
		emoji: "🛍️",
		descriptions: [
			"This place appears to be a department store.",
			"You are in department store right now."
		],
		children: [
			{ id: "burger_king", time: t(0, 5) },
			{ id: "furniture_store", time: t(0, 5) }
		]
	},
	bus_stop_grand_street: {
		title: "Bus Stop on Grand Street",
		image: {
			day: "bus_stop.png",
		},
		emoji: "🚌",
		descriptions: [
			"You are at bus stop on Grand Street.",
			"This is a bus stop on Grand Street."
		]
	},
	furniture_store: {
		title: "Furniture Store",
		image: {
			day: "furniture_store.png",
		},
		emoji: "🛋️",
		descriptions: [
			"This place appears to be a furniture store.",
			"You are in furniture store right now."
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