import { sessions } from "$lib/sessionManager";
import type { RequestHandler } from "@sveltejs/kit";

let sessionIds = Array<string>();

sessions.subscribe(value => { //Hmm, this could cause a memory leak?
    sessionIds = value;
});

export const get: RequestHandler = async ({ request }) => {
    const cookies = request.headers.get("cookie")?.split(";");
    const responseCode = isAuthorized(cookies);

    return {
        code: responseCode,
        body: {
            isAuthorized: responseCode === 200
        }
    }
}

export function isAuthorized(cookies: string[] | undefined): 200 | 401 | 403 {

    if (cookies === undefined) return 401;

    let sessionId: string | undefined;

    for (const cookie of cookies) {
        if (cookie.startsWith("sessionId=")) {
            sessionId = cookie.split("=")[1];
            break;
        }
    }

    if (sessionId === undefined) return 401;
    if (sessionIds.includes(sessionId)) return 200;

    // Auth failed
    return 403;



}
