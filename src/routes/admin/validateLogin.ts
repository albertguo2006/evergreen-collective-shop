import dotenv from "dotenv";
import type { RequestHandler } from "@sveltejs/kit";
import { sessions } from "$lib/sessionManager";

dotenv.config();

export const get: RequestHandler = async ({ request }) => {

    const enteredUsername = request.headers.get("Username");
    const enteredPassword = request.headers.get("Password");

    if (enteredUsername === null || enteredPassword === null) {
        return {
            status: 401,
            body: "Invalid request body. Ensure it is a valid json entry of enteredUsername and enteredPassword"
        };
    }


    if (enteredUsername === process.env["ADMIN_USERNAME"] && enteredPassword === process.env["ADMIN_PASSWORD"]) {


        const requestCookies = request.headers.get("cookie");

        if (requestCookies !== null) {
            const cookies = requestCookies.split(";");
            for (const cookie of cookies) {
                if (cookie.startsWith("sessionId=")) {
                    sessions.removeSession(cookie.split("=")[1]);
                    // We can continue to check jic there's a duplicate sessionId?
                }
            }
        }


        return {
            status: 200,
            headers: { "Set-Cookie": `sessionId=${sessions.createSession()}` },
            body: "Successfully logged in",
        }
    } else {
        return {
            status: 403,
            body: "Invalid username or password"
        }
    }
}