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


        let headers;
        if (request.headers.get("cookie") === null) {
            headers = {
                "Set-Cookie": `session=${sessions.createSession()}; SameSite=Strict; Secure`
            };
        } else headers = {};

        return {
            status: 200,
            headers: headers,
            body: "Successfully logged in",
        }
    } else {
        return {
            status: 403,
            body: "Invalid username or password"
        }
    }
}