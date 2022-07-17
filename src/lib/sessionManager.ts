import { writable } from "svelte/store";

function createSessionManager() {
    const { subscribe, set, update } = writable<Array<string>>([]);
    return {
        subscribe,
        createSession: () => {
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let sessionId = "";
            for (let i = 0; i < 40; i++) {
                sessionId += characters.charAt(Math.floor(Math.random() * characters.length));
            }

            // Reminder that the options for a cookie are not reflected in the request headers, thus we should not store the options
            update(arr => [...arr, sessionId]);

            // The cookie is actually valid for less than 24 hours, as cookies are cleared on the server every 24 hours, regardless of when a cookie is set
            const expires = new Date();
            expires.setTime(expires.getTime() + (1000 * 60 * 60 * 24));
            return sessionId + `; SameSite=Strict; Secure; HttpOnly; Expires=${expires.toUTCString()}`;
        },
        removeSession: (sessionId: string) => update(arr => arr.filter(id => id !== sessionId)),
        clearAllSessions: () => update(arr => [])
    }
}

export const sessions = createSessionManager();
setInterval(sessions.clearAllSessions, 1000 * 60 * 60 * 24); // clear all sessions after 24 hours, to clear up unused sessions  
