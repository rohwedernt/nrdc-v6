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

		/* Canvas is 600×400 (3:2). Limit width so height never exceeds 90vh. */
		width: min(75vw, calc(90vh * 1.5));

		z-index: 3;
	}
</style>
