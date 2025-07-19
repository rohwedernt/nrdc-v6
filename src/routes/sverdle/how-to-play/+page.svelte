<svelte:head>
	<title>{$t('sverdle.howto.title')}</title>
	<meta name="description" content={$t('sverdle.howto.meta')} />
</svelte:head>

<script>
	import { t } from 'svelte-i18n';
	$: explain1Html = $t('sverdle.howto.explain1', { letter: '<span class="exact">y</span>', close1: '<span class="close">r</span>', close2: '<span class="close">t</span>' });
	// @ts-ignore: ignore type error for parameterized translation
</script>

<div class="text-column glass-panel">
	<h1>{$t('sverdle.howto.heading')}</h1>

	<p>{$t('sverdle.howto.intro')}</p>

	<div class="example">
		<span class="close">r</span>
		<span class="missing">i</span>
		<span class="close">t</span>
		<span class="missing">z</span>
		<span class="exact">y</span>
	</div>

	<p>{@html explain1Html}</p>

	<div class="example">
		<span class="exact">p</span>
		<span class="exact">a</span>
		<span class="exact">r</span>
		<span class="exact">t</span>
		<span class="exact">y</span>
	</div>

	<p>{@html $t('sverdle.howto.explain2')}</p>

	<p>{@html $t('sverdle.howto.explain3')}</p>

	<a class="pt-4 text-2xl" href="/sverdle">
		{$t('sverdle.howto.back')}
	</a>
</div>

<style>
	.glass-panel {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		padding: 2rem;

		margin: auto;

		color: black;

		background: rgba(255, 255, 255, 0.75);
		border-radius: 1rem;
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.3);

		display: flex;
		flex-direction: column;
		overflow: auto;

		z-index: 3;

		@media (max-width: 735px) {
			padding: 1rem;
		}
	}

	span {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		font-size: 0.8em;
		width: 2.4em;
		height: 2.4em;
		background-color: white;
		box-sizing: border-box;
		border-radius: 2px;
		border-width: 2px;
		color: rgba(0, 0, 0, 0.7);
	}

	.missing {
		background: rgba(255, 255, 255, 0.5);
		color: rgba(0, 0, 0, 0.5);
	}

	.close {
		border-style: solid;
		border-color: var(--color-theme-2);
	}

	.exact {
		background: var(--color-theme-2);
		color: white;
	}

	.example {
		display: flex;
		justify-content: flex-start;
		margin: 1rem 0;
		gap: 0.2rem;
	}

	.example span {
		font-size: 1.4rem;
	}

	p span {
		position: relative;
		border-width: 1px;
		border-radius: 1px;
		font-size: 0.4em;
		transform: scale(2) translate(0, -10%);
		margin: 0 1em;
	}
</style>
