import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();
const uri = process.env["MONGODB_URI"];

if (!uri) {
    throw new Error("MONGODB_URI is not defined");
}

if (!process.env["DB_NAME"]) {
    throw new Error("DB_NAME is not defined");
}

if (!process.env["DB_STOCK_COLLECTION"]) {
    throw new Error("DB_STOCK_COLLECTION is not defined");
}

const client = new MongoClient(uri);
const clientPromise = client.connect();
export default clientPromise;