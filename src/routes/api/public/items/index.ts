import clientPromise from "$lib/mongoDB";
import dotenv from "dotenv";
import type { RequestHandler } from "@sveltejs/kit";

dotenv.config();

export const get: RequestHandler = async () => {

    const dbConnection = await clientPromise;
    const db = dbConnection.db(process.env["DB_NAME"]);
    const collection = db.collection(process.env["DB_STOCK_COLLECTION"] as string);
    const itemStock = await collection.find().toArray();

    return {
        status: 200,
        body: {
            items: itemStock
        }
    }
}
