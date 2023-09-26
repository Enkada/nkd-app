import { GetRecordWithIds } from "../Utils";
import { ITEMS, ItemPrice } from "./Item"

export type Shop = {
    id: string,
    items: ItemPrice[]
}

export type _Shop = Omit<Shop, 'id'>

const priceMultiplier = 2;

const price = (value: number) => value * priceMultiplier;

const _SHOPS: Record<string, _Shop> = {
    convenience_store: {
        items: [
            {
                item: ITEMS.hotdog,
                price: price(1.5)
            },
            {
                item: ITEMS.sandwich,
                price: price(1.5)
            },
            {
                item: ITEMS.apple,
                price: price(0.5)
            },
            {
                item: ITEMS.cookie,
                price: price(0.5)
            },
            {
                item: ITEMS.burger,
                price: price(1.5)
            },
            {
                item: ITEMS.pizza,
                price: price(5)
            },
            
        ]
    },
    burger_king: {
        items: [
            {
                item: ITEMS.burger,
                price: price(2)
            },
            {
                item: ITEMS.fries,
                price: price(1.5)
            }
        ]
    },
    furniture_store: {
        items: [
            {
                item: ITEMS.mattress,
                price: price(10)
            }
        ]
    }
}

export const SHOPS = GetRecordWithIds(_SHOPS) as Record<string, Shop>;