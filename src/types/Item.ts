import { GetRecordWithIds } from "../Utils";

export type Item = {
	id: string,
	name: string,
	emoji: string,
    type: "food" | "misc" | "location",
	descriptions?: string[],
    hunger?: number
}

type _Item = Omit<Item, 'id'>

export type ItemPrice = {
    item: Item,
    price: number
}

export type ItemStorage = (Item & { count: number })[]

const _ITEMS: Record<string, _Item> = {
    hotdog: {
        name: "Hotdog",
        emoji: "🌭",
        type: "food", hunger: 50,
        descriptions: ["A hotdog."],
    },
    apple: {
        name: "Apple",
        emoji: "🍎",
        type: "food", hunger: 20,
        descriptions: ["An apple."],
    },
    burger: {
        name: "Burger",
        emoji: "🍔",
        type: "food", hunger: 60,
        descriptions: ["A burger."],
    },
    pizza: {
        name: "Pizza",
        emoji: "🍕",
        type: "food", hunger: 80,
        descriptions: ["A pizza."],
    },
    sandwich: {
        name: "Sandwich",
        emoji: "🥪",
        type: "food", hunger: 50,
        descriptions: ["A sandwich."],
    },
    cookie: {
        name: "Cookie",
        emoji: "🍪",
        type: "food", hunger: 10,
        descriptions: ["A cookie."],
    },
    fries: {
        name: "Fries",
        emoji: "🍟",
        type: "food", hunger: 30,
        descriptions: ["French fries."],
    },
    mattress: {
        name: "Mattress",
        emoji: "🛏",
        type: "location",
        descriptions: ["A mattress."],
    },
    canteen_lunch: {
        name: "Canteen Lunch",
        emoji: "🍱",
        type: "food", hunger: 70,
        descriptions: ["A canteen lunch."],
    }
}

export const ITEMS = GetRecordWithIds(_ITEMS) as Record<string, Item>;