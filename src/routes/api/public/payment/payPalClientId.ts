import dotenv from "dotenv";
import type { RequestHandler } from "@sveltejs/kit";

dotenv.config();

export const GET: RequestHandler = async () => {
    return {
        code: 200,
        body: {
            clientId: process.env["PAYPAL_CLIENT_ID"],
        }
    }
}
