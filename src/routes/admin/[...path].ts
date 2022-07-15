import type { RequestHandler } from "@sveltejs/kit";

export const get: RequestHandler = async ({ locals }) => {
    if (locals.isAdmin) {
        return {
            status: 200,
            body: {
                isAuthenticated: true
            }
        }
    } else {
        return {
            status: 200,
            body: {
                isAuthenticated: false
            }
        }
    }
}