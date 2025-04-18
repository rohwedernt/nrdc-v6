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
		gap: 2rem;
		z-index: 2;
	}

	nav a {
		color: rgb(30, 30, 30);
		text-decoration: none;
		font-size: larger;
		@media (max-width: 735px) {
			/* color: rgb(244, 244, 244); */
		}
	}

	nav a:hover {
		text-decoration: underline;
	}

	.nav-bar {
  position: absolute;
  top: 2rem;
  right: 2rem;
  display: flex;
  gap: 3rem;
  z-index: 2;
  transition: all 0.3s ease;
}

/* Mobile breakpoint adjustment */
@media (max-width: 735px) {
  .nav-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;

    padding: .6rem 1rem;
    justify-content: flex-start; 
    gap: 1.5rem;

    background: rgb(239, 242, 245);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
		/* border-radius: 0 0 5px 5px; */

    z-index: 999;
  }

  .fullscreen-bg {
    margin-top: 3rem; /* push background down slightly on mobile */
  }
}
</style>
