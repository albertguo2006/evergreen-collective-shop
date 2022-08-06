import type { ObjectId } from "mongodb";
import { writable } from "svelte-local-storage-store"; // This isn't the writable from svelte!


export const cart = writable<Array<CartItem>>("cart", []);
export const lastPurchasedItems = writable<Array<CartItem>>("lastPurchasedItems", []);

export class CartItem {
    constructor(
        public itemId: ObjectId,
        public quantity: number
    ) { }
}
