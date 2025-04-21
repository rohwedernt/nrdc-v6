<script>
	import { X, Send, Linkedin, Github, FileUser } from 'lucide-svelte';
</script>

<section class="glass-panel mx-8">
	<div class="flex justify-between">
		<a href="/">
			<X size="36" strokeWidth="1" />
		</a>

		<h1 class="mb-6 text-end text-4xl">contact</h1>
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
				<p class="mt-2 text-sm text-gray-700">e-mail</p>
			</a>

			<!-- Top Right -->
			<a
				class="contact-item"
				href="https://www.linkedin.com/in/naterohweder/"
				target="_blank"
				rel="noopener noreferrer"
			>
				<Linkedin size="64" strokeWidth="1" />
				<p class="mt-2 text-sm text-gray-700">linkedin</p>
			</a>

			<!-- Bottom Left -->
			<a
				class="contact-item"
				href="https://github.com/rohwedernt"
				target="_blank"
				rel="noopener noreferrer"
			>
				<Github size="64" strokeWidth="1" />
				<p class="mt-2 text-sm text-gray-700">github</p>
			</a>

			<!-- Bottom Right -->
			<a class="contact-item" href="/resume.pdf" target="_blank" rel="noopener noreferrer">
				<FileUser size="64" strokeWidth="1" />
				<p class="mt-2 text-sm text-gray-700">resume</p>
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

		min-width: 35vw;
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
			padding-top: 5rem;
			min-width: 100vw;
			min-height: 100vh;
			box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
			border-radius: 0%;
		}
	}

	.contact-item {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 2rem;
		color: black;
		border-radius: 20px;
	}
	.contact-item:hover {
		font-weight: 700;
		text-decoration: none;
		background-color: rgba(242, 210, 80, 0.4);
	}
</style>
