<script>
  import { onMount } from "svelte";
  import {
    currentPath,
    currentManga,
    mangaDetail,
    mangaSearchResults,
  } from "./stores";
  import { ALL_MANGA, addManga } from "./graphql/queries";
  import { fade } from "svelte/transition";
  import tryCatch, { tryCatchQL } from "./api";
  import { paginate, LightPaginationNav } from "svelte-paginate";
  import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardSubtitle,
    CardText,
    CardTitle,
    UncontrolledCollapse,
    Spinner,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
  } from "sveltestrap";
  //const mangaDB = "https://manga-graphql2.herokuapp.com/";
  const mangaDB = "http://localhost:4000/";
  $: console.log("Details of selected manga: ", $mangaDetail);
  let mangaLoading = false;
  let searchTrigger = false;
  let open = false;
  const setMangaStore = async () => {
    if ($currentManga.length === 0) {
      mangaLoading = true;
      let mangaSets = await tryCatchQL(mangaDB, ALL_MANGA);
      currentManga.set(mangaSets.allManga);
      console.log("Curren manga sets now", $currentManga);
      mangaLoading = false;
    }
  };



  const addAuthor = async (name) => {
    const CHANGE_MANGA = `
mutation addAnAuthor (name: String!, manga: [Manga]!) {
  data: { 
    name: ${name},
    manga: [Something I Like, Something I don't Like]
    }
    ) {
     id
     name
    }
  }
`;
    let madeAnAuthor = await tryCatchQL(mangaDB, CHANGE_MANGA);
    console.log(madeAnAuthor);
  };

  const getMangaDetail = async (id) => {
    const detail = await tryCatch(`https://api.jikan.moe/v3/manga/`, id);
    mangaDetail.set(detail);
    //console.log("Details of selected anime:", $animeDetail);
  };

  const toggleAddMangaModal = async (id = "") => {
    if (!id) {
      open = !open;
    } else {
      getMangaDetail(id).then((open = !open));
    }
  };
  //Next time: add, delete, get something by ID. May need some backend additional work.
  let mangaSearch;

  //Search more anime
  const searchMore = async () => {
    searchTrigger = true;
    const reply = await tryCatch(
      `https://api.jikan.moe/v3/search/manga?q=${mangaSearch}&limit=10`
    );
    mangaSearchResults.set(reply.results);
    return reply.results;
  };

  const clearSearch = () => {
    mangaSearch = "";
    searchTrigger = false;
    mangaSearchResults.set([]);
  };

  onMount(() => currentPath.set("manga"));
  onMount(setMangaStore);

  const handleAddManga = async (detail) => {
    const response = await addManga(detail)
    console.log(response)
    clearSearch()
  }

  $: items = $currentManga;
  let currentPage = 1;
  let pageSize = 4;
  $: paginatedItems = paginate({ items, pageSize, currentPage });
  let currentID;

  const handleGet = async (id) => {
    const MANGA_BY_ID = `
    query thisManga{
    mangaById(id: ${id}){
    title
    synopsis
    }}
    `;
    let thisManga = await tryCatchQL(mangaDB, MANGA_BY_ID);
    mangaDetail.set(thisManga.mangaById);
  };
</script>

<main>
  <h1>Manga Repository</h1>
  <Modal
    backdrop="true"
    keyboard="true"
    autoFocus
    isOpen={open}
    {toggleAddMangaModal}
  >
    <div class="modalTitle">
      <ModalHeader {toggleAddMangaModal}>
        {$mangaDetail.title}
      </ModalHeader>
      <div>
        <button class="exOut" on:click={toggleAddMangaModal}
          ><span>&#10005</span></button
        >
      </div>
    </div>
    <ModalBody>
      <p>Add "{$mangaDetail.title}" to your list?</p>
      <img
        src={$mangaDetail.image_url}
        alt={$mangaDetail.title}
        loading="lazy"
      />
      <div class="cardText">
        <p class="overflow-auto">{$mangaDetail.synopsis}</p>
      </div>
      <!-- {#if addSpinner}
        <div class="spinnerDiv">
          <Spinner color="primary" class="text-center" />
        </div>
      {/if} -->
    </ModalBody>

    <ModalFooter>
      <button
        class="confirmButton"
        on:click={() => handleAddManga($mangaDetail)}>CONFIRM</button
      >
      <button class="cancelButton" on:click={toggleAddMangaModal}>CANCEL</button
      >
    </ModalFooter>
  </Modal>

  {#if mangaLoading}
    Loading...
  {/if}
  {#await $currentManga}
    Manga is loading
  {:then manga}
    <div>
      <form on:submit|preventDefault={searchMore} action="">
        <input
          class="searchBox"
          bind:value={mangaSearch}
          type="text"
          placeholder="Search for more manga"
        />
        <button class="searchButton" on:click={searchMore}>SEARCH</button>
        {#if mangaSearch}
          <button class="clear" on:click={clearSearch}>CLEAR</button>
        {/if}
      </form>
    </div>
  {/await}

  {#if searchTrigger}
    {#await $mangaSearchResults}
      <div class="spinnerDiv">
        <Spinner color="primary" />
        <p>Loading...</p>
      </div>
    {:then mangaResult}
      <div class="searchGrid">
        {#each mangaResult as result}
          <div transition:fade class="displaySearch">
            <Card
              style="height: 100%;"
              on:click={() => toggleAddMangaModal(result.mal_id)}
              body
            >
              {result.title}
              <img
                src={result.image_url}
                alt={result.title}
                loading="lazy"
              /></Card
            >
          </div>
        {/each}
      </div>
    {/await}
  {/if}

  <div class="mangaGrid">
    {#each paginatedItems as item, index (item.id)}
      <div class="mangaCard">
        <!-- {item.title} by {item.author.name} -->
        <Card class="mb-3">
          <CardHeader>
            <CardTitle><h4>{item.title}</h4></CardTitle>
          </CardHeader>
          <CardBody>
            <div class="mangaImageContainer">
              <div class="imageDiv">
                <img
                  class="mangaImage"
                  src={item.image_url}
                  alt="{item.title} Cover"
                  loading="lazy"
                />
              </div>
            </div>
            <div class="japanTitle">
              <CardSubtitle>Japanese title: {item.title_japanese}</CardSubtitle>
            </div>

            <CardText>
              Author: {item.author}
              <Button color="primary" id="toggler{index}" class="mb-3"
                >Synopsis</Button
              >
              <UncontrolledCollapse toggler="#toggler{index}">
                <div class="synopsis">
                  {item.synopsis}
                </div>
              </UncontrolledCollapse>
            </CardText>
          </CardBody>
          <div>
            <CardFooter>
              <div class="footerItems">
                <div>
                  Volumes: {item.volumes === null ? "Not set" : item.volumes}
                </div>
                <div>
                  Status: {item.ongoing === false ? "Complete" : "Ongoing"}
                </div>
              </div>
            </CardFooter>
          </div>
        </Card>
      </div>
    {/each}
  </div>
  <LightPaginationNav
    totalItems={items.length}
    {pageSize}
    {currentPage}
    limit={2}
    showStepOptions={true}
    on:setPage={(e) => {
      currentPage = e.detail.page;
    }}
  />
</main>

<style>
  h1 {
    color: #0004ff;
    text-align: left;
    text-transform: uppercase;
    font-size: 4rem;
    font-weight: 100;
    margin-bottom: 0;
  }
  .mangaImage {
    width: 100%;
    max-width: 225px;
  }
  .mangaGrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .mangaImageContainer {
    position: relative;
    height: 360px;
    overflow: hidden;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .imageDiv img {
    width: 100%;
    /* position: absolute; */
    /* top: 0;
    left: 0;
    display: block; */
    margin-bottom: 1rem;
    width: 100%;
    height: auto;
  }
  .japanTitle {
    padding: 1rem;
  }
  .synopsis {
    text-align: left;
  }

  .footerItems {
    display: flex;
    justify-content: space-between;
  }

  .displaySearch img {
    width: 100%;
    max-width: 225px;
    align-self: middle;
    margin: 0 auto;
  }

  @media screen and (max-width: 900px) {
    .mangaGrid {
      grid-template-columns: 1fr;
      max-width: 500px;
    }
  }
</style>
