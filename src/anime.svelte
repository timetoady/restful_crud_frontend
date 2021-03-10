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
    Alert,
  } from "sveltestrap";
  let currentSearch;
  let searchTrigger = false;
  let alertMessage = "";
  let alertColor = "danger";
  let alertVisable = false;
  let open = false;
  let open2 = false;
  let open3 = false;
  let open4 = false;
  let open5 = false;
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
    console.log("Details of selected anime:", $animeDetail);
  };
  const getAnimeByID = async (id) => {
    console.log(id);
    const theAnime = await tryCatch(
      "https://lit-mountain-37161.herokuapp.com/anime/",
      id
    );
    animeDetail.set(theAnime);
  };
  const toggleAddAnimeModal = async (id = "") => {
    if (!id) {
      open = !open;
    } else {
      getAnimeDetail(id).then((open = !open));
    }
  };
  const handleApiSend = async (URL, upload) => {
    await sendAPIData(URL, upload);
    searchTrigger = false;
    toggleAddAnimeModal();
    setCurrent();
  };
  //Delete from set handler
  const handleDelete = async (id) => {
    console.log("Attempting delete");
    let response = await tryCatch(
      "https://lit-mountain-37161.herokuapp.com/anime/delete/",
      id,
      "DELETE"
    );
    console.log("Delete Response:")
    console.log(response);
    console.log(response.status);
    if (response.status === 200) {
      alertVisable = true;
      alertMessage = response.message;
      alertColor = "info";
      toggleOptionModal();
      toggleDeleteModal();
      setCurrent();
      setTimeout(() => {
        alertVisable = false;
        alertMessage = ""
      }, 3000);

    } else {
      toggleOptionModal();
      toggleDeleteModal();
      alertVisable = true;
      alertColor = "danger";
      alertMessage = response.error;
    }
  };

  const handleEdit = async () => {};

  async function toggleOptionModal(id = "") {
    console.log("Toggle option modal");
    console.log(id);
    if (typeof id !== "string") {
      open2 = !open2;
    } else {
      getAnimeByID(id).then((open2 = !open2));
    }
  }

  async function toggleDeleteModal(id) {
    // if (!id) {
    //   open5 = !open5;
    // } else {
    //   getAnimeByID(id).then((open5 = !open5));
    // }

    open5 = !open5;
  }

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
    color="info"
    isOpen={alertVisable}
    toggle={() => (alertVisable = false)}
  >
    {alertMessage}
  </Alert>
  <!-- add to list modal here -->
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
    </ModalBody>

    <ModalFooter>
      <button
        on:click={() =>
          handleApiSend(
            "https://lit-mountain-37161.herokuapp.com/anime/",
            $animeDetail
          )}>CONFIRM</button
      >
      <button on:click={toggleAddAnimeModal}>QUIT</button>
    </ModalFooter>
  </Modal>
  <h2>Here be the anime!</h2>
  {#await $currentAnime}
    <p>Loading that sweet, sweet anime...</p>
    <Spinner color="primary" />
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
          <Card style="height: 700px;">
            <CardHeader>
              <CardTitle>{animeInfo.title}</CardTitle>
            </CardHeader>
            <CardBody>
              <CardSubtitle>Score: {animeInfo.score}</CardSubtitle>
              <img
                class="animeImage"
                src={animeInfo.image_url}
                alt="{animeInfo.title} Cover"
              />
              <div class="overflow-auto">
                <CardText>
                  <p class="cardText">{animeInfo.synopsis}</p>
                </CardText>
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
      <p class="overflow-auto">{$animeDetail.synopsis}</p>
    </ModalBody>

    <ModalFooter>
      <button
        on:click={() =>
          handleEdit(
            "https://lit-mountain-37161.herokuapp.com/anime/",
            $animeDetail
          )}>EDIT</button
      >
      <button on:click={toggleDeleteModal}>DELETE</button>
      <button on:click={toggleOptionModal}>CANCEL</button>
    </ModalFooter>
  </Modal>
  <!-- edit modal here, will have all fields turned into inputs, can click save or cancel -->

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
      <h2>
        Are you sure you want to remove {$animeDetail.title} from your list?
      </h2>
    </ModalBody>

    <ModalFooter>
      <button on:click={() => handleDelete($animeDetail._id)}>CONFIRM</button>
      <button on:click={toggleDeleteModal}>CANCEL</button>
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
    font-weight: 200;
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
