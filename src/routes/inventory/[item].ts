import clientPromise from "$lib/mongoDB";
import dotenv from "dotenv";
import ItemStock from "$lib/ItemStock";
import type { ParamMatcher, RequestHandler } from "@sveltejs/kit";

export const match: ParamMatcher = (param) => {
    switch (param.toLowerCase()) {
        case "tote-bag":
        case "another-item":
            return true;
        default:
            return false;
    }
}

dotenv.config();

export const get: RequestHandler = async ({ params }) => {

    const dbConnection = await clientPromise;

    const db = dbConnection.db(process.env["DB_NAME"]);
    const collection = db.collection(process.env["DB_STOCK_COLLECTION"] as string);
    const itemStock = await collection.findOne({ name: params["item"] }) as ItemStock;

    return {
        status: 200,
        body: JSON.parse(JSON.stringify(itemStock)) // Stringify and Parse to make it JSON, cause ItemStock is not a valid return type
    };
};
