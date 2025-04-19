<script lang="ts">
	import '../app.css';
	import { fade } from 'svelte/transition';
	import backgroundImage from '$lib/images/v6-background.jpg';
	import Keybindings from '$lib/components/KeyBindings.svelte';
	import SlidePanel from '$lib/components/SlidePanel.svelte';
	import Navigation from '$lib/components/Navigation.svelte';

	export let data;
</script>


<!-- Full-screen background (visual only) -->
<img class="fullscreen-bg" src={backgroundImage} alt="Background" />

<!-- Global keybinding listener -->
<Keybindings {data} />

<!-- Site-wide navigation -->
<header>
	<Navigation {data} />
</header>

<!-- Main routed content -->
<main>
	{#key data.url.pathname}
		<div transition:fade={{ duration: 250 }}>
			<slot />
		</div>
	{/key}
</main>

<!-- Footer-style panel (non-main accessory) -->
<SlidePanel />


<style>
	:global(#app),
	:global(body) {
		height: 100%;
	}

	.fullscreen-bg {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: -1;
		object-fit: cover;
		object-position: left top;
	}

	@media (max-width: 785px) {
		.fullscreen-bg {
			object-position: calc(-14px) center;
		}
	}
</style>
