<script>
  import { onMount } from "svelte";
  import { currentPath, currentManga } from "./stores";
  import { ALL_MANGA } from "./graphql/queries";
  import { tryCatchQL } from "./api";
  const mangaDB = "https://manga-graphql2.herokuapp.com/";
  $: console.log("Current Manga sets: ", $currentManga);
  let mangaLoading = false;

  const setMangaStore = async () => {
    mangaLoading = true;
    let mangaSets = await tryCatchQL(mangaDB, ALL_MANGA);
    currentManga.set(mangaSets.allManga);
    console.log("Curren manga sets now", $currentManga)
    mangaLoading = false;
  };

  
  onMount(() => currentPath.set("manga"));
  onMount(setMangaStore)
</script>

<main>
  <h1>Manga Page is working!</h1>

  {#if mangaLoading}
    Loading...
  {/if}

  {#await $currentManga}
    Getting that amazing manga now...
  {:then manga}
    {#each manga as manga}
      {manga.title} by {manga.author.name}
    {/each}
  {/await}
</main>

<style>
</style>
