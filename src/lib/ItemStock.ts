import type { ObjectId } from "mongodb";

export default class ItemStock {
    constructor(public name: string, public sold: number, public remaining: number, public currentPrice: number, public _id?: ObjectId) { }
}
