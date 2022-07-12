import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

export const collections: { purchasesCollection? : mongoDB.Collection } = {};

export async function connectToDatabase() {
    dotenv.config();
    const mongoDBClient = new mongoDB.MongoClient(process.env.DB_CONN_STRING as string);
    await mongoDBClient.connect();

    const db = mongoDBClient.db(process.env.DB_NAME as string);
    const objectCollection = db.collection(process.env.DB_COLLECTION as string);
    collections.purchasesCollection = objectCollection;
}