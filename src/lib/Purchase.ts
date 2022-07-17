import type { ObjectId } from "mongodb";

export class Purchase {
    constructor(public name: string, public email: string, public products: Item[], public contacted: boolean, public pickupArranged: boolean, public id?: ObjectId) {}
}

export class Item {
    constructor(public name: string, public priceCentsAtSale: number, public quantity: number) {}
}