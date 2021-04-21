<script>
  import { onMount } from "svelte";
  import { currentPath, currentManga, mangaDetail } from "./stores";
  import { ALL_MANGA } from "./graphql/queries";
  import { tryCatchQL } from "./api";
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
    mangaLoading = true;
    let mangaSets = await tryCatchQL(mangaDB, ALL_MANGA);
    currentManga.set(mangaSets.allManga);
    console.log("Curren manga sets now", $currentManga);
    mangaLoading = false;
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
  <h1>Manga Page is working!</h1>

  {#if mangaLoading}
    Loading...
  {/if}
  {#each paginatedItems as item, index (item.id)}
    <div class="mangaGrid">
      <div>
        <!-- {item.title} by {item.author.name} -->
        <Card class="mb-3">
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
          </CardHeader>
          <CardBody>
            <CardSubtitle>Japanese: {item.title_japanese}</CardSubtitle>
            <div class="imageDiv">
              <img
                class="mangaImage"
                scr={item.image_url}
                alt="{item.title} Cover"
                loading="lazy"
              />
            </div>

            <CardText>
              <Button color="primary" id="toggler{index}" class="mb-3">Toggle</Button>
              <UncontrolledCollapse toggler="#toggler{index}">
                

                {item.synopsis}

   
              </UncontrolledCollapse>

            </CardText>
            <Button>Button</Button>
          </CardBody>
          <CardFooter>Footer</CardFooter>
        </Card>
      </div>
    </div>
  {/each}
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
  .mangaImage {
    width: 100%;
    max-width: 225px;
  }
</style>
