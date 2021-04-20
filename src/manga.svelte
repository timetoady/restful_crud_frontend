<script>
import { onMount } from 'svelte';
import { currentPath } from "./stores";
onMount(currentPath.set("manga"))
</script>

<main>
<h1>Manga Page is working!</h1>
</main>

<style>

</style>