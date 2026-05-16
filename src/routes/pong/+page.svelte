<script lang="ts">
	import Pong from '$lib/components/Pong.svelte';
</script>

<div class="backdrop" aria-hidden="true"></div>

<div class="pong-wrapper">
	<Pong />
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1;
	}

	.pong-wrapper {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		width: 75vw;
		max-height: 90vh;

		z-index: 3;
	}
</style>
