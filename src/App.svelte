<script>
	import Anime from './anime.svelte'
	
</script>

<main>
	<h1>Anime Enporium</h1>
	<p>Just a little place to collect anime for your use and fun.</p>
	<Anime/>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>