function createSessionManager() {
    let sessions: string[] = [];
    return {
        get: () => sessions,
        createSession: (path?: string) => {
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let sessionId = "";
            for (let i = 0; i < 40; i++) {
                sessionId += characters.charAt(Math.floor(Math.random() * characters.length));
            }

            // Reminder that the options for a cookie are not reflected in the request headers, thus we should not store the options
            sessions.push(sessionId);

            // The cookie is actually valid for less than 24 hours, as cookies are cleared on the server every 24 hours, regardless of when a cookie is set
            const expires = new Date();
            expires.setTime(expires.getTime() + (1000 * 60 * 60 * 24));
            const options = path === undefined ? "" : `; Path=${path}` + `; SameSite=Strict; Secure; HttpOnly; Expires=${expires.toUTCString()}`;
            return sessionId + options;
        },
        removeSession: (sessionId: string) => sessions = sessions.filter(id => id !== sessionId),
        clearAllSessions: () => sessions = []
    }
}

export const sessions = createSessionManager();
setInterval(sessions.clearAllSessions, 1000 * 60 * 60 * 24); // clear all sessions after 24 hours, to clear up unused sessions  
