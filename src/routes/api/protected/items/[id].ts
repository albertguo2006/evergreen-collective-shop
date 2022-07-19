import ItemStock from "$lib/ItemStock";
import clientPromise from "$lib/mongoDB";
import type { RequestHandler } from "@sveltejs/kit";
import { ObjectId } from "mongodb";
import { isAuthorized } from "../../public/authCheck";

export const patch: RequestHandler = async ({ params, request }) => {

    const requestAuthCode = isAuthorized(request.headers.get("cookie")?.split(";"));
    if (requestAuthCode !== 200) {
        return {
            status: requestAuthCode,
            body: {
                isAuthorized: false
            }
        }
    }

    const json = await request.json();
    // We're not checking the validity of the json's contents, so let's just hope it's valid

    const dbConnection = await clientPromise;

    const db = dbConnection.db(process.env["DB_NAME"]);
    const collection = db.collection(process.env["DB_STOCK_COLLECTION"] as string);

    try {
        const objectId = new ObjectId(params["id"]);
        await collection.findOneAndUpdate({_id: objectId}, {$set: json});

        return {
            status: 200,
            body: {
                isAuthorized: requestAuthCode === 200
            }
        }

    } catch (error) {
        if (error instanceof Error) {
            return {
                status: 400,
                body: {
                    error: error.message,
                    isAuthorized: requestAuthCode === 200
                }
            }
        } else {
            return {
                status: 400,
                body: {
                    error: "Unknown error",
                    isAuthorized: requestAuthCode === 200
                }
            }
        }
    }

}
