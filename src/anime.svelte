<script>
  import { onMount } from "svelte";
  import tryCatch, { sendAPIData, editAPIData } from "./api";
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
    Alert,
  } from "sveltestrap";
  let currentSearch;
  let searchTrigger = false;
  let alertMessage = "";
  let alertColor = "danger";
  let alertVisable = false;
  let open = false;
  let open2 = false;
  let open4 = false;
  let open5 = false;
  let initialSpinner = false;
  let searchSpinner = false;
  let addSpinner = false;
  let editSpinner = false;
  let deleteSpinner = false;

  //Getters and setters
  const setCurrent = async () => {
    initialSpinner = true;
    let animeSets = await tryCatch(
      "https://lit-mountain-37161.herokuapp.com/anime"
    );
    currentAnime.set(animeSets);
    initialSpinner = false;
  };
  const searchMore = async () => {
    searchTrigger = true;
    searchSpinner = true;
    const reply = await tryCatch(
      `https://api.jikan.moe/v3/search/anime?q=${currentSearch}&limit=10`
    );
    searchResults.set(reply.results);
    searchSpinner = false;
    // console.log("Search results:", $searchResults);
    return reply.results;
  };
  const getAnimeDetail = async (id) => {
    const detail = await tryCatch(`https://api.jikan.moe/v3/anime/`, id);
    animeDetail.set(detail);
    //console.log("Details of selected anime:", $animeDetail);
  };
  const getAnimeByID = async (id) => {
    //console.log(id);
    const theAnime = await tryCatch(
      "https://lit-mountain-37161.herokuapp.com/anime/",
      id
    );
    animeDetail.set(theAnime);
  };

  const handleApiSend = async (URL, upload) => {
    addSpinner = true;
    const response = await sendAPIData(URL, upload);
    if (response._id) {
      alertVisable = true;
      alertMessage = `Anime ${response.title} added to your list.`;
      alertColor = "info";
      addSpinner = false;
      setTimeout(() => {
        alertVisable = false;
        alertMessage = "";
      }, 3000);
    } else {
      alertVisable = true;
      alertColor = "danger";
      alertMessage = response.Message;
    }
    searchTrigger = false;
    toggleAddAnimeModal();
    searchResults.set([]);
    setCurrent();
  };

  //Toggles
  const toggleAddAnimeModal = async (id = "") => {
    if (!id) {
      open = !open;
    } else {
      getAnimeDetail(id).then((open = !open));
    }
  };
  const toggleEditModal = () => {
    open4 = !open4;
  };

  function toggleDeleteModal() {
    open5 = !open5;
  }

  function toggleOptionModal(id = "") {
    if (typeof id !== "string") {
      open2 = !open2;
    } else {
      getAnimeByID(id).then((open2 = !open2));
    }
  }

  //Handlers
  const handleDelete = async (id) => {
    //console.log("Attempting delete");
    deleteSpinner = true;
    let response = await tryCatch(
      "https://lit-mountain-37161.herokuapp.com/anime/delete/",
      id,
      "DELETE"
    );
    // console.log("Delete Response:");
    //console.log(response);
    //console.log(response.status);
    if (response.status === 200) {
      deleteSpinner = false;
      alertVisable = true;
      alertMessage = response.message;
      alertColor = "info";
      toggleOptionModal();
      toggleDeleteModal();
      setCurrent();
      setTimeout(() => {
        alertVisable = false;
        alertMessage = "";
      }, 3000);
    } else {
      toggleOptionModal();
      toggleDeleteModal();
      alertVisable = true;
      alertColor = "danger";
      alertMessage = response.error;
    }
  };

  const handleEdit = async (id) => {
    //let upload = buildJsonFormData(form);
    //console.log("Editing details for:", $animeDetail.title, $animeDetail._id);
    editSpinner = true;
    try {
      let response = await editAPIData(
        `https://lit-mountain-37161.herokuapp.com/anime/edit/${id}`,
        JSON.stringify($animeDetail)
      );
      //console.log("Response status", response.status);
      if (response.status === 200) {
        editSpinner = false;
        alertVisable = true;
        alertMessage = `Successfully edited anime ${$animeDetail.title}.`;
        alertColor = "info";
        toggleOptionModal();
        toggleEditModal();
        setCurrent();
        setTimeout(() => {
          alertVisable = false;
          alertMessage = "";
        }, 3000);
      } else {
        toggleOptionModal();
        toggleEditModal();
        alertVisable = true;
        alertColor = "danger";
        alertMessage = response.error;
      }
    } catch (error) {
      console.error(error);
    }
  };

  onMount(setCurrent);
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
  />
</svelte:head>

<div>
  <!-- alert here -->
  <Alert
    color={alertColor}
    isOpen={alertVisable}
    toggle={() => (alertVisable = false)}
  >
    {alertMessage}
  </Alert>
  <!-- add to list/ search modal here -->
  <Modal
    backdrop="true"
    keyboard="true"
    autoFocus
    isOpen={open}
    {toggleAddAnimeModal}
  >
    <ModalHeader {toggleAddAnimeModal}>
      {$animeDetail.title}
    </ModalHeader>
    <ModalBody>
      <p>Add "{$animeDetail.title}" to your list?</p>
      <img src={$animeDetail.image_url} alt={$animeDetail.title} />
      <div class="cardText">
        <p class="overflow-auto">{$animeDetail.synopsis}</p>
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
        on:click={() =>
          handleApiSend(
            "https://lit-mountain-37161.herokuapp.com/anime/",
            $animeDetail
          )}>CONFIRM</button
      >
      <button class="cancelButton" on:click={toggleAddAnimeModal}>CANCEL</button>
    </ModalFooter>
  </Modal>
  {#if initialSpinner}
  <div class="spinnerDiv">
    <p>
      Loading that sweet, sweet anime... This may take longer on first try while the database wakes up.
    </p>
    <Spinner color="primary" class="text-center" />
  </div>
{/if}
  {#await $currentAnime}
  Working on it...
    <div />
  {:then anime}
    <form on:submit|preventDefault={searchMore} action="">
      <input class="searchBox"
        bind:value={currentSearch}
        type="text"
        placeholder="Search anime..."
      />
      <button class="searchButton" on:click={searchMore}>SEARCH</button>
      {#if searchSpinner}
        <div class="spinnerDiv">
          <Spinner color="primary" class="text-center" />
        </div>
      {/if}
    </form>
    {#if searchTrigger}
      {#await $searchResults}
        <div class="spinnerDiv">
          <Spinner color="primary" />
          <p>Loading...</p>
        </div>
      {:then animeResult}
        <div class="searchGrid">
          {#each animeResult as result}
            <div transition:fade class="displaySearch">
              <Card
                style="height: 100%;"
                on:click={() => toggleAddAnimeModal(result.mal_id)}
                body
              >
                {result.title} <img src={result.image_url} alt="" /></Card
              >
            </div>
          {/each}
        </div>
      {/await}
    {/if}
    <!-- main grid of current anime-->
    <div class="aGrid">
      {#each anime as animeInfo, index (animeInfo._id)}
        <div
          class="aCard"
          value={animeInfo._id}
          on:click={() => toggleOptionModal(animeInfo._id)}
        >
          <Card style="height: 570px;">
            <CardHeader>
              <CardTitle>{animeInfo.title}</CardTitle>
            </CardHeader>
            <CardBody>
              <CardSubtitle>Score: {animeInfo.score}</CardSubtitle>
              <div class="imageDiv">
                <img
                  class="animeImage"
                  src={animeInfo.image_url}
                  alt="{animeInfo.title} Cover"
                />
              </div>

              <div class="overflow-auto">
                <CardText />
              </div>
            </CardBody>
            <CardFooter
              >Type: {animeInfo.type} | Episodes: {animeInfo.episodes}</CardFooter
            >
          </Card>
        </div>
      {/each}
    </div>
  {/await}
  <!-- option modal here -->
  <Modal
    backdrop="true"
    keyboard="true"
    autoFocus
    isOpen={open2}
    {toggleOptionModal}
  >
    <ModalHeader {toggleOptionModal}>
      {$animeDetail.title}
    </ModalHeader>
    <ModalBody>
      <img
        class="animeImage"
        src={$animeDetail.image_url}
        alt="{$animeDetail.title} Cover"
      />
      <div class="cardText">
        <p class="overflow-auto">{$animeDetail.synopsis}</p>
      </div>
    </ModalBody>

    <ModalFooter>
      <button class="editButton" on:click={toggleEditModal}>EDIT</button>
      <button class="deleteButton" on:click={toggleDeleteModal}>DELETE</button>
      <button class="cancelButton" on:click={toggleOptionModal}>CANCEL</button>
    </ModalFooter>
  </Modal>
  <!-- edit modal here, will have all fields turned into inputs, can click save or cancel -->

  <Modal
    backdrop="true"
    keyboard="true"
    autoFocus
    isOpen={open4}
    {toggleEditModal}
  >
    <ModalHeader {toggleEditModal}>
      Edit "{$animeDetail.title}"
    </ModalHeader>
    <ModalBody>
      <form class="editForm" action="">
        <div class="editInputs">
          <label for="title">Title: </label>
          <input type="text" name="title" bind:value={$animeDetail.title} />
        </div>

        <div class="editInputs">
          <label for="image_url">Image URL:</label>
          <input
            type="text"
            name="image_url"
            bind:value={$animeDetail.image_url}
          />
        </div>

        <div class="editInputs">
          <label for="type">Type:</label>
          <input type="text" name="type" bind:value={$animeDetail.type} />
        </div>

        <div class="editInputs">
          <label for="episodes">Episodes</label>
          <input
            type="number"
            name="episodes"
            bind:value={$animeDetail.episodes}
          />
        </div>

        <div class="editInputs">
          <label for="synopsis">Synopsis:</label>
          <input
            type="text"
            name="synopsis"
            bind:value={$animeDetail.synopsis}
          />
        </div>

        <div class="editInputs">
          <label for="image_url">Score:</label>
          <input type="number" name="score" bind:value={$animeDetail.score} />
        </div>
      </form>

      {#if editSpinner}
        <div class="spinnerDiv">
          <Spinner color="primary" class="text-center" />
        </div>
      {/if}
    </ModalBody>

    <ModalFooter>
      <button
        class="confirmButton"
        on:click={() => handleEdit($animeDetail._id, $animeDetail)}
        >CONFIRM</button
      >
      <button class="cancelButton" on:click={toggleEditModal}>CANCEL</button>
    </ModalFooter>
  </Modal>

  <!-- delete modal here, asks for confirm delete, then can be closed -->
  <Modal
    backdrop="true"
    keyboard="true"
    autoFocus
    isOpen={open5}
    {toggleDeleteModal}
  >
    <ModalHeader {toggleDeleteModal}>
      Delete {$animeDetail.title}
    </ModalHeader>
    <ModalBody>
      <h3>
        Are you sure you want to remove {$animeDetail.title} from your list?
      </h3>
      {#if deleteSpinner}
        <div class="spinnerDiv">
          <Spinner color="primary" class="text-center" />
        </div>
      {/if}
    </ModalBody>

    <ModalFooter>
      <button
        class="confirmButton"
        on:click={() => handleDelete($animeDetail._id)}>CONFIRM</button
      >
      <button class="cancelButton" on:click={toggleDeleteModal}>CANCEL</button>
    </ModalFooter>
  </Modal>
</div>

<style>
  .aGrid {
    display: grid;
    gap: 20px;
    grid-template-columns: 1fr 1fr 1fr;
    margin: 1rem auto;
  }
  .aCard {
    align-items: center;
    cursor: pointer;
  }
  .searchGrid {
    display: grid;
    gap: 5px;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    margin: 1rem auto;
    cursor: pointer;
  }
  .cardText {
    text-align: left;
    font-size: smaller;
    font-weight: 500;
  }

  .imageDiv {
    margin-top: 0.5rem;
  }

  .displaySearch img {
    width: 100%;
    max-width: 225px;
    align-self: middle;
    margin: 0 auto;
  }
  .animeImage {
    width: 100%;
    max-width: 225px;
  }
  .overflow-auto {
    max-height: 6rem;
    margin-top: 0.25rem;
  }
  .spinnerDiv {
    padding: 0.25rem;
  }
  .editForm {
    text-align: left;
  }
  .editInputs {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem;
  }
  button{
    border-radius: 3px;

  }

  .cancelButton {
    border: 1px dashed red;
    color: rgb(228, 85, 85);
  }
  .confirmButton {
    color: white;
    text-shadow: 2px 1px 5px black;
    border: 1px solid black;
    background-color: rgb(127, 189, 3);
  }
  .deleteButton{
    color: red;
    font-weight: 500;
    border:1px solid rgb(228, 85, 85);
  }
  .editButton{
    color: orange;
    border: 1px solid rgb(200, 135, 14)
  }

  .searchButton{
    margin-left: -.35rem;
    z-index: 900;
    border-radius: 0 3px 3px 0px !important;
  }
  @media screen and (max-width: 800px) {
    .aGrid {
      grid-template-columns: 1fr 1fr;
    }
    .searchGrid {
      grid-template-columns: 1fr 1fr;
    }
  }
  

  @media screen and (max-width: 600px) {
    .aGrid {
      grid-template-columns: 1fr;
    }
    .searchGrid {
      grid-template-columns: 1fr;
    }
  }
</style>
