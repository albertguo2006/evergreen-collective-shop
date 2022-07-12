import clientPromise from "$lib/mongoDB";
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

export const get: RequestHandler = async ({ params }) => {

    const dbConnection = await clientPromise;

    // Env variables validated to exist by $lib/mongoDB
    const db = dbConnection.db(process.env["DB_NAME"]);
    const collection = db.collection(process.env["DB_STOCK_COLLECTION"] as string);
    const itemStock = (await collection.findOne({ name: params["item"] })) as ItemStock;

    return {
        status: 200,
        body: JSON.parse(JSON.stringify(itemStock)) // Stringify and Parse to make it JSON, cause ItemStock is not a valid return type
    };
};

export const update: RequestHandler = async ({ params, request }) => {

    const itemRequest = JSON.parse(await request.json());
    if (itemRequest! instanceof ItemStock) {
        return {
            status: 400,
            body: "Invalid request body. Ensure it is a valid json entry of an ItemStock"
        };
    }

    const dbConnection = await clientPromise;
    const db = dbConnection.db(process.env["DB_NAME"]);
    const collection = db.collection(process.env["DB_STOCK_COLLECTION"] as string);

    collection.updateOne({ name: params["item"] }, { $set: itemRequest });

    return {
        status: 200,
        body: `Updated ${params["item"]} successfully`
    }
}
