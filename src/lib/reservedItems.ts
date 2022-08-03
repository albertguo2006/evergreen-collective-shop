import { writable } from "svelte/store";

export const reserved = writable<Map<string, number>>();
