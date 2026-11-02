<!--
	Glass card that "slaps" onto the wall with black paint splats bursting out
	from behind it, then peels off and un-splats when the page navigates away.
	Shared by /about and /contact.
-->
<script lang="ts">
	import { X } from 'lucide-svelte';
	import { cubicIn } from 'svelte/easing';
	import { PAINT, splatPath, droplets } from '$lib/paint';

	type SplatSpec = {
		/** center, as a percentage of the card — values near 0/100 peek past an edge */
		x: number;
		y: number;
		size: number;
		seed: number;
		/** ms before this splat lands */
		delay: number;
		rot: number;
	};

	export let title: string;
	export let subtitle: string | undefined = undefined;
	/** card width on desktop (full-screen on mobile) */
	export let width = '80vw';
	export let splats: SplatSpec[];

	$: paint = splats.map((s) => ({
		...s,
		path: splatPath(s.seed),
		drops: droplets(s.seed, 7, s.size / 150)
	}));

	// Exit: the card peels off the wall...
	function peel(_node: Element) {
		return {
			duration: 300,
			easing: cubicIn,
			css: (t: number, u: number) =>
				`opacity: ${t}; transform: translateY(${u * 28}px) rotate(${u * -3}deg) scale(${1 - u * 0.08});`
		};
	}

	// ...and the paint shrinks back to nothing.
	function unsplat(_node: Element, { delay = 0 } = {}) {
		return {
			delay,
			duration: 260,
			easing: cubicIn,
			css: (t: number) => `transform: scale(${t}); opacity: ${t};`
		};
	}
</script>

<div class="stage">
	<div class="card-wrap" style="--w: {width}; --paint: {PAINT.ink};" out:peel|global>
		{#each paint as s, i}
			<span
				class="splat"
				style="--x: {s.x}%; --y: {s.y}%; --size: {s.size}px; --d: {s.delay}ms; --rot: {s.rot}deg;"
				aria-hidden="true"
				out:unsplat|global={{ delay: i * 30 }}
			>
				<svg viewBox="-100 -100 200 200"><path d={s.path} /></svg>
				<span class="drip" style="--h: {Math.round(s.size * 0.32)}px;"></span>
				<span class="drip drip-2" style="--h: {Math.round(s.size * 0.18)}px;"></span>
				{#each s.drops as drop}
					<span
						class="drop"
						style="--dx: {drop.x}px; --dy: {drop.y}px; --s: {drop.size}px; --dd: {drop.delay}ms;"
					></span>
				{/each}
			</span>
		{/each}

		<section class="glass-panel">
			<div class="mb-4 flex justify-between">
				<div>
					<h1 class="text-4xl">
						<span class="title">
							<svg class="swipe" viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true">
								<path d="M6 28 C 40 16, 90 32, 140 20 S 190 24, 194 18" pathLength="1" />
							</svg>
							<span class="title-text">{title}</span>
						</span>
					</h1>
					{#if subtitle}
						<p class="subtitle">{subtitle}</p>
					{/if}
				</div>
				<a href="/" class="close-btn" aria-label="close">
					<X size={36} strokeWidth={1} />
				</a>
			</div>
			<slot />
		</section>
	</div>
</div>

<style>
	.stage {
		position: fixed;
		inset: 0;
		display: grid;
		place-items: center;
		background: rgba(0, 0, 0, 0.5);
		pointer-events: none;
		z-index: 3;
	}

	.card-wrap {
		position: relative;
		width: var(--w);
		min-width: min(32rem, 90vw);
		max-width: 80vw;
		max-height: 80vh;
		display: flex;
		pointer-events: auto;
		animation: slap-in 0.6s cubic-bezier(0.34, 1.4, 0.64, 1) 80ms backwards;

		@media (max-width: 735px) {
			width: 100vw;
			min-width: 0;
			max-width: none;
			height: 100vh;
			max-height: none;
		}
	}

	.glass-panel {
		position: relative;
		width: 100%;
		max-height: 80vh;

		padding: 2rem;

		color: black;

		background: rgba(255, 255, 255, 0.7);
		border-radius: 1rem;
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.3);

		display: flex;
		flex-direction: column;
		overflow: auto;

		@media (max-width: 735px) {
			padding: 1rem;
			padding-top: 4rem;
			max-height: none;
			box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
			border-radius: 0%;
		}
	}

	.subtitle {
		margin-top: 0.9rem;
		font-size: 0.95rem;
		color: rgba(0, 0, 0, 0.5);
	}

	.close-btn {
		display: inline-flex;
		align-self: flex-start;
	}

	.close-btn :global(svg) {
		transition:
			stroke-width 0.15s ease,
			transform 0.3s ease;
	}

	.close-btn:hover :global(svg) {
		stroke-width: 2;
		transform: rotate(90deg);
	}

	/* ---------- Splats ---------- */

	.splat {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: var(--size);
		height: var(--size);
		margin: calc(var(--size) / -2) 0 0 calc(var(--size) / -2);
		pointer-events: none;
		animation: splat-in 0.6s cubic-bezier(0.34, 1.6, 0.5, 1) var(--d) backwards;
	}

	.splat svg {
		width: 100%;
		height: 100%;
		overflow: visible;
		fill: var(--paint);
		transform: rotate(var(--rot));
		filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.25));
	}

	.drip {
		position: absolute;
		top: 70%;
		left: 56%;
		width: calc(var(--size) * 0.06);
		height: var(--h);
		border-radius: 0 0 999px 999px;
		background: var(--paint);
		transform-origin: top;
		animation: drip 2.2s cubic-bezier(0.2, 0.7, 0.3, 1) calc(var(--d) + 450ms) backwards;
	}

	.drip-2 {
		left: 34%;
		top: 68%;
		width: calc(var(--size) * 0.04);
		animation-delay: calc(var(--d) + 700ms);
	}

	.drop {
		position: absolute;
		left: 50%;
		top: 50%;
		width: var(--s);
		height: var(--s);
		margin: calc(var(--s) / -2) 0 0 calc(var(--s) / -2);
		border-radius: 50%;
		background: var(--paint);
		transform: translate(var(--dx), var(--dy));
		animation: fling 0.55s cubic-bezier(0.15, 0.9, 0.3, 1.2) calc(var(--d) + var(--dd)) backwards;
	}

	/* ---------- Title brush underline ---------- */

	.title {
		position: relative;
		display: inline-block;
	}

	.title-text {
		position: relative;
	}

	.swipe {
		position: absolute;
		left: -4%;
		bottom: -14px;
		width: 108%;
		height: 40%;
		overflow: visible;
	}

	.swipe path {
		fill: none;
		stroke: var(--paint);
		stroke-width: 5;
		stroke-linecap: round;
		opacity: 0.9;
		stroke-dasharray: 1;
		stroke-dashoffset: 0;
		animation: swipe 0.55s cubic-bezier(0.6, 0, 0.3, 1) 0.55s backwards;
	}

	/* ---------- Keyframes ---------- */

	@keyframes slap-in {
		0% {
			opacity: 0;
			transform: translateY(24px) scale(0.86) rotate(-2.5deg);
		}
		55% {
			opacity: 1;
			transform: translateY(-4px) scale(1.015) rotate(0.4deg);
		}
		100% {
			transform: none;
		}
	}

	@keyframes splat-in {
		0% {
			transform: scale(0) rotate(-50deg);
		}
		100% {
			transform: scale(1) rotate(0);
		}
	}

	@keyframes fling {
		from {
			transform: translate(0, 0) scale(0);
		}
	}

	@keyframes drip {
		from {
			transform: scaleY(0);
		}
	}

	@keyframes swipe {
		from {
			stroke-dashoffset: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card-wrap,
		.splat,
		.drip,
		.drop,
		.swipe path {
			animation: none;
		}
	}
</style>
