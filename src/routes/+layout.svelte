<script lang="ts">
	import '../app.css';
	import backgroundImage from '$lib/images/v6-background.jpg';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';

	export let data;

	/**
	 * Trigger secret page of easter eggs
	 */
	 function keydown(event: KeyboardEvent) {
		const key = event.key.toLowerCase();
		const isValidKey = key === 'n' || key === 'dead'; // Fallback for international layouts

		const macCombo = event.metaKey && event.altKey && isValidKey;
		const winCombo = event.ctrlKey && event.altKey && isValidKey;

		if (macCombo || winCombo) {
			event.preventDefault();
			console.log('✨ Secret shortcut triggered');
			goto('/extras');
		}
	};

	let open = false;
</script>

<svelte:window onkeydown={keydown} />

<img class="fullscreen-bg" src={backgroundImage} alt="Background" />

<nav>
	<a href="/">home</a>
	<a href="/about">about</a>
	<a href="/contact">contact</a>
</nav>

<main>
	{#key data.url.pathname}
		<div transition:fade={{ duration: 250 }}>
			<slot />
		</div>
	{/key}

	<div class="slideout-wrapper">
		<button class="slide-tab" on:click={() => (open = !open)} type="button" aria-expanded={open} aria-label="info-panel">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="chevron {open ? 'rotated' : ''}"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<polyline points="6 15 12 9 18 15" />
			</svg>
		</button>

		<div class="slide-panel {open ? 'open' : ''}">
			<code class="inline-code text-xs pb-1">v6.1.1</code>
			<p class="text-xs">Tech Stack: SvelteKit, TailwindCSS, Vercel</p>
			<p class="text-xs">Graphics: Leonardo AI</p>
			<hr class="easter-egg my-1 text-gray-500" />
			<p class="easter-egg text-xs">
				Try <code class="inline-code rounded-sm bg-gray-100 px-1">⌘ + ⌥ + N</code> (you didn’t hear
				it from me)
			</p>
		</div>
	</div>
</main>

<style>
	html,
	body {
		margin: 0;
		padding: 0;
		overflow: hidden;
		height: 100%;
	}

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
		object-position: left center; /* 👈 ensures left side is always visible */
	}

	nav {
		position: absolute;
		top: 2rem;
		right: 2rem;
		display: flex;
		gap: 4rem;
		z-index: 2;
		transition: all 0.3s ease;
	}

	nav a {
		color: rgb(30, 30, 30);
		text-decoration: none;
		font-size: larger;
	}

	nav a:hover {
		text-decoration: underline;
	}

	/* Mobile breakpoint adjustment */
	@media (max-width: 785px) {
		.fullscreen-bg {
			object-position: calc(-14px) center;
		}

		nav {
			display: flex;
			flex-direction: column;
			bottom: 1rem;
			left: 1rem;
			justify-content: flex-end;
			gap: 2rem;
		}

		nav a {
			color: rgb(17, 22, 31);
			font-size: xx-large;
		}

		.easter-egg {
			display: none;
		}
	}

	@media (max-width: 600px) {
		.easter-egg {
			display: none;
		}
	}

	.slideout-wrapper {
		position: fixed;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		z-index: 999;
	}

	.slide-tab {
		width: 48px;
		height: 28px;
		background: rgba(255, 255, 255, 0.75);
		backdrop-filter: blur(6px);
		border-radius: 12px 12px 0 0;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
	}

	.slide-tab .chevron {
		width: 20px;
		height: 20px;
		stroke: black;
		transition: transform 0.3s ease;
	}

	.slide-tab .chevron.rotated {
		transform: rotate(180deg); /* points down when open */
	}

	.slide-panel {
		max-height: 0;
		overflow: hidden;
		transition:
			max-height 0.3s ease,
			padding 0.3s ease;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(6px);
		border-radius: 12px 12px 0 0;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
		text-align: center;
		padding: 0 1rem;
	}

	.slide-panel.open {
		max-height: 150px;
		padding: 1rem;
	}
</style>
