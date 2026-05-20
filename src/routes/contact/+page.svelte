<script>
	import { X, Send, Linkedin, Github, FileUser } from 'lucide-svelte';
	import { t } from 'svelte-i18n';
</script>

<section class="glass-panel mx-8">
	<div class="flex justify-between">
		<h1 class="mb-6 text-end text-4xl">{$t('nav.contact')}</h1>
		<a href="/" class="close-btn">
			<X size={36} strokeWidth={1} />
		</a>
	</div>

	<div class="flex w-full flex-grow items-center justify-center">
		<div class="grid h-full w-full grid-cols-2 grid-rows-2 text-center">
			<!-- Top Left -->
			<a
				class="contact-item"
				href="mailto:rohwedernt@gmail.com"
				target="_blank"
				rel="noopener noreferrer"
			>
				<Send size="64" strokeWidth="1" />
				<p class="mt-2 text-sm text-gray-700">{$t('contact.email')}</p>
			</a>

			<!-- Top Right -->
			<a
				class="contact-item"
				href="https://www.linkedin.com/in/naterohweder/"
				target="_blank"
				rel="noopener noreferrer"
			>
				<Linkedin size="64" strokeWidth="1" />
				<p class="mt-2 text-sm text-gray-700">{$t('contact.linkedin')}</p>
			</a>

			<!-- Bottom Left -->
			<a
				class="contact-item"
				href="https://github.com/rohwedernt"
				target="_blank"
				rel="noopener noreferrer"
			>
				<Github size="64" strokeWidth="1" />
				<p class="mt-2 text-sm text-gray-700">{$t('contact.github')}</p>
			</a>

			<!-- Bottom Right -->
			<a class="contact-item" href="/resume.pdf" target="_blank" rel="noopener noreferrer">
				<FileUser size="64" strokeWidth="1" />
				<p class="mt-2 text-sm text-gray-700">{$t('contact.resume')}</p>
			</a>
		</div>
	</div>
</section>

<style>
	.glass-panel {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		min-width: 40vw;
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

		@media (max-width: 735px) {
			padding: 1rem;
			padding-top: 4rem;
			min-width: 100vw;
			min-height: 100vh;
			box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
			border-radius: 0%;
		}
	}

	.close-btn {
		display: inline-flex;
		transition: transform 0.2s ease, color 0.2s ease;
	}

	.close-btn:hover {
		transform: scale(1.25);
		color: #33759a;
	}

	.contact-item {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 2rem;
		color: rgba(20, 20, 20, 0.8);
		border-radius: 20px;
		border: 1px solid transparent;
		background: transparent;
		position: relative;
		overflow: hidden;
		cursor: pointer;
		transition:
			transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
			box-shadow 0.3s ease,
			background-color 0.25s ease,
			color 0.2s ease,
			border-color 0.25s ease;
	}

	/* Diagonal light sweep on hover */
	.contact-item::before {
		content: '';
		position: absolute;
		top: -100%;
		left: -75%;
		width: 50%;
		height: 300%;
		background: linear-gradient(
			105deg,
			transparent 40%,
			rgba(255, 255, 255, 0.18) 50%,
			transparent 60%
		);
		transition: left 0.55s ease;
		pointer-events: none;
	}

	.contact-item:hover::before {
		left: 150%;
	}

	.contact-item:hover {
		text-decoration: none;
		background-color: #33759a;
		color: white;
		transform: translateY(-8px) scale(1.03);
		box-shadow:
			0 24px 48px rgba(42, 100, 138, 0.5),
			0 8px 20px rgba(30, 80, 110, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.contact-item p {
		transition: color 0.2s ease;
	}

	.contact-item:hover p {
		color: white;
	}

	.contact-item :global(svg) {
		transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.contact-item:hover :global(svg) {
		transform: translateY(-5px) scale(1.15);
	}
</style>
