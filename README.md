# timetoady's mangAnime
###### A project in Svelte, MongoDB/Express, and GraphQL/Prisma/PostgreSQL

This Svelte-based client accesses three separate APIs to get and display Anime and Manga Data: one external REST API for adding additional entries, a tailored REST API built in Node.js with Express and serving from a MongoDB database, and a custom GraphQL server using a PostgreSQL database.

Elements of this site are built using [`svelte-routing`](https://www.npmjs.com/package/svelte-routing), [`svelte-paginate`](https://www.npmjs.com/package/svelte-paginate), and [`sveltestrap`](https://www.npmjs.com/package/sveltestrap) for routing, pagination, and component libraries respectively. 

Both custom servers are hosted on [heroku](https://www.heroku.com/home).

## Anime RESTful API

### GitHub
https://github.com/timetoady/RIA-II

### Heroku
https://lit-mountain-37161.herokuapp.com/


## GraphQL/Prisma API

### GitHub
https://github.com/timetoady/mangaGraphQL

### Heroku
https://manga-graphql3.herokuapp.com/