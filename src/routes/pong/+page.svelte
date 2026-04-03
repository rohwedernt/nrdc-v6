<script lang="ts">
	import Pong from '$lib/components/Pong.svelte';
</script>

<div class="pong-wrapper">
	<Pong />
</div>

<style>
	.pong-wrapper {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		min-width: 35vw;
		max-width: 80vw;
		max-height: 80vh;

		display: flex;
		align-items: center;
		justify-content: center;

		z-index: 3;
	}
</style>
