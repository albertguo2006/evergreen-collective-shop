import dotenv from "dotenv";
import type { RequestHandler } from "@sveltejs/kit";
import { sessions } from "$lib/sessionManager";
import { timingSafeEqual } from "crypto";

dotenv.config();

export const post: RequestHandler = async ({ request }) => {

    const enteredUsername = request.headers.get("Username");
    const enteredPassword = request.headers.get("Password");

    if (enteredUsername === null || enteredPassword === null) {
        return {
            status: 401,
            body: "Invalid request body. Ensure it is a valid json entry of enteredUsername and enteredPassword"
        };
    }

    if (timingSafeEqual(Buffer.alloc(enteredUsername.length, enteredUsername), Buffer.alloc(process.env["ADMIN_USERNAME"]!.length, process.env["ADMIN_USERNAME"]))
        && timingSafeEqual(Buffer.alloc(enteredPassword.length, enteredPassword), Buffer.alloc(process.env["ADMIN_PASSWORD"]!.length, process.env["ADMIN_PASSWORD"]))) {

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

        const sessionId = sessions.createSession();

        return {
            status: 200,
            headers: { "Set-Cookie": `sessionId=${sessionId}` },
            body: sessionId
        }
    } else {
        return {
            status: 403,
            body: "Invalid username or password"
        }
    }


}