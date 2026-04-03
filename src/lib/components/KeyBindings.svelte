<script lang="ts">
	import { goto } from '$app/navigation';
	import { extrasStore } from '$lib/stores/extras';
	export let data: { url: URL };

	/**
	 * Handle various keydown events
	 */
	function keydown(event: KeyboardEvent) {
		const key = event.key.toLowerCase();
		const isValidKey = key === '/' || key === '¿'; // Fallback for intl layouts

		const combo = event.altKey && event.shiftKey && isValidKey;

		/**
		 * Trigger extras: open modal on /theme, navigate otherwise
		 */
		if (combo) {
			event.preventDefault();
			goto('/extras');
		}

		/**
		 * Escape key: close extras modal layers first, then navigate
		 */
		if (event.key === 'Escape') {
			if ($extrasStore.showPong) {
				extrasStore.closePong();
				return;
			}
			if ($extrasStore.open) {
				extrasStore.closeExtras();
				return;
			}

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
