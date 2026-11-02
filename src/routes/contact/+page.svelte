<script lang="ts">
	import { Send, Linkedin, Github, FileUser, Copy, Check } from 'lucide-svelte';
	import { t } from 'svelte-i18n';
	import { PAINT, splatPath, droplets } from '$lib/paint';
	import InkCard from '$lib/components/InkCard.svelte';

	// black paint flung around the card, same as /about
	const splats = [
		{ x: 2, y: 6, size: 200, seed: 5, delay: 0, rot: -15 },
		{ x: 100, y: 62, size: 170, seed: 17, delay: 130, rot: 30 },
		{ x: 24, y: 100, size: 130, seed: 61, delay: 230, rot: 80 },
		{ x: 97, y: -2, size: 90, seed: 97, delay: 320, rot: 0 }
	];

	const EMAIL = 'rohwedernt@gmail.com';

	const items = [
		{
			key: 'email',
			href: `mailto:${EMAIL}`,
			icon: Send,
			color: PAINT.teal,
			move: 'fly',
			seed: 11,
			external: false
		},
		{
			key: 'linkedin',
			href: 'https://www.linkedin.com/in/naterohweder/',
			icon: Linkedin,
			color: PAINT.mustard,
			move: 'handshake',
			seed: 29,
			external: true
		},
		{
			key: 'github',
			href: 'https://github.com/rohwedernt',
			icon: Github,
			color: PAINT.ink,
			move: 'wiggle',
			seed: 47,
			external: true
		},
		{
			key: 'resume',
			href: '/resume.pdf',
			icon: FileUser,
			color: PAINT.rust,
			move: 'flip',
			seed: 83,
			external: true
		}
	].map((item) => ({ ...item, path: splatPath(item.seed), drops: droplets(item.seed) }));

	let copied = false;
	let copyTimer: ReturnType<typeof setTimeout>;

	async function copyEmail() {
		try {
			await navigator.clipboard.writeText(EMAIL);
			copied = true;
			clearTimeout(copyTimer);
			copyTimer = setTimeout(() => (copied = false), 1800);
		} catch {
			window.location.href = `mailto:${EMAIL}`;
		}
	}
</script>

<InkCard title={$t('nav.contact')} width="40vw" {splats}>
	<div class="grid-wrap">
		{#each items as item, i (item.key)}
			<div class="tile" style="--paint: {item.color}; --i: {i};">
				<a
					class="tile-link"
					href={item.href}
					target={item.external ? '_blank' : undefined}
					rel={item.external ? 'noopener noreferrer' : undefined}
				>
					<span class="art" aria-hidden="true">
						<span class="splat">
							<svg viewBox="-100 -100 200 200">
								<path d={item.path} />
							</svg>
							<span class="drip"></span>
							<span class="drip drip-2"></span>
						</span>
						{#each item.drops as drop}
							<span
								class="drop"
								style="--x: {drop.x}px; --y: {drop.y}px; --s: {drop.size}px; --d: {drop.delay}ms;"
							></span>
						{/each}
						<span class="icon move-{item.move}">
							<svelte:component this={item.icon} size={56} strokeWidth={1.25} />
						</span>
					</span>
					<span class="label">{$t(`contact.${item.key}`)}</span>
					<span class="tagline">{$t(`contact.${item.key}.tagline`)}</span>
				</a>

				{#if item.key === 'email'}
					<button
						type="button"
						class="copy-btn"
						class:copied
						on:click={copyEmail}
						aria-label={$t('contact.copy')}
					>
						{#if copied}
							<Check size={14} strokeWidth={2} />
							<span>{$t('contact.copied')}</span>
						{:else}
							<Copy size={14} strokeWidth={1.75} />
							<span>{$t('contact.copy')}</span>
						{/if}
					</button>
				{/if}
			</div>
		{/each}
	</div>
</InkCard>

<style>
	/* ---------- Grid ---------- */

	.grid-wrap {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.5rem;
		flex-grow: 1;
	}

	.tile {
		position: relative;
		transition:
			opacity 0.3s ease,
			filter 0.3s ease;
		animation: tile-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
		animation-delay: calc(var(--i) * 90ms + 450ms);
	}

	/* Spotlight: dim the siblings of whatever you're pointing at */
	.grid-wrap:has(.tile-link:hover) .tile:not(:has(.tile-link:hover)) {
		opacity: 0.45;
		filter: saturate(0.4);
	}

	.tile-link {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem 1.75rem;
		color: rgba(20, 20, 20, 0.85);
		text-decoration: none;
		border-radius: 20px;
		outline: none;
	}

	.tile-link:hover {
		text-decoration: none;
	}

	.tile-link:focus-visible {
		box-shadow: 0 0 0 2px var(--paint);
	}

	/* ---------- Splat art ---------- */

	.art {
		position: relative;
		display: grid;
		place-items: center;
		width: 96px;
		height: 96px;
	}

	.splat {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 150px;
		height: 150px;
		margin: -75px 0 0 -75px;
		transform: scale(0) rotate(-40deg);
		transition: transform 0.25s cubic-bezier(0.55, 0, 1, 0.45);
		pointer-events: none;
	}

	.splat svg {
		width: 100%;
		height: 100%;
		overflow: visible;
		fill: var(--paint);
		filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.18));
	}

	.drip {
		position: absolute;
		top: 72%;
		left: 58%;
		width: 9px;
		height: 0;
		border-radius: 0 0 6px 6px;
		background: var(--paint);
		transition: height 0.15s ease;
	}

	.drip-2 {
		left: 36%;
		top: 70%;
		width: 6px;
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
		transform: translate(0, 0) scale(0);
		opacity: 0;
		transition:
			transform 0.2s ease-in,
			opacity 0.2s ease-in;
		pointer-events: none;
	}

	.icon {
		position: relative;
		display: inline-flex;
		color: rgba(20, 20, 20, 0.8);
		transition: color 0.2s ease;
	}

	.label {
		position: relative;
		margin-top: 0.85rem;
		padding: 0.1rem 0.6rem;
		font-size: 0.95rem;
		color: rgba(0, 0, 0, 0.7);
		border-radius: 4px;
		transition:
			transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
			background-color 0.2s ease,
			box-shadow 0.2s ease,
			color 0.2s ease;
	}

	.tagline {
		margin-top: 0.4rem;
		font-size: 0.8rem;
		font-style: italic;
		color: rgba(0, 0, 0, 0.55);
		opacity: 0;
		transform: translateY(-6px);
		transition:
			opacity 0.25s ease,
			transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	/* ---------- Hover / focus: SPLAT ---------- */

	.tile-link:hover .splat,
	.tile-link:focus-visible .splat {
		transform: scale(1) rotate(0deg);
		transition: transform 0.55s cubic-bezier(0.34, 1.9, 0.5, 1);
	}

	.tile-link:active .splat {
		transform: scale(1.12) rotate(4deg);
		transition-duration: 0.12s;
	}

	.tile-link:hover .drip,
	.tile-link:focus-visible .drip {
		height: 34px;
		transition: height 1.4s cubic-bezier(0.2, 0.7, 0.3, 1) 0.35s;
	}

	.tile-link:hover .drip-2,
	.tile-link:focus-visible .drip-2 {
		height: 20px;
		transition-delay: 0.55s;
	}

	.tile-link:hover .drop,
	.tile-link:focus-visible .drop {
		transform: translate(var(--x), var(--y)) scale(1);
		opacity: 1;
		transition:
			transform 0.5s cubic-bezier(0.15, 0.9, 0.3, 1.2) var(--d),
			opacity 0.1s linear var(--d);
	}

	.tile-link:hover .icon,
	.tile-link:focus-visible .icon {
		color: white;
	}

	.tile-link:hover .label,
	.tile-link:focus-visible .label {
		transform: translateY(14px) rotate(-4deg);
		background: white;
		color: black;
		box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18);
	}

	/* little strip of tape on the sticker */
	.label::before {
		content: '';
		position: absolute;
		top: -7px;
		left: 50%;
		width: 26px;
		height: 11px;
		margin-left: -13px;
		background: rgba(255, 240, 190, 0.85);
		transform: rotate(6deg) scaleY(0);
		transition: transform 0.2s ease 0.1s;
	}

	.tile-link:hover .label::before,
	.tile-link:focus-visible .label::before {
		transform: rotate(6deg) scaleY(1);
	}

	.tile-link:hover .tagline,
	.tile-link:focus-visible .tagline {
		opacity: 1;
		transform: translateY(12px);
	}

	/* ---------- Per-icon personalities ---------- */

	.tile-link:hover .move-fly,
	.tile-link:focus-visible .move-fly {
		animation: fly 1s cubic-bezier(0.5, 0, 0.3, 1) 0.1s;
	}

	.tile-link:hover .move-handshake,
	.tile-link:focus-visible .move-handshake {
		animation: handshake 0.9s ease-in-out 0.15s;
	}

	.tile-link:hover .move-wiggle,
	.tile-link:focus-visible .move-wiggle {
		animation: wiggle 0.8s ease-in-out 0.15s;
	}

	.tile-link:hover .move-flip,
	.tile-link:focus-visible .move-flip {
		animation: flip 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.15s;
	}

	@keyframes fly {
		0% {
			transform: translate(0, 0) rotate(0);
		}
		35% {
			transform: translate(90px, -90px) rotate(10deg) scale(0.6);
			opacity: 0;
		}
		36% {
			transform: translate(-90px, 70px) rotate(-10deg) scale(0.6);
			opacity: 0;
		}
		70% {
			opacity: 1;
		}
		100% {
			transform: translate(0, 0) rotate(0);
		}
	}

	/* firm, professional, slightly too long */
	@keyframes handshake {
		0%,
		100% {
			transform: translateY(0);
		}
		15%,
		45%,
		75% {
			transform: translateY(-7px) rotate(-3deg);
		}
		30%,
		60%,
		90% {
			transform: translateY(5px) rotate(2deg);
		}
	}

	@keyframes wiggle {
		0%,
		100% {
			transform: rotate(0);
		}
		20% {
			transform: rotate(-14deg);
		}
		40% {
			transform: rotate(11deg);
		}
		60% {
			transform: rotate(-7deg);
		}
		80% {
			transform: rotate(4deg);
		}
	}

	@keyframes flip {
		0% {
			transform: perspective(300px) rotateY(0);
		}
		100% {
			transform: perspective(300px) rotateY(360deg);
		}
	}

	@keyframes tile-in {
		from {
			opacity: 0;
			transform: translateY(16px) scale(0.92);
		}
	}

	/* ---------- Copy email ---------- */

	.copy-btn {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.25rem 0.6rem;
		font-size: 0.75rem;
		color: rgba(0, 0, 0, 0.6);
		background: rgba(255, 255, 255, 0.6);
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: 999px;
		cursor: pointer;
		opacity: 0;
		transform: translateY(-4px);
		transition:
			opacity 0.2s ease,
			transform 0.2s ease,
			background-color 0.2s ease,
			color 0.2s ease;
	}

	.tile:hover .copy-btn,
	.copy-btn:focus-visible,
	.copy-btn.copied {
		opacity: 1;
		transform: translateY(0);
	}

	.copy-btn:hover {
		background: white;
		color: black;
	}

	.copy-btn.copied {
		background: var(--paint);
		color: white;
		border-color: transparent;
		animation: pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes pop {
		50% {
			transform: scale(1.15);
		}
	}

	/* ---------- Touch: no hover, so show the jokes up front ---------- */

	@media (hover: none) {
		.tagline {
			opacity: 1;
			transform: none;
		}

		.copy-btn {
			opacity: 1;
			transform: none;
		}
	}

	@media (max-width: 735px) {
		.grid-wrap {
			gap: 1.5rem 0.25rem;
			align-content: center;
		}

		.tile-link {
			padding: 1.5rem 0.25rem;
		}

		.copy-btn {
			top: 0;
			right: 0.25rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tile,
		.tile-link:hover .icon,
		.tile-link:focus-visible .icon {
			animation: none !important;
		}

		.splat,
		.drop,
		.drip,
		.label,
		.tagline {
			transition-duration: 0.01ms !important;
			transition-delay: 0s !important;
		}
	}
</style>
