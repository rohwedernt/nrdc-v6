<script lang="ts">
	import { locale } from 'svelte-i18n';

	function setLocale(lang: string) {
		locale.set(lang);
	}

	$: isEs = $locale?.startsWith('es');
</script>

{#if $locale}
	<div class="lang-toggle">
		<button class:active={!isEs} on:click={() => setLocale('en')} aria-label="Switch to English">
			EN
		</button>
		<span class="divider">|</span>
		<button class:active={isEs} on:click={() => setLocale('es')} aria-label="Cambiar a español">
			ES
		</button>
	</div>
{/if}

<style>
	.lang-toggle {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		z-index: 1000;
		display: flex;
		align-items: center;
		gap: 0.125rem;
		background: rgba(255, 255, 255, 0.75);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		border-radius: 8px;
		padding: 0.25rem 0.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
	}

	button {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.125rem 0.3rem;
		color: rgba(0, 0, 0, 0.35);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		transition: color 0.15s;
		line-height: 1;
	}

	button.active {
		color: rgba(0, 0, 0, 0.85);
	}

	button:hover:not(.active) {
		color: rgba(0, 0, 0, 0.6);
	}

	.divider {
		color: rgba(0, 0, 0, 0.2);
		font-size: 0.75rem;
		line-height: 1;
		user-select: none;
	}

	@media (max-width: 600px) {
		.lang-toggle {
			display: none;
		}
	}
</style>
