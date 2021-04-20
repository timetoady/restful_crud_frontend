//Will store data for app
import { writable } from "svelte/store";

export const currentAnime = writable([]);
export const searchResults = writable([])
export const animeDetail = writable({})
export const currentPath = writable("")