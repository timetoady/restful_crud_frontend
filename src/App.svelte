<script>
	import Anime from './anime.svelte'
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
  />

</svelte:head>

<main>
	<h1 class="pageTitle">Anime EMPORIUM</h1>
	<p>Just a little place to collect anime for your use and fun.</p>
	<Anime/>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
		
	}

	h1 {
		color: #0004ff;
		text-align: left;
		text-transform: uppercase;
		font-size: 4rem;
		font-weight: 100;
		margin-bottom: 0;
	}
	p{
		text-align: left;
		margin-top: -.3rem;
		font-style: italic;
		font-weight: 400;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}

	}
	
	@media (max-width: 720px) {
		h1{
			font-size: 3rem;
		}
	}
	@media (max-width: 550px) {
		h1{
			font-size: 2.5rem;
		}
	}
	@media (max-width: 411px) {
		h1{
			font-size: 1.8rem;
		}
		p{
			font-size: .8rem;
		}
	}
</style>