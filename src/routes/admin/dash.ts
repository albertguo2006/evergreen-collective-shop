import clientPromise from "$lib/mongoDB";
import dotenv from "dotenv";
import type { RequestHandler } from "@sveltejs/kit";
import type ItemStock from "$lib/ItemStock";

dotenv.config();

export const get: RequestHandler = async ({ locals }) => {
    console.log(locals.isAdmin)
    if (locals.isAdmin) {
        const dbConnection = await clientPromise;

        const db = dbConnection.db(process.env["DB_NAME"]);
        const collection = db.collection(process.env["DB_STOCK_COLLECTION"] as string);
        const itemStock = await collection.find({}).toArray() as ItemStock[];
        return {
            status: 200,
            body: { isAuthenticated: true, items: itemStock }
        }
    }
    return {
        status: 403,
        body: { isAuthenticated: false }
    }
}