import type { ObjectId } from "mongodb";

export default class ItemStock {
    constructor(
        public name: string,
        public description: string,
        public sold: number,
        public isUnlimited: boolean,
        public originalStockIfLimited: number | null,
        public currentPriceCents: number,
        public _id?: ObjectId
    ) { }
}
