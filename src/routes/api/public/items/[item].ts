import clientPromise from "$lib/mongoDB";
import type { ParamMatcher, RequestHandler } from "@sveltejs/kit";

export const match: ParamMatcher = (param) => {
    if (param.length == 0) return false;
    return true;
} 

export const get: RequestHandler = async ({ params }) => {

    const dbConnection = await clientPromise;

    const db = dbConnection.db(process.env["DB_NAME"]);
    const collection = db.collection(process.env["DB_STOCK_COLLECTION"] as string);
    const itemStock = await collection.findOne({ name: params["item"].toLowerCase() });

    return {
        status: 200,
        body: itemStock 
    };

}