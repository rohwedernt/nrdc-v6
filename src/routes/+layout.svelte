<script lang="ts">
	import '../app.css';
	import { fade } from 'svelte/transition';
	import Keybindings from '$lib/components/KeyBindings.svelte';
	import SlidePanel from '$lib/components/SlidePanel.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import BackgroundImage from '$lib/components/BackgroundImage.svelte';

	export let data;
</script>

<!-- Full-screen background (visual only) -->
<BackgroundImage />

<!-- Global keybinding listener -->
<Keybindings {data} />

<!-- Site-wide navigation -->
<header>
	<Navigation />
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
</style>
