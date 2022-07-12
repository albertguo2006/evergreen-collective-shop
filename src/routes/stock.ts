import type { RequestHandler } from "@sveltejs/kit";
import { ObjectId } from "mongodb";
import { collections } from "../services/database.service";
import type { Purchase, Item } from "../models/purchase";

export const get: RequestHandler = async ({ request }) => {

    const purchases = (await collections.purchasesCollection?.find({}).toArray()) as unknown as Purchase[];

    return {
        status: 200,
        body: "Hello World"
    }
}