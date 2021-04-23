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
    import { getNested, getGenres, returnDateFrom } from "./utilities"
  //const mangaDB = "https://manga-graphql3.herokuapp.com/";
  const mangaDB = "http://localhost:4000/";
  $: console.log("Details of selected manga: ", $mangaDetail);
  let mangaLoading = false;
  let searchTrigger = false;
  let open = false;
  let open2 = false;

  const setMangaStore = async () => {
    if ($currentManga.length === 0) {
      mangaLoading = true;
      loadingSpinner = true;
      let mangaSets = await tryCatchQL(mangaDB, ALL_MANGA);
      currentManga.set(mangaSets.allManga);
      console.log("Curren manga sets now", $currentManga);
      mangaLoading = false;
      loadingSpinner = false;
    }
  };

  const resetAfterEdits = async () => {
    mangaLoading = true;
      loadingSpinner = true;
      let mangaSets = await tryCatchQL(mangaDB, ALL_MANGA);
      currentManga.set(mangaSets.allManga);
      console.log("Curren manga sets now", $currentManga);
      mangaLoading = false;
      loadingSpinner = false;
      currentPage = 1
  }
  let addSpinner = false;
  let searchSpinner = false;
  let loadingSpinner = false;



  const getMangaDetail = async (id) => {
    const detail = await tryCatch(`https://api.jikan.moe/v3/manga/`, id);
    mangaDetail.set(detail);
    handleGenres()
    //console.log("Details of selected anime:", $animeDetail);
  };

  $: console.log($mangaDetail.genres)

  const toggleAddMangaModal = async (id) => {
    console.log("ID showing as", id)
    console.log(typeof id)
    if (!id || typeof id === "object") {
      open = !open;
    } else {
      getMangaDetail(id).then((open = !open));
    }
  };

  function toggleDeleteModal(id = "") {
    if (typeof id === "string") {
      open2 = !open2;
    } else {
      console.log("Delete item is a number, getting info.")
      handleGetByID(id).then((open2 = !open2));
    }
  }
  //Next time: add, delete, get something by ID. May need some backend additional work.
  let mangaSearch;

  //Search more anime
  const searchMore = async () => {
    searchSpinner = true
    searchTrigger = true;
    const reply = await tryCatch(
      `https://api.jikan.moe/v3/search/manga?q=${mangaSearch}&limit=10`
    );
    mangaSearchResults.set(reply.results);
    searchSpinner = false
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
    toggleAddMangaModal()
    console.log(response)
    clearSearch()
    resetAfterEdits()
    items = $currentManga
    currentPage = 1
  }

  $: items = $currentManga;
  let currentPage = 1;
  let pageSize = 2;
  $: paginatedItems = paginate({ items, pageSize, currentPage });
  let currentID;

  const handleGetByID = async (id) => {
    const MANGA_BY_ID = `
    query thisManga{
    mangaById(id: ${id}){
    title
    id
    image_url
    }}
    `;
    let thisManga = await tryCatchQL(mangaDB, MANGA_BY_ID);
    mangaDetail.set(thisManga.mangaById);
  };

  const handleDelete = async (id) => {
    console.log("Item to delete is: ",id)
    const DELETE_MANGA = `
    mutation deleteThisBook{
    deleteManga(id: ${id}){
    id
    title
    }}
    `;
    let deleteThis = await tryCatchQL(mangaDB, DELETE_MANGA);
    alert(`Deleted ${deleteThis.deleteManga.title}`)
    toggleDeleteModal()
    resetAfterEdits()
    items = $currentManga;
  }

  let currentGenres = []
  let publishStartDate;
  const handleGenres =  () => {
    let theseGenres =  getGenres($mangaDetail.genres)
    let thisDate = returnDateFrom($mangaDetail.published)
    console.log("Start date:", publishStartDate)
    console.log("The Genres are: ", theseGenres)
    currentGenres = theseGenres.join(", ")
    publishStartDate = `${thisDate}`.slice(0,15)
  }
</script>

<main>
  <h1>Manga Repository</h1>
<!-- delete modal here -->
<Modal
backdrop="true"
keyboard="true"
autoFocus
isOpen={open2}
toggle={toggleDeleteModal}
>
<div class="modalTitle">
  <ModalHeader toggle={toggleDeleteModal}>
    {$mangaDetail.title}
  </ModalHeader>
</div>
<ModalBody>
  <img
    class="animeImage"
    src={$mangaDetail.image_url}
    alt="{$mangaDetail.title} Cover"
    loading="lazy"
  />
  <div class="cardText">
    <h5 class="overflow-auto">Are you sure you want to delete this?</h5>
  </div>
</ModalBody>

<ModalFooter>
  <!-- <button class="editButton" on:click={toggleEditModal}>EDIT</button> -->
  <button class="cancelButton" on:click={() => handleDelete($mangaDetail.id)}>CONFIRM</button>
  <button class="cancelButton" on:click={toggleDeleteModal}>CANCEL</button>
</ModalFooter>
</Modal>


  <!-- add new manga modal -->
  <Modal
    backdrop="true"
    keyboard="true"
    autoFocus
    isOpen={open}
    {toggleAddMangaModal}
  >
    <div class="modalTitle">
      <ModalHeader toggle={toggleAddMangaModal}>
        {$mangaDetail.title}
      </ModalHeader>

    </div>
    <ModalBody>
      <p>Add "{$mangaDetail.title}" to your list??</p>
      <img
        src={$mangaDetail.image_url}
        alt={$mangaDetail.title}
        loading="lazy"
      />
      <div class="overflow-auto addMangaInfo">
        <div>
          
          <p><strong>Genres:</strong> {currentGenres}</p>
        </div>
        <div class="flexThis">
          <p> <strong>Status</strong> : {$mangaDetail.publishing === false ? "Complete" : "Ongoing"}</p>
          <p><strong>Chapters</strong>: {$mangaDetail.chapters === null ? "Not in database." : $mangaDetail.chapters}</p>
        </div>
        <div class="flexThis">
          <p><strong>Popularity</strong>: {$mangaDetail.popularity}</p>
          <p><strong>Start date</strong>: {publishStartDate}</p>
        </div>
        <div class="cardText">
          <p>{$mangaDetail.synopsis}</p>
        </div>
      </div>
      

      {#if addSpinner}
        <div class="spinnerDiv">
          <Spinner color="primary" class="text-center" />
        </div>
      {/if}
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


  <!-- Search zone -->
  {#if mangaLoading}
    Loading...
    <div class="spinnerDiv">
      <Spinner color="primary" class="text-center" />
    </div>
  {/if}
  {#await $currentManga}
    Manga is loading
  {:then manga}
    <div class="searchDiv">
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
  {#if searchSpinner}
  <div class="spinnerDiv">
    <Spinner color="primary" class="text-center" />
  </div>
{/if}
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
  <div class="paginationDiv">
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
  </div>

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
              <div>
                 Author: {item.author}
              </div>
              <div>
                Genres: {item.genres}
             </div>
             <div class="buttons">
              <Button color="primary" id="toggler{index}"
              >Synopsis</Button
            >
            <Button class="deleteButton" on:click={() => toggleDeleteModal(parseInt(item.id))}>DELETE</Button>
             </div>
             
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
  .buttons{
    display: flex;
    justify-content: space-around;
    padding: .25rem;
  }

  .displaySearch img {
    width: 100%;
    max-width: 225px;
    align-self: middle;
    margin: 0 auto;
  }
  .searchDiv {
    padding: 1rem;
  }
  .spinnerDiv{
    padding: .75rem;
  }
  .searchGrid{
    display: flex;
    flex-wrap: wrap;

  }
  .searchGrid div{
    padding: .4rem;
    cursor: pointer;
  }

  .overflow-auto {
    max-height: 8rem;
    margin-top: 0.25rem;
    text-align: left;
  }


  .mangaCard div:hover{
    border-radius: 20%;
  }
.paginationDiv{
  padding: .4rem;
}
.flexThis{
  display: flex;
  justify-content: space-between;
}
.addMangaInfo{
  padding: .25rem;
}
.addMangaInfo p{
  font-size: smaller;
  margin-bottom: .25rem; 
  
}
  @media screen and (max-width: 900px) {
    .mangaGrid {
      grid-template-columns: 1fr;
      max-width: 500px;
    }
  }
</style>
