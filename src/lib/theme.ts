import { writable } from "svelte-local-storage-store"; // This isn't the writable from svelte!

export const theme = writable<"light" | "dark">("theme", "light");