<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { t } from 'svelte-i18n';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	const W = 600;
	const H = 400;

	const PADDLE_W = 8;
	const PADDLE_H = 50;
	const PADDLE_OFFSET = 16;
	const BALL_R = 5;
	const GREEN = '#00ff41';
	const GREEN_DIM = 'rgba(0, 200, 50, 0.4)';

	let playerY = H / 2 - PADDLE_H / 2;
	let aiY = H / 2 - PADDLE_H / 2;

	let ballX = W / 2;
	let ballY = H / 2;
	let ballSpeedX = 4;
	let ballSpeedY = 3;

	let playerScore = 0;
	let aiScore = 0;

	let upPressed = false;
	let downPressed = false;

	const PLAYER_SPEED = 6;
	const AI_SPEED = 3.2;
	const MAX_SPEED = 11;

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		let animationFrame: number;

		const loop = () => {
			movePlayer();
			moveAI();
			moveBall();
			draw();
			animationFrame = requestAnimationFrame(loop);
		};

		loop();
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		onDestroy(() => {
			cancelAnimationFrame(animationFrame);
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		});
	});

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'ArrowUp') { upPressed = true; e.preventDefault(); }
		if (e.key === 'ArrowDown') { downPressed = true; e.preventDefault(); }
	}

	function handleKeyUp(e: KeyboardEvent) {
		if (e.key === 'ArrowUp') upPressed = false;
		if (e.key === 'ArrowDown') downPressed = false;
	}

	function clamp(v: number, lo: number, hi: number) {
		return Math.max(lo, Math.min(hi, v));
	}

	function movePlayer() {
		if (upPressed) playerY -= PLAYER_SPEED;
		if (downPressed) playerY += PLAYER_SPEED;
		playerY = clamp(playerY, 0, H - PADDLE_H);
	}

	function moveAI() {
		const center = aiY + PADDLE_H / 2;
		if (center < ballY - 6) aiY += AI_SPEED;
		else if (center > ballY + 6) aiY -= AI_SPEED;
		aiY = clamp(aiY, 0, H - PADDLE_H);
	}

	function moveBall() {
		ballX += ballSpeedX;
		ballY += ballSpeedY;

		// Top / bottom walls
		if (ballY - BALL_R <= 0) { ballSpeedY = Math.abs(ballSpeedY); ballY = BALL_R; }
		if (ballY + BALL_R >= H) { ballSpeedY = -Math.abs(ballSpeedY); ballY = H - BALL_R; }

		// Player paddle (left)
		const pRight = PADDLE_OFFSET + PADDLE_W;
		if (
			ballSpeedX < 0 &&
			ballX - BALL_R <= pRight &&
			ballX > PADDLE_OFFSET &&
			ballY + BALL_R >= playerY &&
			ballY - BALL_R <= playerY + PADDLE_H
		) {
			ballSpeedX = Math.abs(ballSpeedX) * 1.06;
			ballX = pRight + BALL_R;
			const rel = (ballY - (playerY + PADDLE_H / 2)) / (PADDLE_H / 2);
			ballSpeedY = rel * 7;
		}

		// AI paddle (right)
		const aiLeft = W - PADDLE_OFFSET - PADDLE_W;
		if (
			ballSpeedX > 0 &&
			ballX + BALL_R >= aiLeft &&
			ballX < aiLeft + PADDLE_W &&
			ballY + BALL_R >= aiY &&
			ballY - BALL_R <= aiY + PADDLE_H
		) {
			ballSpeedX = -Math.abs(ballSpeedX) * 1.06;
			ballX = aiLeft - BALL_R;
			const rel = (ballY - (aiY + PADDLE_H / 2)) / (PADDLE_H / 2);
			ballSpeedY = rel * 7;
		}

		// Cap speed
		const speed = Math.sqrt(ballSpeedX ** 2 + ballSpeedY ** 2);
		if (speed > MAX_SPEED) {
			ballSpeedX = (ballSpeedX / speed) * MAX_SPEED;
			ballSpeedY = (ballSpeedY / speed) * MAX_SPEED;
		}

		// Scoring
		if (ballX + BALL_R < 0) { aiScore++; resetBall(); }
		if (ballX - BALL_R > W) { playerScore++; resetBall(); }
	}

	function resetBall() {
		ballX = W / 2;
		ballY = H / 2;
		const angle = (Math.random() * 40 - 20) * (Math.PI / 180);
		ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * 4;
		ballSpeedY = Math.sin(angle) * 4 || 2;
	}

	function glow(color: string, blur: number) {
		ctx.shadowColor = color;
		ctx.shadowBlur = blur;
	}

	function noGlow() {
		ctx.shadowColor = 'transparent';
		ctx.shadowBlur = 0;
	}

	function draw() {
		// Background
		ctx.fillStyle = '#111';
		ctx.fillRect(0, 0, W, H);

		// Vignette
		const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.85);
		vig.addColorStop(0, 'transparent');
		vig.addColorStop(1, 'rgba(0,0,0,0.5)');
		ctx.fillStyle = vig;
		ctx.fillRect(0, 0, W, H);

		// Center net
		ctx.setLineDash([8, 10]);
		ctx.strokeStyle = 'rgba(0, 255, 65, 0.22)';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(W / 2, 0);
		ctx.lineTo(W / 2, H);
		ctx.stroke();
		ctx.setLineDash([]);

		// Score labels
		ctx.fillStyle = GREEN_DIM;
		ctx.font = '10px "Courier New", monospace';
		ctx.textAlign = 'center';
		ctx.fillText('YOU', W / 4, 18);
		ctx.fillText('CPU', (3 * W) / 4, 18);

		// Scores
		glow(GREEN, 16);
		ctx.fillStyle = GREEN;
		ctx.font = 'bold 40px "Courier New", monospace';
		ctx.fillText(playerScore.toString(), W / 4, 58);
		ctx.fillText(aiScore.toString(), (3 * W) / 4, 58);
		noGlow();

		// Player paddle
		glow(GREEN, 15);
		ctx.fillStyle = GREEN;
		ctx.fillRect(PADDLE_OFFSET, playerY, PADDLE_W, PADDLE_H);

		// AI paddle
		ctx.fillRect(W - PADDLE_OFFSET - PADDLE_W, aiY, PADDLE_W, PADDLE_H);
		noGlow();

		// Ball
		glow(GREEN, 22);
		ctx.fillStyle = GREEN;
		ctx.beginPath();
		ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
		ctx.fill();
		noGlow();

		// Exit hint
		ctx.fillStyle = GREEN_DIM;
		ctx.font = '11px "Courier New", monospace';
		ctx.textAlign = 'center';
		ctx.fillText($t('pong.exit'), W / 2, H - 10);
	}
</script>

<div class="arcade-cabinet">
	<canvas bind:this={canvas} width={W} height={H}></canvas>
	<div class="crt-overlay"></div>
</div>

<style>
	.arcade-cabinet {
		position: relative;
		width: 100%;
		border-radius: 8px;
		overflow: hidden;
		box-shadow:
			0 0 0 3px #3a3a3a,
			0 0 0 5px #1a1a1a,
			0 0 35px rgba(0, 255, 65, 0.5),
			0 0 70px rgba(0, 255, 65, 0.2);
		border: 2px solid #2a2a2a;
	}

	canvas {
		display: block;
		width: 100%;
		height: auto;
	}

	.crt-overlay {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			to bottom,
			transparent,
			transparent 2px,
			rgba(0, 0, 0, 0.1) 2px,
			rgba(0, 0, 0, 0.1) 4px
		);
		pointer-events: none;
	}
</style>
