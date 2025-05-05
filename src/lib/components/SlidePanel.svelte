<script lang="ts">
	import { afterNavigate } from '$app/navigation';

	let open = false;

	afterNavigate(() => {
		open = false;
	});
</script>

	<div class="slideout-wrapper">
		<button
			class="slide-tab"
			on:click={() => (open = !open)}
			type="button"
			aria-expanded={open}
			aria-label="info-panel"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="chevron {open ? 'rotated' : ''}"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<polyline points="6 15 12 9 18 15" />
			</svg>
		</button>

		<div class="slide-panel {open ? 'open' : ''}">
			<code class="inline-code pb-1 text-xs">v6.1.5</code>
			<p class="text-xs">Tech Stack: SvelteKit, TailwindCSS, Vercel</p>
			<p class="text-xs">Graphics: Leonardo AI</p>
			<hr class="key-command my-1 text-gray-500" />
			<p class="key-command text-xs">
				Try <code class="inline-code rounded-sm bg-gray-200/80 px-1">⌥ + ⬆ + /</code> (you didn’t hear
				it from me)
			</p>
		</div>
	</div>

<style>
	.slideout-wrapper {
		position: fixed;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		z-index: 999;
	}

	.slide-tab {
		width: 48px;
		height: 28px;
		background: rgba(255, 255, 255, 0.75);
		backdrop-filter: blur(6px);
		border-radius: 12px 12px 0 0;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
	}

	.slide-tab .chevron {
		width: 20px;
		height: 20px;
		stroke: black;
		transition: transform 0.3s ease;
	}

	.slide-tab .chevron.rotated {
		transform: rotate(180deg); /* points down when open */
	}

	.slide-panel {
		max-height: 0;
		overflow: hidden;
		transition:
			max-height 0.3s ease,
			padding 0.3s ease;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(6px);
		border-radius: 12px 12px 0 0;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
		text-align: center;
		padding: 0 1rem;
	}

	.slide-panel.open {
		max-height: 150px;
		padding: 1rem;
	}

	/* Mobile breakpoint adjustment */
	@media (max-width: 785px) {
		.key-command {
			display: none;
		}
	}

	@media (max-width: 600px) {
		.key-command {
			display: none;
		}

		.slideout-wrapper {
			right: 5rem;
		}

		.slide-panel.open {
			min-width: 300px;
		}
	}
</style>
