import { writable } from "svelte/store";

function createSessionManager() {
    const { subscribe, set, update } = writable<Array<string>>([]);
    return {
        subscribe,
        createSession: () => {
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
            let sessionId = "";
            for (let i = 0; i < 40; i++) {
                sessionId += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            update(arr => [...arr, sessionId]);
            return sessionId;
        },
        removeSession: (sessionId: string) => update(arr => arr.filter(id => id !== sessionId)),
        clearAllSessions: () => update(arr => [])
    }
}

 export const sessions = createSessionManager();
setInterval(sessions.clearAllSessions, 1000 * 60 * 60 * 24); // clear all sessions after 24 hours, to clear up unused sessions  
