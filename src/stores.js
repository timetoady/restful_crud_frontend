//Will store data for app
import { writable } from "svelte/store";

export const currentAnime = writable([]);
export const currentManga = writable([]);
export const searchResults = writable([])
export const animeDetail = writable({})
export const mangaDetail = writable({})
export const currentPath = writable("")