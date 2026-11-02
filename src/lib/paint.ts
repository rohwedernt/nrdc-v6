// Shared paint-splat helpers. Everything is seeded so prerendered markup
// matches what the client hydrates.

export const PAINT = {
	teal: '#2b7493',
	mustard: '#d5a021',
	ink: '#1f2326',
	rust: '#d0612c'
} as const;

export function rng(seed: number) {
	let s = seed;
	return () => {
		s = (s * 16807) % 2147483647;
		return (s - 1) / 2147483646;
	};
}

/** Organic splat outline in a -100..100 viewBox: jittered polar points smoothed with Catmull-Rom. */
export function splatPath(seed: number) {
	const rand = rng(seed);
	const n = 24;
	const pts: [number, number][] = [];
	for (let i = 0; i < n; i++) {
		const a = (i / n) * Math.PI * 2 + (rand() - 0.5) * 0.15;
		// a couple of long splashy arms, a few medium bulges, the rest lumpy
		const roll = rand();
		const lobe = roll > 0.9 ? 22 + rand() * 10 : roll > 0.6 ? 6 + rand() * 8 : 0;
		const r = 50 + rand() * 7 + lobe;
		pts.push([Math.cos(a) * r, Math.sin(a) * r]);
	}
	const f = (v: number) => v.toFixed(1);
	let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
	for (let i = 0; i < n; i++) {
		const p0 = pts[(i - 1 + n) % n];
		const p1 = pts[i];
		const p2 = pts[(i + 1) % n];
		const p3 = pts[(i + 2) % n];
		const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
		const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
		d += ` C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
	}
	return d + 'Z';
}

/** Droplets flung outward from a splat's center; x/y are pixel offsets at `spread` scale. */
export function droplets(seed: number, count = 6, spread = 1) {
	const rand = rng(seed * 7 + 3);
	return Array.from({ length: count }, (_, i) => {
		const a = (i / count) * Math.PI * 2 + rand() * 0.8;
		const dist = (70 + rand() * 30) * spread;
		return {
			x: Math.round(Math.cos(a) * dist),
			y: Math.round(Math.sin(a) * dist),
			size: Math.round((5 + rand() * 9) * Math.sqrt(spread)),
			delay: Math.round(60 + rand() * 120)
		};
	});
}
