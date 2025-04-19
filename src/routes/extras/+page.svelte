<section class="glass-panel">
	<h1 class="mb-4 text-end text-4xl">extra stuff</h1>

  <h2 class="text-2xl pb-1">Apps & Projects</h2>
  <ul class="list-inside pb-6">
		<li class="text-xl pb-1">– Previous versions of this site:
			<a href="https://nrdc-v5.vercel.app/" target="_blank" rel="noopener noreferrer">v5</a>, 
			<a href="https://nrdc-v3.vercel.app/" target="_blank" rel="noopener noreferrer">v4</a>, and 
			<a href="https://naterohwederdotcom.vercel.app/" target="_blank" rel="noopener noreferrer">v3</a>
		</li>
		<li class="text-xl pb-1 text-gray-500">– Exercise Challenge (Coming Soon)</li>
    <li class="text-xl pb-1 text-gray-500">– Nutrition Tracker (Coming Soon)</li>
  </ul>

	<h2 class="text-2xl pb-1">Music</h2>
  <ul class="list-inside pb-6">
    <li class="text-xl pb-1">– <a href="https://rohco.vercel.app/">Rohco</a></li>
    <li class="text-xl pb-1">– <a href="https://nomadic-archive.vercel.app/">The Nomadic Archives</a></li>
  </ul>

  <h2 class="text-2xl pb-1">Games</h2>
  <ul class="list-inside pb-6">
    <li class="text-xl pb-1">– Try your luck at a <a href="/sverdle">suspiciously familiar word game</a></li>
    <li class="text-xl pb-1">– Face off with a bouncing dot in <a href="/pong">Pong</a></li>
  </ul>

	<h2 class="pt-1">more coming soon :)</h2>

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

	a {
		color: black;
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 2px;
	}

	a:hover {
		font-weight: 500;
	}
</style>
