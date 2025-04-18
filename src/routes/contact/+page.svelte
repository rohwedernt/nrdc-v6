<section class="glass-panel mx-8">
	<h1 class="mb-4 text-end text-4xl">contact</h1>
	<div class="flex flex-col">
		<p class="pt-4 text-xl md:text-2xl">
			<a href="mailto:rohwedernt@gmail.com">Email me</a>,
		</p>
		<p class="pt-4 text-xl md:text-2xl">
			find me on <a
				href="https://www.linkedin.com/in/naterohweder/"
				target="_blank"
				rel="noopener noreferrer">LinkedIn</a
			>,
		</p>
		<p class="pt-4 text-xl md:text-2xl">
			or on <a href="https://github.com/rohwedernt" target="_blank" rel="noopener noreferrer"
				>GitHub</a
			>,
		</p>
		<p class="pt-4 text-xl md:text-2xl">
			and <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">here's my resume</a>
		</p>
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
			padding: 0.5rem;
			min-width: 75vw;
			top: 40%;
		}
	}

	a {
		color: black;
	}

	@media (max-width: 735px) {
		a {
			text-decoration: underline;
			text-decoration-thickness: 1px;
			text-underline-offset: 2px;
		}
		a:hover {
			font-weight: 500;
		}
	}
</style>
