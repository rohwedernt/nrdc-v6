<script lang="ts">
	import { goto } from '$app/navigation';
	export let data: { url: URL };

	/**
	 * Handle various keydown events
	 */
	function keydown(event: KeyboardEvent) {
		const key = event.key.toLowerCase();
		const isValidKey = key === '/' || key === '¿'; // Fallback for intl layouts

		const macCombo = event.altKey && event.shiftKey && isValidKey;
		const winCombo = event.altKey && event.shiftKey && isValidKey;

		/**
		 * Trigger extras page
		 */
		if (macCombo || winCombo) {
			event.preventDefault();
			goto('/extras');
		}

		/**
		 * Escape key returns to home or exits games
		 */
		if (event.key === 'Escape') {
			const path = data.url.pathname;

			if (path === '/pong') {
				goto('/extras');
			} else {
				goto('/');
			}
		}
	}
</script>

<svelte:window on:keydown={keydown} />
