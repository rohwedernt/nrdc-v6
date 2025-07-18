<script lang="ts">
import { X } from 'lucide-svelte';
import { t } from 'svelte-i18n';
</script>

<section class="glass-panel">
	<div class="flex justify-between">
		<a href="/">
			<X size="36" strokeWidth="1" />
		</a>
		<h1 class="mb-4 text-end text-4xl">{$t('about.title')}</h1>
	</div>
	<p class="pt-4 md:text-lg">{$t('about.p1')}</p>
	<p class="pt-4 md:text-lg">{$t('about.p2')}</p>
	<p class="pt-4 md:text-lg">{$t('about.p3')}</p>
	<p class="pt-4 md:text-lg">{$t('about.p4')}</p>
</section>

<style>
	.glass-panel {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		min-width: 80vw;
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

		@media (max-width: 735px) {
			padding: 1rem;
			padding-top: 4rem;
			min-width: 100vw;
			min-height: 100vh;
			box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
			border-radius: 0%;
		}
	}
</style>
