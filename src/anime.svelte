<script>
  import { onMount } from "svelte";
  import tryCatch, { sendAPIData } from "./api";
  import { fade } from "svelte/transition";
  import { currentAnime, searchResults, animeDetail } from "./stores";
  import {
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardSubtitle,
    CardText,
    CardTitle,
    Spinner,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
  } from "sveltestrap";
  let currentSearch;
  let searchTrigger = false;
  let open = false;
  const setCurrent = async () => {
    let animeSets = await tryCatch(
      "https://lit-mountain-37161.herokuapp.com/anime"
    );
    currentAnime.set(animeSets);
  };
  const searchMore = async () => {
    searchTrigger = true;
    const reply = await tryCatch(
      `https://api.jikan.moe/v3/search/anime?q=${currentSearch}&limit=10`
    );
    searchResults.set(reply.results);
    console.log("Search results:", $searchResults);
    return reply.results;
  };
  const getAnimeDetail = async (id) => {
    const detail = await tryCatch(`https://api.jikan.moe/v3/anime/`, id);
    animeDetail.set(detail);
    console.log("Details of selected anime:", $animeDetail)
  };
  const toggleAddAnimeModal = async (id = "") => {
    if (!id) {
      open = !open;
    } else {
      getAnimeDetail(id).then((open = !open));
    }
  };
  const handleApiSend = async (URL, upload) => {
    await sendAPIData(URL, upload)
    searchTrigger = false;
    toggleAddAnimeModal()
    setCurrent()
  }
  //Needs
  //Display current list as cards
  //Search Jikan anime api, select entry, add that to set
  //     Bind input, form to search, have search area div with spinner
  //Cards select summons modal and sets currentSelect store, has button to add to list
  onMount(setCurrent);
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
  />
</svelte:head>

<div>
  <Modal
    backdrop=true
    keyboard=true
    autoFocus
    isOpen={open}
    {toggleAddAnimeModal}>
    <ModalHeader {toggleAddAnimeModal}>
      {$animeDetail.title}
    </ModalHeader>
    <ModalBody>
      <h2>Add {$animeDetail.title} to your list?</h2>
    </ModalBody>

    <ModalFooter>
      <button on:click={() => handleApiSend('https://lit-mountain-37161.herokuapp.com/anime/', $animeDetail)}>CONFIRM</button>
      <button on:click={toggleAddAnimeModal}>QUIT</button>
    </ModalFooter>
  </Modal>
  <h2>Here be the anime!</h2>
  {#await $currentAnime}
    <Spinner color="primary" />
    <p>Loading that sweet, sweet anime...</p>
  {:then anime}
    <form on:submit|preventDefault={searchMore} action="">
      <input
        bind:value={currentSearch}
        type="text"
        placeholder="Search anime..."
      />
      <button on:click={searchMore}>Search</button>
    </form>
    {#if searchTrigger}
      {#await $searchResults}
        <Spinner color="primary" /> Loading...
      {:then animeResult}
        <div class="searchGrid">
          {#each animeResult as result}
            <div transition:fade class="displaySearch">
              <Card on:click={() => toggleAddAnimeModal(result.mal_id)} body>
                {result.title} <img src={result.image_url} alt="" /></Card
              >
            </div>
          {/each}
        </div>
      {/await}
    {/if}
    <div class="aGrid">
      {#each anime as animeInfo, index (animeInfo._id)}
        <div>
          <Card style="width: 30vw" class="mb-3">
            <CardHeader>
              <CardTitle>{animeInfo.title}</CardTitle>
            </CardHeader>
            <CardBody>
              <CardSubtitle>{animeInfo.score}</CardSubtitle>
              <img
                class="animeImage"
                src={animeInfo.image_url}
                alt="{animeInfo.title} Cover"
              />
              <CardText>
                {animeInfo.synopsis}
              </CardText>
            </CardBody>
            <CardFooter
              >Type: {animeInfo.type} | Episodes: {animeInfo.episodes}</CardFooter
            >
          </Card>
        </div>
      {/each}
    </div>
  {/await}
</div>

<style>
  .aGrid {
    display: grid;
    gap: 20px;
    grid-template-columns: 1fr 1fr 1fr;
    margin: 1rem auto;
    cursor: pointer;
  }
  .searchGrid {
    display: grid;
    gap: 5px;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    margin: 1rem auto;
    cursor: pointer;
  }
  .displaySearch img {
    width: 100%;
    max-width: 225px;
  }
  .animeImage {
    width: 100%;
    max-width: 225px;
  }
</style>
