import { GetRecordWithIds } from "./Utils";

export type Item = {
	id?: string,
	name: string,
	emoji: string,
    type: "food" | "misc" | "location",
	descriptions?: string[],
    hunger?: number
}

const _ITEMS: Record<string, Item> = {
    hotdog: {
        name: "Hotdog",
        emoji: "🌭",
        type: "food", hunger: 50,
        descriptions: ["A hotdog."],
    },
    apple: {
        name: "Apple",
        emoji: "🍎",
        type: "food", hunger: 30,
        descriptions: ["An apple."],
    },
    burger: {
        name: "Burger",
        emoji: "🍔",
        type: "food", hunger: 80,
        descriptions: ["A burger."],
    },
    pizza: {
        name: "Pizza",
        emoji: "🍕",
        type: "food", hunger: 40,
        descriptions: ["A pizza."],
    },
    mattress: {
        name: "Mattress",
        emoji: "🛏",
        type: "location",
        descriptions: ["A mattress."],
    }
}

export const ITEMS = GetRecordWithIds(_ITEMS);

export type Shop = {
    id?: string,
    items: ItemPrice[]
}

export type ItemPrice = {
    item: Item,
    price: number
}

export type ItemStorage = (Item & { count: number })[]

export const _SHOPS: Record<string, Shop> = {
    grocery: {
        items: [
            {
                item: ITEMS.hotdog,
                price: 2
            },
            {
                item: ITEMS.apple,
                price: .8
            },
            {
                item: ITEMS.burger,
                price: 3
            },
            {
                item: ITEMS.pizza,
                price: 2.5
            },
            {
                item: ITEMS.mattress,
                price: 10
            }
        ]
    }
}