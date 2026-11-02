<script lang="ts">
	import { t, locale } from 'svelte-i18n';
	import { fade, scale } from 'svelte/transition';
	import { extrasStore } from '$lib/stores/extras';
	import ExtrasModal from '$lib/components/ExtrasModal.svelte';
	import { PAINT, splatPath, droplets } from '$lib/paint';

	// "make it yours" button: a black splat with the theme colors hiding behind it
	const inkPath = splatPath(67);
	const btnColors = [
		{ color: PAINT.teal, seed: 7, rot: -25, dx: -14, dy: -10, delay: 0 },
		{ color: PAINT.mustard, seed: 23, rot: 40, dx: 14, dy: -12, delay: 50 },
		{ color: PAINT.rust, seed: 71, rot: 110, dx: 4, dy: 14, delay: 100 }
	].map((c) => ({ ...c, path: splatPath(c.seed) }));
	const dropColors = [PAINT.teal, PAINT.mustard, PAINT.rust, PAINT.ink];
	const btnDrops = droplets(67, 8, 0.8).map((d, i) => ({ ...d, color: dropColors[i % 4] }));

	type Status = 'idle' | 'loading' | 'done' | 'error';

	let status: Status = 'idle';
	let themeInput = '';
	let generatedHtml = '';
	let controller: AbortController | null = null;
	let promptOpen = false;

	// Preview of the creative brief (first line of the stream), shown while the page builds
	type BriefPreview = {
		conceptName?: string;
		interpretation?: string;
		palette?: string[];
		fonts?: string[];
	};
	let brief: BriefPreview | null = null;
	let received = 0;
	// Build model picker. "fast" = Sonnet (default), "best" = Opus.
	type Quality = 'fast' | 'best';
	const QUALITY_OPTIONS: { value: Quality; model: string }[] = [
		{ value: 'fast', model: 'Sonnet' },
		{ value: 'best', model: 'Opus' }
	];
	let quality: Quality = 'fast';
	// Rough finished-page size per model, only used to drive the progress bar
	const EXPECTED_CHARS: Record<Quality, number> = { fast: 14000, best: 28000 };
	let activeQuality: Quality = 'fast';
	$: progress = Math.min(0.96, received / EXPECTED_CHARS[activeQuality]);

	let frame: HTMLIFrameElement | null = null;

	// Injected into every generated page: lets it open Pong in the host page and passes
	// keyboard shortcuts up, since key events inside the iframe never reach the parent window.
	const BRIDGE =
		`<script>(()=>{const s=t=>parent.postMessage({source:'nrdc-theme',type:t},'*');
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-nrdc="pong"]');if(b){e.preventDefault();s('pong');}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')s('escape');const k=e.key.toLowerCase();if(e.altKey&&e.shiftKey&&(k==='/'||k==='¿')){e.preventDefault();s('extras');}});})();</` +
		'script>';

	function prepareHtml(raw: string): string {
		let html = raw
			.trim()
			.replace(/^```(?:html)?\n?/i, '')
			.replace(/\n?```\s*$/i, '');
		// Drop any stray preamble before the document starts
		const start = html.search(/<!doctype html|<html/i);
		if (start > 0) html = html.slice(start);
		const end = html.toLowerCase().lastIndexOf('</html>');
		if (start < 0 || end < 0) throw new Error('Truncated response');
		html = html.slice(0, end + 7);
		const bodyClose = html.toLowerCase().lastIndexOf('</body>');
		return bodyClose >= 0
			? html.slice(0, bodyClose) + BRIDGE + html.slice(bodyClose)
			: html.replace(/<\/html>$/i, BRIDGE + '</html>');
	}

	function handleFrameMessage(e: MessageEvent) {
		if (!frame || e.source !== frame.contentWindow) return;
		const type =
			(e.data as { source?: string; type?: string })?.source === 'nrdc-theme' && e.data.type;
		if (type === 'pong' || type === 'extras') {
			// Move keyboard focus out of the iframe so Pong's window key listeners (and Escape) work
			frame.blur();
			window.focus();
		}
		if (type === 'pong') {
			extrasStore.openExtras();
			extrasStore.openPong();
		} else if (type === 'extras') {
			extrasStore.openExtras();
		} else if (type === 'escape') {
			if ($extrasStore.showPong) extrasStore.closePong();
			else if ($extrasStore.open) extrasStore.closeExtras();
		}
	}

	async function generate() {
		const trimmed = themeInput.trim();
		if (!trimmed) return;
		status = 'loading';
		promptOpen = false;
		brief = null;
		received = 0;
		activeQuality = quality;
		controller = new AbortController();
		try {
			const res = await fetch('/api/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ theme: trimmed, locale: $locale ?? 'en', quality }),
				signal: controller.signal
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);

			// Stream: first line is a JSON brief preview, the rest is the HTML document
			const reader = res.body!.getReader();
			const decoder = new TextDecoder();
			let buffer = '';
			let briefParsed = false;
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });
				if (!briefParsed) {
					const nl = buffer.indexOf('\n');
					if (nl === -1) continue;
					try {
						brief = JSON.parse(buffer.slice(0, nl));
					} catch {
						brief = null;
					}
					buffer = buffer.slice(nl + 1);
					briefParsed = true;
				}
				received = buffer.length;
			}
			generatedHtml = prepareHtml(buffer);
			status = 'done';
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') {
				status = 'idle';
			} else {
				status = 'error';
			}
		} finally {
			controller = null;
		}
	}

	function cancel() {
		controller?.abort();
		controller = null;
		status = 'idle';
	}

	function redesign() {
		status = 'idle';
		themeInput = '';
		generatedHtml = '';
		promptOpen = false;
		extrasStore.closeExtras();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') generate();
	}

	function closePrompt() {
		promptOpen = false;
		themeInput = '';
		if (status === 'loading') cancel();
		if (status === 'error') status = 'idle';
	}
</script>

<svelte:window on:message={handleFrameMessage} />

<svelte:head>
	<title>Nate Rohweder</title>
	<meta name="description" content="Nate Rohweder Dot Com" />
</svelte:head>

{#if status === 'done'}
	<div class="iframe-wrap" transition:fade={{ duration: 200 }}>
		<iframe
			bind:this={frame}
			title="Themed portfolio"
			srcdoc={generatedHtml}
			sandbox="allow-scripts allow-same-origin allow-top-navigation allow-forms allow-popups"
			class="frame"
		></iframe>
		<button class="redesign-btn" on:click={redesign}>
			{$t('theme.redesign')}
		</button>
	</div>
	{#if $extrasStore.open}
		<ExtrasModal />
	{/if}
{:else}
	{#if status === 'loading'}
		<div class="loading-overlay" transition:fade={{ duration: 150 }}>
			{#if brief?.conceptName}
				<div class="brief" in:fade={{ duration: 400 }}>
					<p class="brief-kicker">{$t('theme.loading.concept')}</p>
					<h2 class="brief-name">{brief.conceptName}</h2>
					{#if brief.interpretation}
						<p class="brief-text">{brief.interpretation}</p>
					{/if}
					{#if brief.palette?.length}
						<div class="swatches" aria-hidden="true">
							{#each brief.palette as hex, i (i)}
								<span class="swatch" style="--c: {hex}; --i: {i}"></span>
							{/each}
						</div>
					{/if}
					{#if brief.fonts?.length}
						<p class="brief-fonts">{brief.fonts.join(' · ')}</p>
					{/if}
				</div>
				<div
					class="progress"
					role="progressbar"
					aria-valuemin="0"
					aria-valuemax="100"
					aria-valuenow={Math.round(progress * 100)}
				>
					<div class="progress-fill" style="transform: scaleX({progress})"></div>
				</div>
				<p>{$t(received > 0 ? 'theme.loading.building' : 'theme.loading.starting')}</p>
				<p class="loading-eta">{$t(`theme.loading.eta.${activeQuality}`)}</p>
			{:else}
				<div class="spinner"></div>
				<p>{$t('theme.loading')}</p>
			{/if}
			<button class="btn-cancel" on:click={cancel}>{$t('theme.skip')}</button>
		</div>
	{/if}

	<!-- Paint-splat "make it yours" button -->
	{#if !promptOpen}
		<button
			class="splat-btn"
			on:click={() => (promptOpen = true)}
			aria-label={$t('theme.button')}
			transition:scale={{ duration: 300, start: 0.6 }}
		>
			{#each btnColors as c}
				<svg
					class="splat-layer color-layer"
					style="--paint: {c.color}; --rot: {c.rot}deg; --dx: {c.dx}px; --dy: {c.dy}px; --delay: {c.delay}ms;"
					viewBox="-100 -100 200 200"
					aria-hidden="true"
				>
					<path d={c.path} />
				</svg>
			{/each}
			{#each btnDrops as d}
				<span
					class="btn-drop"
					style="--paint: {d.color}; --x: {d.x}px; --y: {d.y}px; --s: {d.size}px; --delay: {d.delay}ms;"
					aria-hidden="true"
				></span>
			{/each}
			<svg class="splat-layer ink-layer" viewBox="-100 -100 200 200" aria-hidden="true">
				<path d={inkPath} />
			</svg>
			<span class="splat-label">{$t('theme.button')}</span>
		</button>
	{/if}

	<!-- Prompt card (centered, modal style) -->
	{#if promptOpen}
		<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
		<div class="prompt-backdrop" on:click={closePrompt} transition:fade={{ duration: 200 }}></div>
		<div class="prompt-card" transition:scale={{ duration: 250, start: 0.9 }}>
			<button class="btn-close" on:click={closePrompt} aria-label="Close">
				<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
					<path
						d="M1 1l12 12M13 1L1 13"
						stroke="currentColor"
						stroke-width="1.75"
						stroke-linecap="round"
					/>
				</svg>
			</button>
			{#if status === 'error'}
				<p class="error-msg">{$t('theme.error')}</p>
			{/if}
			<div class="headline-row">
				<h2 class="headline">{$t('theme.headline')}</h2>
				<span class="beta-badge">beta</span>
			</div>
			<p class="subheadline">{$t('theme.subheadline')}</p>
			<div class="quality" role="radiogroup" aria-label={$t('theme.quality.label')}>
				{#each QUALITY_OPTIONS as opt (opt.value)}
					<label class="quality-opt" class:selected={quality === opt.value}>
						<input
							type="radio"
							name="quality"
							value={opt.value}
							bind:group={quality}
							disabled={status === 'loading'}
						/>
						<span class="quality-name">{$t(`theme.quality.${opt.value}`)}</span>
						<span class="quality-meta">{opt.model} · {$t(`theme.quality.${opt.value}.time`)}</span>
					</label>
				{/each}
			</div>
			<div class="input-row">
				<input
					type="text"
					bind:value={themeInput}
					placeholder={$t('theme.placeholder')}
					on:keydown={handleKeydown}
					disabled={status === 'loading'}
				/>
				<button
					class="btn-generate"
					on:click={generate}
					disabled={status === 'loading' || !themeInput.trim()}
				>
					{$t('theme.generate')}
				</button>
			</div>
		</div>
	{/if}
{/if}

<style>
	/* ── "Make it yours" splat button ── */
	.splat-btn {
		position: fixed;
		bottom: 1.25rem;
		left: 1.25rem;
		z-index: 10;
		width: 112px;
		height: 112px;
		padding: 0;
		border: none;
		border-radius: 50%;
		background: transparent;
		cursor: pointer;
		display: grid;
		place-items: center;
		transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.splat-btn:active {
		transform: scale(0.9);
		transition-duration: 0.1s;
	}

	.splat-btn:focus-visible {
		outline: 2px solid white;
		outline-offset: 6px;
	}

	.splat-layer {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
		pointer-events: none;
	}

	.ink-layer {
		fill: #1f2326;
		transform: scale(1.22);
		filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.35));
		animation: ink-breathe 5s ease-in-out infinite;
	}

	/* theme colors hide behind the black, only a sliver peeking out */
	.color-layer {
		fill: var(--paint);
		transform: translate(calc(var(--dx) * 0.35), calc(var(--dy) * 0.35)) rotate(var(--rot))
			scale(1.12);
		transition: transform 0.3s cubic-bezier(0.55, 0, 1, 0.45);
	}

	.splat-btn:hover .color-layer,
	.splat-btn:focus-visible .color-layer {
		transform: translate(var(--dx), var(--dy)) rotate(calc(var(--rot) + 20deg)) scale(1.38);
		transition: transform 0.55s cubic-bezier(0.34, 1.8, 0.5, 1) var(--delay);
	}

	.btn-drop {
		position: absolute;
		left: 50%;
		top: 50%;
		width: var(--s);
		height: var(--s);
		margin: calc(var(--s) / -2) 0 0 calc(var(--s) / -2);
		border-radius: 50%;
		background: var(--paint);
		transform: scale(0);
		opacity: 0;
		transition:
			transform 0.2s ease-in,
			opacity 0.2s ease-in;
		pointer-events: none;
	}

	.splat-btn:hover .btn-drop,
	.splat-btn:focus-visible .btn-drop {
		transform: translate(var(--x), var(--y)) scale(1);
		opacity: 1;
		transition:
			transform 0.5s cubic-bezier(0.15, 0.9, 0.3, 1.2) calc(var(--delay) + 60ms),
			opacity 0.1s linear calc(var(--delay) + 60ms);
	}

	.splat-label {
		position: relative;
		max-width: 64px;
		font-size: 0.8rem;
		font-weight: 700;
		line-height: 1.05;
		letter-spacing: 0.01em;
		text-align: center;
		text-transform: lowercase;
		color: white;
		user-select: none;
		transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.splat-btn:hover .splat-label,
	.splat-btn:focus-visible .splat-label {
		transform: rotate(-6deg) scale(1.08);
	}

	@keyframes ink-breathe {
		0%,
		100% {
			transform: scale(1.22) rotate(0deg);
		}
		50% {
			transform: scale(1.27) rotate(5deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ink-layer {
			animation: none;
		}

		.color-layer,
		.btn-drop,
		.splat-label {
			transition-duration: 0.01ms !important;
			transition-delay: 0s !important;
		}
	}

	/* ── Prompt backdrop ── */
	.prompt-backdrop {
		position: fixed;
		inset: 0;
		z-index: 19;
		background: rgba(0, 0, 0, 0.35);
		backdrop-filter: blur(2px);
		-webkit-backdrop-filter: blur(2px);
	}

	/* ── Prompt card ── */
	.prompt-card {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 20;
		background: rgba(255, 255, 255, 0.3);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid rgba(255, 255, 255, 0.7);
		border-radius: 1.5rem;
		padding: 2rem 2rem 1.75rem;
		width: min(420px, calc(100vw - 3rem));
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		box-shadow:
			0 12px 48px rgba(0, 0, 0, 0.15),
			0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.btn-close {
		position: absolute;
		top: 0.875rem;
		right: 0.875rem;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 1px solid rgba(0, 0, 0, 0.12);
		background: rgba(255, 255, 255, 0.5);
		color: #555;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			background 0.15s,
			color 0.15s;
		padding: 0;
	}

	.btn-close:hover {
		background: rgba(0, 0, 0, 0.08);
		color: #111;
	}

	.headline-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.beta-badge {
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #fff;
		background: rgba(0, 0, 0, 0.55);
		border: 1px solid rgba(0, 0, 0, 0.15);
		border-radius: 0.3rem;
		padding: 0.2em 0.45em;
		line-height: 1;
		align-self: center;
		margin-top: 0.1rem;
	}

	.headline {
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		color: #111;
		margin: 0;
		line-height: 1.2;
	}

	.subheadline {
		font-size: 0.875rem;
		color: #292929;
		margin: 0;
		line-height: 1.5;
	}

	/* ── Model picker (segmented control) ── */
	.quality {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.25rem;
		padding: 0.25rem;
		border-radius: 0.75rem;
		background: rgba(0, 0, 0, 0.08);
		border: 1px solid rgba(0, 0, 0, 0.08);
	}

	.quality-opt {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		padding: 0.45rem 0.7rem;
		border-radius: 0.55rem;
		cursor: pointer;
		transition:
			background 0.15s,
			box-shadow 0.15s;
	}

	.quality-opt:hover:not(.selected) {
		background: rgba(255, 255, 255, 0.35);
	}

	.quality-opt.selected {
		background: rgba(255, 255, 255, 0.92);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
	}

	.quality-opt:has(input:focus-visible) {
		outline: 2px solid #111;
		outline-offset: 1px;
	}

	.quality-opt input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.quality-name {
		font-size: 0.85rem;
		font-weight: 650;
		color: #111;
		line-height: 1.2;
	}

	.quality-meta {
		font-size: 0.72rem;
		color: #444;
		line-height: 1.2;
	}

	.loading-eta {
		font-size: 0.78rem;
		color: rgba(255, 255, 255, 0.45);
	}

	.input-row {
		display: flex;
		gap: 0.5rem;
		width: 100%;
	}

	input {
		flex: 1;
		padding: 0.625rem 0.875rem;
		border-radius: 0.625rem;
		border: 1.5px solid rgba(0, 0, 0, 0.15);
		background: rgba(255, 255, 255, 0.9);
		font-size: 0.9375rem;
		color: #111;
		outline: none;
		transition: border-color 0.15s;
		min-width: 0;
	}

	input:focus {
		border-color: rgba(0, 0, 0, 0.4);
	}

	input::placeholder {
		color: #999;
	}

	input:disabled {
		opacity: 0.6;
	}

	.btn-generate {
		padding: 0.625rem 1.125rem;
		border-radius: 0.625rem;
		background: #111;
		color: #fff;
		font-size: 0.9rem;
		font-weight: 600;
		border: none;
		cursor: pointer;
		white-space: nowrap;
		transition:
			background 0.15s,
			opacity 0.15s;
	}

	.btn-generate:hover:not(:disabled) {
		background: #333;
	}

	.btn-generate:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.error-msg {
		background: rgba(220, 38, 38, 0.1);
		border: 1px solid rgba(220, 38, 38, 0.25);
		border-radius: 0.5rem;
		padding: 0.625rem 0.875rem;
		color: #b91c1c;
		font-size: 0.875rem;
		line-height: 1.4;
	}

	/* ── Loading overlay ── */
	.loading-overlay {
		position: fixed;
		inset: 0;
		z-index: 50;
		background: rgba(0, 0, 0, 0.65);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1.25rem;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.9375rem;
	}

	.loading-overlay p {
		margin: 0;
	}

	.loading-overlay {
		padding: 1.5rem;
		text-align: center;
	}

	.brief {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
		max-width: 34rem;
	}

	.brief-kicker {
		font-size: 0.7rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.45);
	}

	.brief-name {
		margin: 0;
		font-size: clamp(1.75rem, 5vw, 2.75rem);
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.1;
		color: #fff;
	}

	.brief-text {
		font-size: 0.95rem;
		line-height: 1.55;
		color: rgba(255, 255, 255, 0.7);
	}

	.brief-fonts {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.45);
	}

	.swatches {
		display: flex;
		gap: 0.5rem;
		margin: 0.4rem 0 0.2rem;
	}

	.swatch {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		background: var(--c);
		box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
		animation: swatch-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
		animation-delay: calc(var(--i) * 70ms);
	}

	@keyframes swatch-in {
		from {
			transform: scale(0);
			opacity: 0;
		}
	}

	.progress {
		width: min(18rem, 70vw);
		height: 3px;
		border-radius: 3px;
		background: rgba(255, 255, 255, 0.12);
		overflow: hidden;
		margin-top: 0.75rem;
	}

	.progress-fill {
		height: 100%;
		background: rgba(255, 255, 255, 0.8);
		transform-origin: left;
		transition: transform 0.4s ease-out;
	}

	@media (prefers-reduced-motion: reduce) {
		.swatch {
			animation: none;
		}
	}

	.spinner {
		width: 36px;
		height: 36px;
		border: 2px solid rgba(255, 255, 255, 0.15);
		border-top-color: rgba(255, 255, 255, 0.7);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.btn-cancel {
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.4);
		font-size: 0.8125rem;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		transition: color 0.15s;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.btn-cancel:hover {
		color: rgba(255, 255, 255, 0.7);
	}

	/* ── Done: full-screen iframe ── */
	.iframe-wrap {
		position: fixed;
		inset: 0;
		z-index: 1001;
	}

	.frame {
		width: 100%;
		height: 100%;
		border: none;
		display: block;
	}

	.redesign-btn {
		position: fixed;
		top: 1rem;
		left: 1rem;
		z-index: 1002;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 0.625rem;
		padding: 0.5rem 0.875rem;
		font-size: 0.8125rem;
		font-weight: 600;
		color: #f5f5f5;
		cursor: pointer;
		transition: background 0.15s;
	}

	.redesign-btn:hover {
		background: rgba(0, 0, 0, 0.8);
	}

	/* ── Responsive ── */
	@media (max-width: 785px) {
		.splat-btn {
			bottom: 1rem;
			left: unset;
			right: 1.5rem;
		}
	}

	@media (max-width: 480px) {
		.input-row {
			flex-direction: column;
		}
	}
</style>
