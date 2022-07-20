import type { ObjectId } from "mongodb";

export class Purchase {
    constructor(public name: string, public email: string, public products: Product[], public status: PurchaseStatus, public public _id?: ObjectId) {}
}

export class Product {
    constructor(public name: string, public priceCentsAtSale: number, public quantity: number) {}
}

export enum PurchaseStatus {
    NeedsContacting = "needsContacting",
    Contacted = "contacted",
    PickupArranged = "pickupArranged",
    Completed = "completed"
}