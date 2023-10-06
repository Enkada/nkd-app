import { ConditionalAction } from "./Action"
import { Condition, DOW, GetRecordWithIds, t } from "../Utils"
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
	hue?: number,
	descriptions?: string[],
	actions?: (string | ConditionalAction)[],
	children?: LocationPath[],
	shop?: Shop,
	conditions?: Condition[]
}



type _Location = Omit<Location, 'id'>

export type LocationBackgroundPeriods = {
	day: string,
	night?: string,
	twilight?: string
}

const _LOCATIONS: Record<string, _Location> = {
	your_home: {
		title: "Your Home",
		image: {
			day: "your_home.png"
		},
		emoji: "🚪",
		descriptions: [
			"This place appears to be your home.",
			"You are at your home right now."
		],
		children: [
			{ id: "your_kitchen", time: 0 },
			{ id: "your_room", time: 0 },
			{ id: "your_living_room", time: 0 }
		]
	},
	your_room: {
		title: "Your Room",
		image: {
			day: "your_room.png"
		},
		actions: [
			"bed"
		],
		emoji: "🗝",
		descriptions: [
			"This place appears to be your room.",
		]
	},
	your_living_room: {
		title: "Living Room",
		image: {
			day: "your_living_room.png"
		},
		emoji: "🛋",
		descriptions: [
			"This place appears to be your living room.",
		]
	},
	your_kitchen: {
		title: "Kitchen",
		image: {
			day: "your_kitchen.png"
		},
		emoji: "🍳",
		descriptions: [
			"This place appears to be your kitchen.",
		]
	},
	home_street: {
		title: "Home Street",
		image: {
			day: "home_street.jpg"
		},
		emoji: "🏠",
		descriptions: [
			"This place appears to be a street.",
		],
		children: [
			{ id: "your_home", time: 5 },
			{ id: "bus_stop_home_street", time: 5 }
		]
	},
	bus_stop_home_street: {
		title: "Bus Stop on Home Street",
		image: {
			day: "bus_stop.png"
		},
		emoji: "🚌",
		children: [
			{ id: "bus_stop_sara_street", time: 45 }
		]
	},
	sara_home: {
		title: "Sara's Home",
		image: {
			day: "sara_home.jpg"
		},
		emoji: "🚪",
		actions: [
			"work_freelance",
			"bed"
		],
		descriptions: [
			"This place appears to be home of Sara.",
			"You are at Sara's home right now."
		],
		children: [
			{ id: "sara_bathroom", time: 0 },
			{ id: "sara_pc", time: 0 }
		]
	},
	sara_pc: {
		title: "PC",
		image: {
			day: "pc.jpg",
		},
		emoji: "💻",
	},
	sara_bathroom: {
		title: "Sara's Bathroom",
		image: {
			day: "sara_bathroom.jpg"
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
	sara_stairwell: {
		title: "Sara's Home Stairwell",
		image: {
			day: "stairwell.jpg",
		},
		emoji: "🏠",
		descriptions: [
			"This place appears to be a stairwell.",
		],
		children: [
			{ id: "sara_home", time: 0 }
		]
	},
	sara_street: {
		title: "Market Street",
		image: {
			day: "sara_street.jpg",
			night: "sara_street_night.jpg",
			twilight: "sara_street_twilight.jpg"
		},
		emoji: "🏙",
		descriptions: [
			"There is a local market on this street.",
			"This street is full of local shops."
		],
		children: [
			{ id: "sara_stairwell", time: t(0, 5) },
			{ id: "convenience_store", time: t(0, 5) },
			{ id: "bus_stop_sara_street", time: t(0, 5) }
		]
	},
	bus_stop_sara_street: {
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
		shop: SHOPS.convenience_store,
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
		emoji: "🚌", hue: 260,
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
			{ id: "department_store", time: t(0, 5) },
			{ id: "burger_king", time: t(0, 5) },
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
			{ id: "furniture_store", time: t(0, 5) }
		]
	},
	bus_stop_grand_street: {
		title: "Bus Stop on Grand Street",
		image: {
			day: "bus_stop.png",
		},
		emoji: "🚌", hue: 180,
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
		shop: SHOPS.furniture_store,
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
		conditions: [
			{
				isNegative: true,
				time: { from: t(1, 0), to: t(5, 59) },
				reason: {
					short: "closed",
					full: [
						"Burger King is closed."
					]
				}
			}
		]
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
		conditions: [
			{
				eval: "variables.college_pass",
				reason: {
					short: "not a student",
					full: [
						"You're not a student."
					]
				}
			},
			{
				isNegative: true,
				dayOfTheWeek: [DOW.Saturday, DOW.Sunday],
				reason: {
					short: "closed",
					full: [
						"It is not school day."
					]
				}
			},
			{
				isNegative: true,
				time: { from: t(0, 0), to: t(5, 59) },
				reason: {
					short: "closed",
					full: [
						"It is too early to go to college."
					]
				}
			},
			{
				isNegative: true,
				time: { from: t(19, 0), to: t(24, 0) },
				reason: {
					short: "closed",
					full: [
						"It is too late to go to college."
					]
				}
			}
		]
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