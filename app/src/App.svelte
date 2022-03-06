<script>
	import { Route } from "tinro";
	import Home from "./home.svelte";
	import Register from "./register.svelte";
</script>

<Route path="/"><Home /></Route>
<Route path="/register"><Register /></Route>
