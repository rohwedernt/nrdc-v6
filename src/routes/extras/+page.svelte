<script>
	import { X } from 'lucide-svelte';
	import { t } from 'svelte-i18n';
</script>

<section class="glass-panel">
	<div class="flex justify-between">
		<a href="/">
			<X size="36" strokeWidth="1" />
		</a>

		<h1 class="mb-6 text-end text-4xl">{$t('extras.title')}</h1>
	</div>

	<h2 class="pb-1 text-2xl">{$t('extras.apps')}</h2>
	<ul class="list-inside pb-6">
		<li class="pb-1 text-xl">
			– {$t('extras.apps.versions')}
			<a href="https://nrdc-v5.vercel.app/" target="_blank" rel="noopener noreferrer">v5</a>,
			<a href="https://nrdc-v3.vercel.app/" target="_blank" rel="noopener noreferrer">v4</a>, and
			<a href="https://naterohwederdotcom.vercel.app/" target="_blank" rel="noopener noreferrer"
				>v3</a
			>
		</li>
		<li class="pb-1 text-xl text-gray-600">– {$t('extras.apps.aigateway')}</li>
		<li class="pb-1 text-xl text-gray-600">– {$t('extras.apps.exercise')}</li>
		<li class="pb-1 text-xl text-gray-600">– {$t('extras.apps.nutrition')}</li>
	</ul>

	<h2 class="pb-1 text-2xl">{$t('extras.music')}</h2>
	<ul class="list-inside pb-6">
		<li class="pb-1 text-xl">– <a href="https://rohco.vercel.app/" target="_blank" rel="noopener noreferrer">{$t('extras.music.rohco')}</a></li>
		<li class="pb-1 text-xl">
			– <a href="https://nomadic-archive.vercel.app/" target="_blank" rel="noopener noreferrer">{$t('extras.music.nomadic')}</a>
		</li>
	</ul>

	<h2 class="pb-1 text-2xl">{$t('extras.games')}</h2>
	<ul class="list-inside pb-6">
		<li class="pb-1 text-xl">
			– {$t('extras.games.sverdle')} <a href="/sverdle">{$t('extras.games.sverdle.link')}</a> ({$t('extras.games.wordle')} <a target="_blank" rel="noopener noreferrer" href="https://www.nytimes.com/games/wordle/index.html">{$t('extras.games.wordle.link')}</a>)
		</li>
		<li class="pb-1 text-xl">
			– {$t('extras.games.pong')} <a href="/pong">{$t('extras.games.pong.link')}</a>
		</li>
	</ul>
</section>

<style>
	.glass-panel {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		min-width: 50vw;
		max-width: 80vw;
		max-height: 80vh;

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

		@media (max-width: 1275px) {
			min-width: 70vw;
			max-height: 64vh;
			top: 50%;
		}

		@media (max-width: 850px) {
			padding: 1rem;
			min-width: 100vw;
			max-height: 64vh;
			top: 37%;
			box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
			border-radius: 0%;
		}
	}

	a {
		color: black;
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 2px;
	}

	a:hover {
		font-weight: 500;
	}
</style>
