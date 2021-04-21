<script>
  import { onMount } from "svelte";
  import { currentPath, currentManga, mangaDetail } from "./stores";
  import { ALL_MANGA } from "./graphql/queries";
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
  } from "sveltestrap";
  const mangaDB = "https://manga-graphql2.herokuapp.com/";
  $: console.log("Details manga: ", $mangaDetail);
  let mangaLoading = false;

  const setMangaStore = async () => {
     if($currentManga.length === 0) {
    mangaLoading = true;
    let mangaSets = await tryCatchQL(mangaDB, ALL_MANGA);
    currentManga.set(mangaSets.allManga);
    console.log("Curren manga sets now", $currentManga);
    mangaLoading = false;
     } 

  };
  //Next time: add, delete, get something by ID
  let mangaSearch = ""

  const searchMore = async () => {
    const reply = await tryCatch(
      `https://api.jikan.moe/v3/search/manga?q=${mangaSearch}&limit=10`
    );
    return reply.results;
  };

  onMount(() => currentPath.set("manga"));
  onMount(setMangaStore);

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

  {#if mangaLoading}
    Loading...
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
  .japanTitle{
      padding: 1rem;
  }
  .synopsis {
    text-align: left;
  }

  .footerItems {
    display: flex;
    justify-content: space-between;
  }

  @media screen and (max-width: 900px) {
    .mangaGrid {
      grid-template-columns: 1fr;
      max-width: 500px;
    }
  }
</style>
