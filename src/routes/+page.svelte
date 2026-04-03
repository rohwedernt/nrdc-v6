<script lang="ts">
	import { t, locale } from 'svelte-i18n';
	import { fade, scale } from 'svelte/transition';
	import { extrasStore } from '$lib/stores/extras';
	import ExtrasModal from '$lib/components/ExtrasModal.svelte';

	type Status = 'idle' | 'loading' | 'done' | 'error';

	let status: Status = 'idle';
	let themeInput = '';
	let generatedHtml = '';
	let controller: AbortController | null = null;
	let promptOpen = false;

	async function generate() {
		const trimmed = themeInput.trim();
		if (!trimmed) return;
		status = 'loading';
		promptOpen = false;
		controller = new AbortController();
		try {
			const res = await fetch('/api/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ theme: trimmed, locale: $locale ?? 'en' }),
				signal: controller.signal
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			generatedHtml = data.html;
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
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') generate();
	}

	function closePrompt() {
		promptOpen = false;
		if (status === 'loading') cancel();
		if (status === 'error') status = 'idle';
	}
</script>

<svelte:head>
	<title>Nate Rohweder</title>
	<meta name="description" content="Nate Rohweder Dot Com" />
</svelte:head>

{#if status === 'done'}
	<div class="iframe-wrap" transition:fade={{ duration: 200 }}>
		<iframe
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
			<div class="spinner"></div>
			<p>{$t('theme.loading')}</p>
			<button class="btn-cancel" on:click={cancel}>{$t('theme.skip')}</button>
		</div>
	{/if}

	<!-- Magical orb button -->
	{#if !promptOpen}
		<button
			class="orb-btn"
			on:click={() => (promptOpen = true)}
			aria-label="Open theme generator"
			transition:scale={{ duration: 300, start: 0.6 }}
		>
			<span class="orb-core"><span class="orb-n">N</span></span>
			<span class="orb-ring ring-1"></span>
			<span class="orb-ring ring-2"></span>
			<span class="orb-ring ring-3"></span>
		</button>
	{/if}

	<!-- Prompt card (centered, modal style) -->
	{#if promptOpen}
		<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
		<div
			class="prompt-backdrop"
			on:click={closePrompt}
			transition:fade={{ duration: 200 }}
		></div>
		<div
			class="prompt-card"
			transition:scale={{ duration: 250, start: 0.9 }}
		>
			<button class="btn-close" on:click={closePrompt} aria-label="Close">
				<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
					<path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
				</svg>
			</button>
			{#if status === 'error'}
				<p class="error-msg">{$t('theme.error')}</p>
			{/if}
			<h2 class="headline">{$t('theme.headline')}</h2>
			<p class="subheadline">{$t('theme.subheadline')}</p>
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
	/* ── Orb button ── */
	.orb-btn {
		position: fixed;
		bottom: 1.5rem;
		left: 1.5rem;
		z-index: 10;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		border: none;
		background: transparent;
		cursor: pointer;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.orb-btn:hover {
		transform: scale(1.2);
	}

	.orb-btn:hover .orb-core {
		box-shadow:
			0 0 24px 8px rgba(24, 180, 204, 0.7),
			0 0 48px 16px rgba(245, 194, 24, 0.45),
			0 0 72px 24px rgba(232, 128, 28, 0.3);
	}

	.orb-btn:hover .ring-1 {
		opacity: 1;
		animation-duration: 1.2s;
	}

	.orb-btn:hover .ring-2 {
		opacity: 0.85;
		animation-duration: 2s;
	}

	.orb-btn:hover .ring-3 {
		opacity: 0.65;
		animation-duration: 2.8s;
	}

	.orb-core {
		position: absolute;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: #0f1c24;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow:
			0 0 16px 4px rgba(24, 180, 204, 0.5),
			0 0 32px 10px rgba(245, 194, 24, 0.3),
			0 0 48px 16px rgba(232, 128, 28, 0.2);
		transition: box-shadow 0.3s ease;
		animation: orb-pulse 3s ease-in-out infinite;
	}

	.orb-n {
		font-size: 1.1rem;
		font-weight: 900;
		line-height: 1;
		letter-spacing: -0.02em;
		background: linear-gradient(135deg, #18B4CC 0%, #F5C218 50%, #E8801C 100%);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		animation: n-spin 6s linear infinite;
		display: block;
		user-select: none;
	}

	.orb-btn:hover .orb-n {
		animation-duration: 2.5s;
	}

	.orb-ring {
		position: absolute;
		border-radius: 50%;
		border: 1.5px solid transparent;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
		pointer-events: none;
		transition: opacity 0.3s ease, animation-duration 0.3s ease;
	}

	.ring-1 {
		width: 48px;
		height: 48px;
		background: conic-gradient(
			from 0deg,
			transparent 0%,
			rgba(24, 180, 204, 0.85) 20%,
			rgba(245, 194, 24, 0.8) 45%,
			rgba(232, 128, 28, 0.65) 65%,
			rgba(24, 180, 204, 0.85) 100%
		);
		-webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #fff calc(100% - 2px));
		mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #fff calc(100% - 2px));
		opacity: 0.85;
		animation-name: spin-cw;
		animation-duration: 2s;
	}

	.ring-2 {
		width: 60px;
		height: 60px;
		background: conic-gradient(
			from 120deg,
			transparent 0%,
			rgba(245, 194, 24, 0.6) 20%,
			rgba(24, 180, 204, 0.55) 45%,
			rgba(28, 43, 53, 0.7) 65%,
			rgba(232, 128, 28, 0.55) 85%,
			transparent 100%
		);
		-webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #fff calc(100% - 2px));
		mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #fff calc(100% - 2px));
		opacity: 0.6;
		animation-name: spin-ccw;
		animation-duration: 3s;
	}

	.ring-3 {
		width: 72px;
		height: 72px;
		background: conic-gradient(
			from 240deg,
			transparent 0%,
			rgba(232, 128, 28, 0.4) 20%,
			rgba(24, 180, 204, 0.45) 45%,
			rgba(245, 194, 24, 0.35) 70%,
			transparent 90%
		);
		-webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 1.5px), #fff calc(100% - 1.5px));
		mask: radial-gradient(farthest-side, transparent calc(100% - 1.5px), #fff calc(100% - 1.5px));
		opacity: 0.45;
		animation-name: spin-cw;
		animation-duration: 4.5s;
	}

	@keyframes spin-cw {
		from { transform: rotate(0deg); }
		to   { transform: rotate(360deg); }
	}

	@keyframes spin-ccw {
		from { transform: rotate(0deg); }
		to   { transform: rotate(-360deg); }
	}

	@keyframes n-spin {
		from { transform: rotate(0deg); }
		to   { transform: rotate(360deg); }
	}

	@keyframes orb-pulse {
		0%, 100% {
			box-shadow:
				0 0 16px 4px rgba(24, 180, 204, 0.5),
				0 0 32px 10px rgba(245, 194, 24, 0.3),
				0 0 48px 16px rgba(232, 128, 28, 0.2);
		}
		50% {
			box-shadow:
				0 0 22px 7px rgba(24, 180, 204, 0.75),
				0 0 44px 14px rgba(245, 194, 24, 0.5),
				0 0 64px 22px rgba(232, 128, 28, 0.35);
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
		transition: background 0.15s, color 0.15s;
		padding: 0;
	}

	.btn-close:hover {
		background: rgba(0, 0, 0, 0.08);
		color: #111;
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
		color: #666;
		margin: 0;
		line-height: 1.5;
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
		transition: background 0.15s, opacity 0.15s;
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

	.spinner {
		width: 36px;
		height: 36px;
		border: 2px solid rgba(255, 255, 255, 0.15);
		border-top-color: rgba(255, 255, 255, 0.7);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
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
	@media (max-width: 480px) {
		.input-row {
			flex-direction: column;
		}

		.orb-btn {
			bottom: 1rem;
			left: 1rem;
		}
	}
</style>
