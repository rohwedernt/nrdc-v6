<script lang="ts">
	import { t } from 'svelte-i18n';
	import InkCard from '$lib/components/InkCard.svelte';

	const splats = [
		{ x: 3, y: -4, size: 280, seed: 5, delay: 0, rot: -15 },
		{ x: 101, y: 38, size: 230, seed: 17, delay: 130, rot: 30 },
		{ x: 18, y: 101, size: 190, seed: 61, delay: 230, rot: 80 },
		{ x: 94, y: 99, size: 120, seed: 97, delay: 320, rot: 0 }
	];

	const paragraphs = ['about.p1', 'about.p2', 'about.p3', 'about.p4'];
</script>

<InkCard title={$t('about.title')} {splats}>
	{#each paragraphs as key, i}
		<p class="para pt-4 font-[450] md:text-lg" style="--i: {i};">{$t(key)}</p>
	{/each}
</InkCard>

<style>
	.para {
		animation: rise 0.5s ease-out backwards;
		animation-delay: calc(0.6s + var(--i) * 90ms);
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.para {
			animation: none;
		}
	}
</style>
