import clientPromise from "$lib/mongoDB";
import dotenv from "dotenv";
import type { RequestHandler } from "@sveltejs/kit";
import type ItemStock from "$lib/ItemStock";
import type { WithId } from "mongodb";

dotenv.config();

export const GET: RequestHandler = async () => {
    return {
        status: 200,
        body: {
            items: (await allItems()) as WithId<ItemStock>[]
        }
    }
}

export const allItems = async (): Promise<WithId<ItemStock[]>> => {
    const dbConnection = await clientPromise;
    const db = dbConnection.db(process.env["DB_NAME"]);
    const collection = db.collection(process.env["DB_STOCK_COLLECTION"] as string);
    return (await collection.find().toArray()) as WithId<ItemStock[]>;
}
