import { sessions } from "$lib/sessionManager";
import type { GetSession } from "@sveltejs/kit";

let sessionIds = Array<string>();

sessions.subscribe(value => { //Hmm, this could cause a memory leak?
    sessionIds = value;
});

export const getSession: GetSession = async ({ request, locals }) => {

    const cookies = request.headers.get("cookie")?.split(";");
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
                locals.isAdmin = true
                return { isAdmin: true };
            }
        }
    }
    locals.isAdmin = false;
    return { isAdmin: false };
}