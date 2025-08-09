<script lang="ts">
	import backgroundImage from '$lib/images/v6-background.jpg';
</script>

<img class="fullscreen-bg" src={backgroundImage} alt="" aria-hidden="true" />

<style>
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
			object-position: calc(-12px) center;
		}
	}
</style>
