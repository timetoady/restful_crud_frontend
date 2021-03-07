<script>
  import { onMount } from "svelte";
  import tryCatch from "./api";
  import { currentAnime } from "./stores";
  const setCurrent = async () => {
    let animeSets = await tryCatch(
      "https://lit-mountain-37161.herokuapp.com/anime"
    );
    console.log(animeSets)
    currentAnime.set(animeSets);
    console.log("Set current:", $currentAnime)
  };
  //Needs
  //Get current anime list, display as cards
  //Search Jikan anime api, select entry, add that to set
  onMount(setCurrent)
</script>

<div>
  <h2>Here be the anime!</h2>
  {#await $currentAnime}
    <p>Loading that sweet, sweet anime...</p>
  {:then anime}
    {#each anime as animeInfo, index (animeInfo._id)}
      <h2>Title: {animeInfo.title}</h2>
    {/each}
  {/await}
</div>
