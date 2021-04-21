<script>
	import { Router, Route } from "svelte-routing"; 
	import Anime from './anime.svelte'
	import Manga from './manga.svelte'
	import Nav from "./nav.svelte";


</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
  />

</svelte:head>

<main>
	<Nav />

	  <Router >
		<div>
		  <Route path="/" component="{Anime}" />
		  <Route path="manga" component="{Manga}" />
		  <!-- <Route path="about" component="{About}" /> -->
		</div>
	  </Router>
	
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
		
	}


	@media (min-width: 640px) {
		main {
			max-width: none;
		}

	}
	

</style>