import type { ObjectId } from "mongodb";

export default class Stock {
    constructor(public sold: number, public remaining: number, public currentPrice: number, public id?: ObjectId) {}
}