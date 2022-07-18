import { sessions } from "$lib/sessionManager";
import type { RequestHandler } from "@sveltejs/kit";

let sessionIds = Array<string>();

sessions.subscribe(value => { //Hmm, this could cause a memory leak?
    sessionIds = value;
});

export const get: RequestHandler = async ({ request }) => {
    const cookies = request.headers.get("cookie")?.split(";");
    
    return {
        code: 200,
        body: {
            isAuthenticated: isAuthorized(cookies)
        }
    }
}

export function isAuthorized(cookies: string[] | undefined): boolean {

    if (cookies !== undefined) {
        let sessionId: string | undefined;

        for (const cookie of cookies) {
            if (cookie.startsWith("sessionId=")) {
                sessionId = cookie.split("=")[1];
                break;
            }
        }
        if (sessionId !== undefined) {
            if (sessionIds.includes(sessionId)) {
                return true;
            }
        }
    }

    return false;
}
