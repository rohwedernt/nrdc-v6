<script>
	import { X } from 'lucide-svelte';
</script>

<section class="glass-panel">
	<div class="flex justify-between">
		<a href="/">
			<X size="36" strokeWidth="1" />
		</a>

		<h1 class="mb-4 text-end text-4xl">about</h1>
	</div>
	<p class="pt-4 md:text-lg">
		I’m a software engineering leader who loves to obsess over ways to get awesome, meaningful stuff into the hands of real human beings. When a team feels the impact of what they’re building, they take pride in what they ship—and that’s when the fun starts. I'm a former developer, process nerd, and lifelong believer that the best engineering cultures are the ones that value both high standards and high trust.
	</p>
	<p class="pt-4 md:text-lg">
		Over the past decade I've led teams across the stack, coached engineers of all levels through growth, helped rewrite
		platforms without (completely) breaking everything, worked side by side with product and design
		teams, overhauled hiring systems and helped organizations find clarity in chaos.
	</p>
	<p class="pt-4 md:text-lg">
		As AI rampages on making a bigger impact on how we get all kinds of things done, the most important stuff we can invest in are still deeply, stubbornly human: trust, curiosity, resilience, empathy, thoughtful leadership—and a willingness to say, “That’s a weird idea… let’s try it,” (before the robots tell us not to).
	</p>
	<p class="pt-4 md:text-lg">
		Away from the keyboard, I'm often writing and recording music—a passion I've been chasing for
		over 20 years. I also love cooking elaborate meals just to use my favorite knife and justify
		caring for my cast iron like it's a member of the family. I am always searching for the next
		historical fiction to read, because apparently I enjoy stress but prefer it set in the 12th
		century. I'm married to an incredible partner, part of a wonderfully chaotic extended family,
		learning Spanish, and always planning the next travel adventure to keep my perspective wide and
		curiosity sharp.
	</p>
</section>

<style>
	.glass-panel {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		min-width: 80vw;
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
			padding-top: 4rem;
			min-width: 100vw;
			min-height: 100vh;
			box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
			border-radius: 0%;
		}
	}
</style>
