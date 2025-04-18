<script>
	import backgroundImage from '$lib/images/v6-background.jpg';
</script>

<img class="fullscreen-bg" src={backgroundImage} alt="Background" />

<nav>
	<a href="/about">about</a>
	<a href="/contact">contact</a>
	<a href="/contact">resume</a>

</nav>

<div class="content">
</div>

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
	}

	nav a:hover {
		text-decoration: underline;
	}

	.content {
		position: relative;
		z-index: 1;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
	}
</style>
