import clientPromise from "$lib/mongoDB";
import type { ParamMatcher, RequestHandler } from "@sveltejs/kit";
import { ObjectId } from "mongodb";

export const match: ParamMatcher = (param) => {
    if (param.length == 0) return false;
    return true;
}

export const get: RequestHandler = async ({ params }) => {

    const dbConnection = await clientPromise;

    const db = dbConnection.db(process.env["DB_NAME"]);
    const collection = db.collection(process.env["DB_STOCK_COLLECTION"] as string);
    try {
        const objectId = new ObjectId(params["id"]);
        const itemStock = await collection.findOne({ _id: objectId });

        return {
            status: 200,
            body: {
                item: itemStock
            }
        };
    } catch (error) {
        if (error instanceof Error) {
            return {
                status: 400,
                body: {
                    error: error.message
                }
            }
        } else {
            return {
                status: 400,
                body: {
                    error: "Unknown error"
                }
            }
        }
    }

}