<script lang="ts">
	export let data;
</script>

<nav>
	<a href="/" class:active={data.url.pathname === '/'}>home</a>
	<a href="/about" class:active={data.url.pathname === '/about'}>about</a>
	<a href="/contact" class:active={data.url.pathname === '/contact'}>contact</a>
</nav>

<style>
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
		text-underline-offset: 4px;
	}

	nav a.active {
		text-decoration: underline;
		text-underline-offset: 4px;
	}

	/* Mobile breakpoint adjustment */
	@media (max-width: 785px) {
		nav {
			display: flex;
			flex-direction: column;
			width: fit-content;
			bottom: 1rem;
			left: 1rem;
			justify-content: flex-end;
			gap: 1rem;
		}

		nav a {
			color: rgb(17, 22, 31);
			font-size: xx-large;
		}
	}
</style>
