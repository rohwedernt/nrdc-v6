<script>
	import "../app.css";
	import backgroundImage from '$lib/images/v6-background.jpg';
	import { fade } from 'svelte/transition';
  export let data;
</script>

<img class="fullscreen-bg" src={backgroundImage} alt="Background" />

<nav class="nav-bar">
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
		right:2rem;
		display: flex;
		gap: 3rem;
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
@media (max-width: 735px) {
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

    /* z-index: 999; */
  }

	nav a {
		color: rgb(17, 22, 31);
		font-size: x-large;
	}
}
</style>
