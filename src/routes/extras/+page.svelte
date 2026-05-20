<script>
	import { X } from 'lucide-svelte';
	import { t } from 'svelte-i18n';
</script>

<section class="glass-panel">
	<div class="flex justify-between">
		<h1 class="mb-6 text-end text-4xl">{$t('extras.title')}</h1>
		<a href="/" class="close-btn">
			<X size={36} strokeWidth={1} />
		</a>
	</div>


	<h2 class="pb-1 text-2xl">{$t('extras.music')}</h2>
	<ul class="list-inside pb-6">
		<li class="pb-1 text-xl">
			<a href="https://nomadic-archive.vercel.app/" target="_blank" rel="noopener noreferrer">{$t('extras.music.nomadic')}</a></li>
		<li class="pb-1 text-xl"><a href="https://rohco.vercel.app/" target="_blank" rel="noopener noreferrer">{$t('extras.music.rohco')}</a></li>
	</ul>

	<h2 class="pb-1 text-2xl">{$t('extras.games')}</h2>
	<a href="/pong" class="pong-btn">
		<div class="pong-screen">
			<div class="mini-pong" aria-hidden="true">
				<div class="mini-scanlines"></div>
				<div class="mini-net"></div>
				<div class="mini-ball"></div>
				<div class="mini-paddle mini-paddle-left"></div>
				<div class="mini-paddle mini-paddle-right"></div>
			</div>
			<div class="scanlines"></div>
			<span class="pong-text">PONG</span>
			<span class="pong-sub">INSERT COIN</span>
		</div>
	</a>
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

		background: rgba(255, 255, 255, 0.7);
		border-radius: 1rem;
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.5), 0 4px 30px rgba(0, 0, 0, 0.3);
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

	a:not(.pong-btn):not(.close-btn) {
		color: black;
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 2px;
	}

	a:not(.pong-btn):not(.close-btn):hover {
		font-weight: 500;
	}

	.close-btn {
		display: inline-flex;
	}

	.close-btn :global(svg) {
		transition: stroke-width 0.15s ease;
	}

	.close-btn:hover :global(svg) {
		stroke-width: 2;
	}

	.pong-btn {
		display: block;
		text-decoration: none;
		margin-top: auto;
		margin-right: auto;
		width: 40%;
		padding-top: .5rem;
	}

	.pong-screen {
		position: relative;
		background: #353535;
		border: 3px solid #333;
		border-radius: 8px;
		box-shadow:
			0 0 0 2px #555,
			0 0 20px rgba(0, 255, 0, 0.25),
			inset 0 0 40px rgba(0, 0, 0, 0.8);
		padding-left: 1.5rem;
		padding-right: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		overflow: hidden;
		transition: box-shadow 0.15s ease;
	}

	.pong-btn:hover .pong-screen {
		box-shadow:
			0 0 0 2px #888,
			0 0 35px rgba(0, 255, 0, 0.5),
			inset 0 0 40px rgba(0, 0, 0, 0.8);
	}

	.scanlines {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			to bottom,
			transparent,
			transparent 2px,
			rgba(0, 0, 0, 0.3) 2px,
			rgba(0, 0, 0, 0.3) 4px
		);
		pointer-events: none;
		z-index: 1;
	}

	.pong-text {
		position: relative;
		z-index: 2;
		font-family: 'Courier New', Courier, monospace;
		font-size: 3.5rem;
		font-weight: 900;
		letter-spacing: 0.3em;
		color: #00ff41;
		text-shadow:
			0 0 8px #00ff41,
			0 0 20px #00ff41,
			0 0 40px #00cc33;
	}

	.pong-sub {
		position: relative;
		z-index: 2;
		font-family: 'Courier New', Courier, monospace;
		font-size: 0.7rem;
		letter-spacing: 0.4em;
		color: #00aa2a;
		text-shadow: 0 0 6px #00aa2a;
		animation: blink 1.2s step-end infinite;
	}

	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0; }
	}

	/* ── Mini pong (hover) ── */
	.mini-pong {
		position: absolute;
		inset: 0;
		background: #2a2a2a;
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
		z-index: 3;
	}

	.pong-btn:hover .mini-pong {
		opacity: 1;
	}

	.mini-scanlines {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			to bottom,
			transparent,
			transparent 2px,
			rgba(0, 0, 0, 0.25) 2px,
			rgba(0, 0, 0, 0.25) 4px
		);
		pointer-events: none;
		z-index: 5;
	}

	.mini-net {
		position: absolute;
		left: 50%;
		top: 0;
		bottom: 0;
		width: 2px;
		transform: translateX(-50%);
		background: repeating-linear-gradient(
			to bottom,
			rgba(0, 255, 65, 0.5) 0px,
			rgba(0, 255, 65, 0.5) 8px,
			transparent 8px,
			transparent 16px
		);
		z-index: 2;
	}

	.mini-ball {
		position: absolute;
		width: 7px;
		height: 7px;
		background: #00ff41;
		border-radius: 50%;
		box-shadow: 0 0 6px #00ff41, 0 0 14px #00cc33;
		z-index: 4;
		animation:
			mini-ball-x 1.35s linear infinite alternate,
			mini-ball-y 0.78s linear infinite alternate;
	}

	.mini-paddle {
		position: absolute;
		width: 5px;
		height: 28px;
		background: #00ff41;
		border-radius: 3px;
		box-shadow: 0 0 5px #00ff41;
		z-index: 4;
	}

	.mini-paddle-left {
		left: 10px;
		animation: mini-paddle-y 0.78s ease-in-out infinite alternate;
		animation-delay: -0.1s;
	}

	.mini-paddle-right {
		right: 10px;
		animation: mini-paddle-y 0.78s ease-in-out infinite alternate-reverse;
		animation-delay: -0.05s;
	}

	@keyframes mini-ball-x {
		from { left: 22px; }
		to { left: calc(100% - 29px); }
	}

	@keyframes mini-ball-y {
		from { top: 10px; }
		to { top: calc(100% - 17px); }
	}

	@keyframes mini-paddle-y {
		from { top: 8px; }
		to { top: calc(100% - 36px); }
	}
</style>
