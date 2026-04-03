<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { t } from 'svelte-i18n';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	const width = 600;
	const height = 400;

	let paddleY = height / 2 - 40;
	const paddleWidth = 10;
	const paddleHeight = 80;

	let ballX = width / 2;
	let ballY = height / 2;
	let ballRadius = 8;
	let ballSpeedX = 3;
	let ballSpeedY = 3;

	let score = 0;

	let upPressed = false;
	let downPressed = false;

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		let animationFrame: number;

		const update = () => {
			movePaddle();
			moveBall();
			draw();
			animationFrame = requestAnimationFrame(update);
		};

		update();

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		onDestroy(() => {
			cancelAnimationFrame(animationFrame);
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		});
	});

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'ArrowUp') upPressed = true;
		if (e.key === 'ArrowDown') downPressed = true;
	}

	function handleKeyUp(e: KeyboardEvent) {
		if (e.key === 'ArrowUp') upPressed = false;
		if (e.key === 'ArrowDown') downPressed = false;
	}

	function movePaddle() {
		if (upPressed) paddleY -= 5;
		if (downPressed) paddleY += 5;
		paddleY = Math.max(0, Math.min(height - paddleHeight, paddleY));
	}

	function moveBall() {
		ballX += ballSpeedX;
		ballY += ballSpeedY;

		if (ballY - ballRadius <= 0 || ballY + ballRadius >= height) {
			ballSpeedY *= -1;
		}

		if (ballX + ballRadius >= width) {
			ballSpeedX *= -1;
		}

		if (ballX - ballRadius <= paddleWidth && ballY >= paddleY && ballY <= paddleY + paddleHeight) {
			ballSpeedX *= -1;
			ballX = paddleWidth + ballRadius;
			score += 1;
			ballSpeedX *= 1.1;
			ballSpeedY *= 1.1;
		}

		if (ballX < 0) {
			resetGame();
		}
	}

	function resetGame() {
		ballX = width / 2;
		ballY = height / 2;
		ballSpeedX = 3;
		ballSpeedY = 3;
		score = 0;
	}

	function draw() {
		ctx.clearRect(0, 0, width, height);

		ctx.fillStyle = '#333';
		ctx.fillRect(0, paddleY, paddleWidth, paddleHeight);

		ctx.beginPath();
		ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
		ctx.fillStyle = '#0095DD';
		ctx.fill();
		ctx.closePath();

		ctx.fillStyle = '#444';
		ctx.font = '16px monospace';
		ctx.fillText($t('pong.score') + ' ' + score, 10, 20);

		ctx.fillStyle = '#888';
		ctx.font = '12px monospace';
		ctx.fillText($t('pong.exit'), width - 100, 20);
	}
</script>

<canvas bind:this={canvas} {width} {height}></canvas>

<style>
	canvas {
		display: block;
		max-width: 100%;
		height: auto;
		border-radius: 0.5rem;
		border: 1px solid rgba(255, 255, 255, 0.3);
		box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
		background: rgba(255, 255, 255, 0.75);
	}
</style>
