<script>
  import { onMount } from "svelte";
  import {
    currentPath,
    currentManga,
    mangaDetail,
    mangaSearchResults,
  } from "./stores";
  import { ALL_MANGA, addManga, editManga, ongoing, finished, filtered } from "./graphql/queries";
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
    CustomInput,
    Badge,
    Label,
    Input,
    Alert,
    //FormText,
  } from "sveltestrap";
  import { getGenres, returnDateFrom } from "./utilities";

  import * as yup from "yup";
  import { Form, Message, isInvalid } from "svelte-yup";
  const mangaDB = "https://manga-graphql3.herokuapp.com/";
  //const mangaDB = "http://localhost:4000/";

  //Form validation
  let schema = yup.object().shape({
    title: yup.string().required().max(70).label("Title"),
    image_url: yup.string().required().url().label("Image URL"),
    synopsis: yup.string().label("Synopsis"),
    ongoing: yup.boolean().label("Ongoing"),
    favorite: yup.boolean().label("Favorite"),
  });
  let isValid;
  $: fields = {
    title: $mangaDetail.title,
    image_url: $mangaDetail.image_url,
    synopsis: $mangaDetail.synopsis,
    volumes: $mangaDetail.volumes,
    chapters: $mangaDetail.chapters,
    ongoing: $mangaDetail.ongoing,
    favorite: $mangaDetail.favorite,
  };
  let submitted = false;
  $: invalid = (name) => {
    if (submitted) {
      return isInvalid(schema, name, $mangaDetail);
    }
    return false;
  };

  //Inital settings for variables
  $: console.log("Details of selected manga: ", $mangaDetail);
  let mangaLoading = false;
  let searchTrigger = false;
  let open = false;
  let open2 = false;
  let openEdit = false;
  //alert settings
  let alertMessage = "";
  let alertColor = "danger";
  let alertVisable = false;

  const setMangaStore = async () => {
    if ($currentManga.length === 0) {
      mangaLoading = true;
      loadingSpinner = true;
      let mangaSets = await tryCatchQL(mangaDB, ALL_MANGA);
      currentManga.set(mangaSets.allManga);
      console.log("Current manga sets now: ", $currentManga);
      mangaLoading = false;
      loadingSpinner = false;
    }
  };

  const resetAfterEdits = async () => {
    mangaLoading = true;
    loadingSpinner = true;
    let mangaSets = await tryCatchQL(mangaDB, ALL_MANGA);
    currentManga.set(mangaSets.allManga);
    console.log("Current manga sets now after edits: ", $currentManga);
    mangaLoading = false;
    loadingSpinner = false;
    currentPage = 1;
    y=0
  };
  let addSpinner = false;
  let editSpinner = false;
  let searchSpinner = false;
  let loadingSpinner = false;
  let filter = "all";
  let filterArray = ["All", "Ongoing", "Finished", "Favorites"]
  $: console.log(filter)

  const getMangaDetail = async (id) => {
    const detail = await tryCatch(`https://api.jikan.moe/v3/manga/`, id);
    mangaDetail.set(detail);
    handleGenres();
    //console.log("Details of selected anime:", $animeDetail);
  };

  $: console.log("Ongoing for this manga is: ", $mangaDetail.ongoing);

  //Togglers
  const toggleAddMangaModal = async (id) => {
    console.log("ID showing as", id);
    console.log(typeof id);
    if (!id || typeof id === "object") {
      open = !open;
    } else {
      getMangaDetail(id).then((open = !open));
    }
  };

  const toggleEditModal = async (id) => {
    console.log("ID to edit showing as", id);
    console.log(typeof id);
    if (!id || typeof id === "object" || id === undefined) {
      openEdit = !openEdit;
    } else {
      handleGetByID(id).then((openEdit = !openEdit));
    }
  };

  function toggleDeleteModal(id = "") {
    if (typeof id === "string") {
      open2 = !open2;
    } else {
      console.log("Delete item is a number, getting info...");
      handleGetByID(id).then((open2 = !open2));
    }
  }

  let mangaSearch;

  //Search more anime
  const searchMore = async () => {
    searchSpinner = true;
    searchTrigger = true;
    const reply = await tryCatch(
      `https://api.jikan.moe/v3/search/manga?q=${mangaSearch}&limit=10`
    );
    mangaSearchResults.set(reply.results);
    searchSpinner = false;
    return reply.results;
  };

  const clearSearch = () => {
    mangaSearch = "";
    searchTrigger = false;
    mangaSearchResults.set([]);
  };

  onMount(() => currentPath.set("manga"));
  onMount(setMangaStore);

  //Pagination setup
  $: items = $currentManga;
  let currentPage = 1;
  let pageSize = 2;
  $: paginatedItems = paginate({ items, pageSize, currentPage });
  let currentID;

  //Get/POST handlers
  //

  const handleAddManga = async (detail) => {
    const response = await addManga(detail);
    toggleAddMangaModal();
    clearSearch();
    resetAfterEdits();
    items = $currentManga;
    currentPage = 1;
    alertVisable = true;
    alertMessage = `manga "${detail.title}" added to your list.`;
    alertColor = "info";
    addSpinner = false;
    y=0
    setTimeout(() => {
        alertVisable = false;
        alertMessage = "";
      }, 3000);
  };

  const handleGetByID = async (id) => {
    const MANGA_BY_ID = `
    query thisManga{
    mangaById(id: ${id}){
    title
    author
    id
    ongoing
    image_url
    chapters
    volumes
    synopsis
    publishedFrom
    favorite
    genres
    }}
    `;
    let thisManga = await tryCatchQL(mangaDB, MANGA_BY_ID);
    mangaDetail.set(thisManga.mangaById);
  };
  $: fields = {
    title: $mangaDetail.title,
    image_url: $mangaDetail.image_url,
    chapters: $mangaDetail.chapters,
    volumes: $mangaDetail.volumes,
    image_url: $mangaDetail.image_url,
  };

  const handleDelete = async (id) => {
    console.log("Item to delete is: ", id);
    const DELETE_MANGA = `
    mutation deleteThisBook{
    deleteManga(id: ${id}){
    id
    title
    }}
    `;
    let deleteThis = await tryCatchQL(mangaDB, DELETE_MANGA);
    toggleDeleteModal();
    resetAfterEdits();
    y=0
    items = $currentManga;
      alertVisable = true;
      alertMessage = `Manga ${deleteThis.deleteManga.title} has been deleted from the list.`;
      alertColor = "info";
      setTimeout(() => {
        alertVisable = false;
        alertMessage = "";
      }, 3000);
  };

  let currentGenres = [];
  let publishStartDate;
  const handleGenres = () => {
    let theseGenres = getGenres($mangaDetail.genres);
    let thisDate = returnDateFrom($mangaDetail.published);
    console.log("Start date:", publishStartDate);
    console.log("The Genres are: ", theseGenres);
    currentGenres = theseGenres.join(", ");
    publishStartDate = `${thisDate}`.slice(0, 15);
  };

  const handleEditTheManga = async (detail) => { 
    editSpinner = true;
    submitted = true;
    console.log("Fields show as:", fields);
    isValid = schema.isValidSync(fields);
    if (isValid) {
      console.log("Manga form validated.");
      let response = await editManga(detail);
      console.log("Response from edit manga: ", response.updateManga);
      if (response.updateManga.id) {
        editSpinner = false;
        toggleEditModal();
        resetAfterEdits();
        items = $currentManga;
        currentPage = 1;
        alertVisable = true;
        alertMessage = `Manga ${response.updateManga.title} has been successfully edited.`;
        alertColor = "info";
        y=0
        setTimeout(() => {
        alertVisable = false;
        alertMessage = "";
      }, 3000);
      } else {
        editSpinner = false;
        toggleEditModal();
        alert(`Reply was: ${response.updateManga.title}`);
      }
    } else{
      console.log("Not validated, something amiss!")
    }

  };

  const handleStatusFetch = async () => {
    console.log("handleStatus called.")
    if(filter === "Ongoing") {
      console.log("Ongoing filter called.")
      mangaLoading = true;
      loadingSpinner = true;
      let ongoingManga = await filtered("ongoing")
      currentManga.set(ongoingManga.ongoing)
      currentPage = 1;
      mangaLoading = false;
      loadingSpinner = false;
    }
    else if(filter === "Finished") {
      console.log("Finished filter called.")
      mangaLoading = true;
      loadingSpinner = true;
      let finishedManga = await filtered("finished")
      currentManga.set(finishedManga.finished)
      currentPage = 1;
      mangaLoading = false;
      loadingSpinner = false; 
    }
    else if(filter === "Favorites") {
      console.log("Finished filter called.")
      mangaLoading = true;
      loadingSpinner = true;
      let favoriteManga = await filtered("favorite")
      currentManga.set(favoriteManga.favorite)
      currentPage = 1;
      mangaLoading = false;
      loadingSpinner = false;
    } else{
      mangaLoading = true;
      loadingSpinner = true;
      let mangaSets = await tryCatchQL(mangaDB, ALL_MANGA);
      currentManga.set(mangaSets.allManga);
      currentPage = 1;
      mangaLoading = false;
      loadingSpinner = false;
    }
      
  }
  let y;
</script>

<svelte:window bind:scrollY={y}/>

<main>
  <h1>Manga Repository</h1>
    <!-- alert here -->
    <Alert
    color={alertColor}
    isOpen={alertVisable}
    toggle={() => (alertVisable = false)}
  >
    {alertMessage}
  </Alert>

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
      <button
        class="cancelButton"
        on:click={() => handleDelete($mangaDetail.id)}>CONFIRM</button
      >
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
          <p>
            <strong>Status</strong> : {$mangaDetail.publishing === false
              ? "Complete"
              : "Ongoing"}
          </p>
          <p>
            <strong>Chapters</strong>: {$mangaDetail.chapters === null
              ? "Not in database."
              : $mangaDetail.chapters}
          </p>
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

  <!-- edit manga modal -->
  <Modal
    backdrop="true"
    keyboard="true"
    autoFocus
    isOpen={openEdit}
    {toggleEditModal}
  >
    <Form {fields} {schema} {submitted}>
      <div class="modalTitle">
        <ModalHeader toggle={toggleEditModal}>
          <div class="flexThis">
            <div class="labelDiv">
              <label for="title">Edit</label>
            </div>

            <div class="editTitle">
              <input plaintext name="title" bind:value={$mangaDetail.title} />
            </div>
          </div>
          <div class="messageDiv">
            <Message name="title" />
          </div>
        </ModalHeader>
      </div>
      <ModalBody>
        <div class="flexAround">
          <div class="flexedItemLarge">
            <img
              src={$mangaDetail.image_url}
              alt={$mangaDetail.title}
              loading="lazy"
            />
          </div>

          <div class="flexedItemLarge">
            <Label>Image URL<Input bind:value={$mangaDetail.image_url} /></Label
            >
            <div class="messageDiv">
              <Message name="image_url" />
            </div>
            <CustomInput
              type="switch"
              id="ongoingSwitch"
              name="ongoing"
              label="Ongoing"
              bind:checked={$mangaDetail.ongoing}
            />
            <CustomInput
              type="switch"
              id="favoriteSwitch"
              name="favorite"
              label="Favorite"
              bind:checked={$mangaDetail.favorite}
            />

            <div class="flexedItem">
              <label for="chapters">Chapters:</label>
              <input
                type="number"
                name="chapters"
                bind:value={$mangaDetail.chapters}
                placeholder = 0
              />
            </div>
            <div class="flexedItem">
              <label for="chapters">Volumes:</label>
              <input
                type="number"
                name="volumes"
                placeholder = 0
                bind:value={$mangaDetail.volumes}
              />
            </div>
          </div>
        </div>

        <div class="cardText">
          <Input
            type="textarea"
            class="overflow-auto"
            bind:value={$mangaDetail.synopsis}
          />
          <div class="messageDiv">
            <Message name="synopsis" />
          </div>
        </div>

        {#if editSpinner}
          <div class="spinnerDiv">
            <Spinner color="primary" class="text-center" />
          </div>
        {/if}
      </ModalBody>

      <ModalFooter>
        <button
          class="confirmButton"
          on:click={() => handleEditTheManga($mangaDetail)}>CONFIRM</button
        >
        <button class="cancelButton" on:click={toggleEditModal}>CANCEL</button>
      </ModalFooter>
    </Form>
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
  <div class="mangaFilter">

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
    <div >
      <form  on:change|preventDefault={handleStatusFetch}>
        <Label for="exampleCustomSelect">Filters</Label>
        <select bind:value={filter} type="select" id="exampleCustomSelect" name="customSelect">
          {#each filterArray as filter}
          <option value={filter}>{filter}</option>
          {/each}
        </select>
      </form>
    </div>
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
            <div class="favoriteMark">
              <Badge color="primary"
                >{item.favorite === true ? "Favorite" : ""}</Badge
              >
            </div>
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
                <Button color="primary" id="toggler{index}">Synopsis</Button>
                <Button
                  class="deleteButton"
                  on:click={() => toggleDeleteModal(parseInt(item.id))}
                  >DELETE</Button
                >

                <Button
                  class="deleteButton"
                  on:click={() => toggleEditModal(parseInt(item.id))}
                  >EDIT</Button
                >
              </div>

              <UncontrolledCollapse toggler="#toggler{index}">
                <div class="synopsis overflow-auto">
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
  .buttons {
    display: flex;
    justify-content: space-around;
    padding: 0.25rem;
  }

  .displaySearch img {
    width: 100%;
    max-width: 225px;
    align-self: middle;
    margin: 0 auto;
  }
  /* .searchDiv {
    padding: 1rem;
  } */
  .spinnerDiv {
    padding: 0.75rem;
  }
  .searchGrid {
    display: flex;
    flex-wrap: wrap;
  }
  .searchGrid div {
    padding: 0.4rem;
    cursor: pointer;
  }

  .overflow-auto {
    max-height: 8rem;
    margin-top: 0.25rem;
    text-align: left;
  }

  .mangaCard div:hover {
    border-radius: 2%;
  }
  .paginationDiv {
    padding: 0.4rem;
  }
  .flexThis {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    padding: 0.3rem;
  }
  .flexedItem {
    padding: 0.25rem;
  }
  .flexedItem input {
    max-width: 30%;
  }
  .flexedItemLarge {
    max-width: 45%;
    padding: 0.25rem;
    text-align: left;
    align-items: flex-start;
  }
  .flexedItemLarge img {
    max-width: 100%;
  }
  .labelDiv label {
    margin-bottom: 0;
  }
  /* .editTitle {
    padding-left: 1rem;
  } */
  .editTitle input {
    font-size: 1.5rem;
    max-width: 90%;
    border: none;
  }

  .flexAround {
    display: flex;
    align-items: flex-start;
    justify-content: space-evenly;
    padding: 0.3rem;
  }

  .addMangaInfo {
    padding: 0.25rem;
  }
  .addMangaInfo p {
    font-size: smaller;
    margin-bottom: 0.25rem;
  }
  .favoriteMark {
    text-align: right;
  }
  .mangaFilter{
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }
  @media screen and (max-width: 900px) {
    .mangaGrid {
      grid-template-columns: 1fr;
      max-width: 500px;
    }
  }
</style>
