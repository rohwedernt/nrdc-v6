import { error } from '@sveltejs/kit';
import Anthropic from '@anthropic-ai/sdk';
import type { RequestHandler } from './$types';
import { ANTHROPIC_API_KEY, UNSPLASH_ACCESS_KEY } from '$env/static/private';
import en from '../../../locales/en.json';

export const prerender = false;

// Increase Vercel serverless function timeout to the Hobby plan maximum.
// The default (10 s) is far too short for Claude to generate a full HTML document.
export const config = { maxDuration: 60 };

const CONTACT = {
	email: 'nrohweder@gmail.com',
	linkedin: 'https://www.linkedin.com/in/naterohweder/',
	github: 'https://github.com/nrohweder',
	resume: '/resume.pdf'
};

// ── Unsplash rate-limit budget ────────────────────────────────────────────────
// Demo tier: 50 requests/hour shared across all users of this app.
// Hard cap: 1 primary hero image + MAX_EXTRA_IMAGES section images per generation.
// A single-page portfolio doesn't benefit from more than 3 photos total.
const MAX_EXTRA_IMAGES = 2; // primary (1) + extras (2) = 3 Unsplash requests max

// ── Step 1: Extract image search queries from the vibe prompt ────────────────
// Uses Haiku for fast, cheap structured JSON output.

interface ImageQueries {
	imageQueries: string[];
	primaryQuery: string;
}

async function extractImageQueries(client: Anthropic, theme: string): Promise<ImageQueries> {
	const message = await client.messages.create({
		model: 'claude-haiku-4-5-20251001',
		max_tokens: 256,
		messages: [
			{
				role: 'user',
				content:
					`For a personal portfolio website themed around "${theme}", return a JSON object with:\n` +
					`- imageQueries: exactly ${MAX_EXTRA_IMAGES} specific, photogenic Unsplash search terms (concrete nouns/scenes, not adjectives)\n` +
					`- primaryQuery: the single best query for a large hero or background image\n\n` +
					`Return ONLY valid JSON, no explanation.\n` +
					`Example: {"imageQueries":["wooden cabin interior","morning fog trees"],"primaryQuery":"misty pine forest"}`
			}
		]
	});

	const block = message.content[0];
	if (block.type !== 'text') throw new Error('Unexpected response from keyword extraction');

	const cleaned = block.text.trim().replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
	const parsed = JSON.parse(cleaned) as { imageQueries: unknown; primaryQuery: unknown };

	return {
		imageQueries: (parsed.imageQueries as string[]).slice(0, MAX_EXTRA_IMAGES),
		primaryQuery: parsed.primaryQuery as string
	};
}

// ── Step 2: Translate theme prompt to English ────────────────────────────────
// Site generation always uses English content. If the user described their theme
// in Spanish, translate it so image queries and AI design direction stay accurate.

async function translateThemeToEnglish(client: Anthropic, theme: string): Promise<string> {
	const message = await client.messages.create({
		model: 'claude-haiku-4-5-20251001',
		max_tokens: 100,
		messages: [
			{
				role: 'user',
				content: `Translate this website theme description to English. Return ONLY the translated text, nothing else: "${theme}"`
			}
		]
	});
	const block = message.content[0];
	if (block.type !== 'text') return theme;
	return block.text.trim();
}

// ── Step 4: Fetch images from Unsplash ───────────────────────────────────────
// Unsplash API guidelines require attribution. The generated pages are ephemeral previews;
// for a permanent deployment consider adding "Photos from Unsplash" to the generated footer.

interface UnsplashImage {
	query: string;
	url: string;
	alt: string;
}

async function fetchUnsplashImages(
	primaryQuery: string,
	imageQueries: string[]
): Promise<{ primary: UnsplashImage | null; extras: UnsplashImage[] }> {
	if (!UNSPLASH_ACCESS_KEY) {
		return { primary: null, extras: [] };
	}

	const fetchOne = async (query: string): Promise<UnsplashImage | null> => {
		try {
			const res = await fetch(
				`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
				{ headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
			);
			if (!res.ok) return null;
			const data = (await res.json()) as { results: { urls: { regular: string }; alt_description: string | null }[] };
			const photo = data.results?.[0];
			if (!photo) return null;
			return { query, url: photo.urls.regular, alt: photo.alt_description ?? query };
		} catch {
			return null; // Fail silently — images are an enhancement, not a requirement
		}
	};

	// Fetch primary + extras in parallel — slice enforces the hard cap even if caller passes more
	const [primary, ...extraResults] = await Promise.all([
		fetchOne(primaryQuery),
		...imageQueries.slice(0, MAX_EXTRA_IMAGES).map(fetchOne)
	]);

	return {
		primary: primary ?? null,
		extras: extraResults.filter((img): img is UnsplashImage => img !== null)
	};
}

// ── Step 5: Build the HTML generation prompt ─────────────────────────────────

function buildImageBlock(
	primary: UnsplashImage | null,
	extras: UnsplashImage[]
): string {
	if (!primary && extras.length === 0) return '';

	const lines: string[] = [
		'',
		'REAL PHOTOS — use these Unsplash image URLs directly in <img> tags and CSS background-image:',
		'  Do not use placeholder URLs. Use these exact URLs as-is — they are live and ready to embed.'
	];

	if (primary) {
		lines.push(
			`\n  Primary image (best for hero background or large visual element):`,
			`    URL: ${primary.url}`,
			`    Alt: "${primary.alt}"`
		);
	}

	if (extras.length > 0) {
		lines.push('\n  Additional images (use contextually throughout the layout — do not cluster them):');
		for (const img of extras) {
			lines.push(`    • Query "${img.query}" → URL: ${img.url} | Alt: "${img.alt}"`);
		}
	}

	lines.push(
		'',
		'  Image usage guidance:',
		'    • Hero/background: use primary as CSS background-image with a color overlay for text legibility',
		'    • Section accents: use extras as full-bleed section backgrounds or inline <img> elements',
		'    • Always set object-fit: cover and a meaningful alt attribute on <img> tags',
		'    • Apply a semi-transparent color overlay (rgba) over images so text stays readable',
		'    • Space images throughout the layout — do not place all images in one section',
		'    • If an image does not suit a section, skip it rather than forcing a bad fit'
	);

	return lines.join('\n');
}

// Generated pages are always in English — the portfolio content is English,
// and the user's theme prompt is translated to English before reaching here.
function buildPrompt(
	theme: string,
	primary: UnsplashImage | null,
	extras: UnsplashImage[]
): string {
	const t = en;

	return `You are an expert web designer and front-end developer. Build a complete, modern, beautifully designed personal portfolio page themed around: "${theme}".

CONTENT — include all of this exactly as written:

  Name: render as "Hi, I'm Nate" — use this exact phrasing as the primary heading, not "Nate Rohweder"
  Tagline: Engineering leader. Team builder. Lifelong learner.
  Location: Denver, Colorado (do NOT include availability or open-to-work status — he is not looking for work)

  Contact links (render as subtle pill/badge links, never a nav bar):
    - Label: "${t['contact.email']}"  →  href="mailto:${CONTACT.email}"
    - Label: "${t['contact.linkedin']}"  →  href="${CONTACT.linkedin}" target="_blank" rel="noopener"
    - Label: "${t['contact.github']}"  →  href="${CONTACT.github}" target="_blank" rel="noopener"
    - Label: "${t['contact.resume']}"  →  href="${CONTACT.resume}" target="_blank" rel="noopener"

  Biography — four paragraphs, all four, in this order:
    1. ${t['about.p1']}
    2. ${t['about.p2']}
    3. ${t['about.p3']}
    4. ${t['about.p4']}
${buildImageBlock(primary, extras)}

LAYOUT — choose whatever structure best expresses "${theme}":
  Think like a designer, not a template filler. Reference the quality of Linear, Stripe, or
  high-end portfolio sites. Available layout techniques — choose the ones that fit the vibe:
    • "editorial-columns": asymmetric two-column with large pull quotes
    • "bento-grid": irregular grid of varying-height cards (think Apple Intelligence page)
    • "sticky-scroll": sections that pin and transition as user scrolls
    • "full-bleed-image": image extends to viewport edge, text overlaid with gradient scrim
    • "magazine-hero": large image left, headline typography stacked right
    • "kinetic-type": headline text with CSS animation (letter-spacing expand, color shift)
  Whatever you choose: generous whitespace, strong typographic hierarchy, restrained color use.
  The layout itself should feel intentional — not centred-everything, not left-aligned-everything.
${primary ? `  The primary image works well as a full-bleed hero background — overlay with a dark/colored\n  gradient so the heading remains legible.` : ''}

You have access to these reference sites known for exceptional design quality.
Study their patterns when generating layouts:
- https://stripe.com — best-in-class section rhythm, subtle gradients, trust signals
- https://craft.do — warm, editorial, generous whitespace
- https://vercel.com — bold hero sections, monochromatic restraint
- https://www.vouschurch.com/ - awesome layout
- https://www.dariusguerrero.com/ - big, bold blocks of color
- https://chester.how/ - artsy
- https://1chooo.com/ - very simple and clean

SVGs — use 2–3 inline SVGs to make the page visually exciting and unmistakably themed:
  This is your biggest opportunity to make the design feel alive. Be ambitious.

  GREAT — geometric, patterned, decorative:
    • Intricate repeating geometric patterns (tile motifs, tessellations, step patterns)
    • Cultural/historical line-art motifs rendered as clean geometric paths
    • A full-width section divider built from geometric shapes — chevrons, waves, stepped forms
    • A background grid or mesh of fine lines that forms a thematic pattern
    • Scattered small geometric symbols (dots, diamonds, crosses, runes) as a field of accents
    • "cursor-field": interactive dot/grid background that responds to mouse movement. Use ONLY for tech, creative, portfolio, or playful vibes. Never use for luxury, wellness, food, or editorial vibes.

  ALSO GOOD — atmospheric depth:
    • Radial gradient wash as a subtle background glow
    • Layered semi-transparent shapes building up depth

  BAD — do not generate these:
    • Any solid-color opaque rectangle used as a decorative panel — looks like a broken image
    • Naturalistic clip-art: cartoon animals, illustrated creatures, realistic object drawings
      (a geometric dog-paw pattern: fine; a cartoon dog with eyes and fur: not fine)
    • feTurbulence noise on large opaque shapes — the result looks broken and unintentional
		• fLinear gradients that go left-to-right with two similar colors
		• Font sizes that don't have enough contrast between heading and body (minimum 2x ratio)

  Placement ideas: full-bleed hero background, large corner accent behind the name,
  decorative border between sections, a centered mandala behind the bio text at low opacity.
  Size and opacity: prominent decorative elements can be fully opaque and large if they're
  clearly geometric/ornamental — the rule is no accidental clip-art, not no visual presence.
${primary ? `\n  When a real photo is used as a hero background, prefer SVGs as section dividers or\n  decorative borders rather than another large background element — don't compete with the photo.` : ''}

CONTENT DISCIPLINE:
  • Render ONLY the content listed above — do not invent additional text, labels, or callouts
    (no extracted bio highlights, no "passions" lists, no summary blurbs you wrote yourself)
  • The CONTENT section above is the complete and final content for the page

TYPOGRAPHY & DETAIL:
  • No ::first-letter drop caps — they look dated and break layout on some paragraph starts
  • No min-height: 100vh on the hero unless content genuinely fills that space — avoid dead zones
  • CSS custom properties (:root variables) for the full color palette
  • No redundant content in the footer that already appears in the hero (e.g. name + location)

TECHNICAL REQUIREMENTS:
  • Complete HTML document: <!DOCTYPE html> through </html>, lang="en"
  • Import 1–2 Google Fonts via @import in <style> that match the theme's personality
  • Both html AND body must carry the theme background (no default white bleed on scroll)
  • Fully responsive: clamp() for fluid type sizes, flex-wrap on badge rows, no horizontal overflow
  • Hover transitions on interactive elements; no CSS @keyframes
  • Biography text: line-height 1.75+, comfortable font-size, max-width ~65ch for readability
  • Contact links: small rounded chips — subtle at rest, slightly bolder on hover

OUTPUT: Return ONLY the complete HTML document. No markdown fences, no explanation.
  IMPORTANT: The document MUST end with </html>. Budget your output — prioritize a complete,
  valid document over SVG complexity. If running long, simplify SVGs rather than truncating HTML.
  SVG CORRECTNESS: use <path d="..."> for complex shapes, <polyline points="x,y x,y"> (space-separated
  coordinate pairs only) for polylines, <polygon> for closed shapes. Do not mix path syntax into
  points attributes.`;
}

// ── Request handler ───────────────────────────────────────────────────────────

export const POST: RequestHandler = async ({ request }) => {
	if (!ANTHROPIC_API_KEY) {
		throw error(500, 'ANTHROPIC_API_KEY is not configured');
	}

	const { theme, locale } = (await request.json()) as { theme: string; locale: 'en' | 'es' };

	if (!theme || typeof theme !== 'string' || theme.trim().length === 0) {
		throw error(400, 'theme is required');
	}

	const safeTheme = theme.trim().slice(0, 500);
	const safeLocale: 'en' | 'es' = locale === 'es' ? 'es' : 'en';

	console.log(`[generate] theme="${safeTheme}" locale=${safeLocale}`);

	const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

	// Step 1: Translate theme to English if the user typed it in Spanish.
	// Generation always uses English content; translating ensures the AI interprets
	// the vibe correctly and image search queries are accurate.
	let englishTheme = safeTheme;
	if (safeLocale === 'es') {
		try {
			englishTheme = await translateThemeToEnglish(client, safeTheme);
			console.log(`[generate] translated theme="${englishTheme}"`);
		} catch {
			// Non-fatal — use the original theme
		}
	}

	// Step 2: Extract image queries (fast Haiku call)
	// Falls back to no images if extraction fails
	let primary: UnsplashImage | null = null;
	let extras: UnsplashImage[] = [];

	if (UNSPLASH_ACCESS_KEY) {
		try {
			const { primaryQuery, imageQueries } = await extractImageQueries(client, englishTheme);
			({ primary, extras } = await fetchUnsplashImages(primaryQuery, imageQueries));
		} catch {
			// Non-fatal — continue without images
		}
	}

	// Step 3: Stream the full HTML with images injected into the prompt.
	// Streaming sends response headers immediately, which prevents Vercel's gateway
	// from issuing a 504 while Claude is still generating the document.
	const claudeStream = client.messages.stream({
		model: 'claude-sonnet-4-6',
		max_tokens: 8000,
		system:
			'You are a creative web designer who builds visually exciting, theme-driven portfolio pages. ' +
			'Keep total output under 14,000 characters. Use CSS custom properties for the color palette. ' +
			(primary
				? 'Real photos are provided — use them as CSS background-image or <img> src values. ' +
				  'Layer color overlays over hero images so text stays legible. '
				: '') +
			'SVGs should be bold and expressive — geometric patterns, decorative motifs, intricate line art — ' +
			'NOT naturalistic clip-art illustrations or solid opaque rectangles. ' +
			'A complete, polished document is more valuable than unfinished SVG complexity.',
		messages: [
			{
				role: 'user',
				content: buildPrompt(englishTheme, primary, extras)
			}
		]
	});

	const encoder = new TextEncoder();
	const readable = new ReadableStream({
		async start(controller) {
			try {
				for await (const event of claudeStream) {
					if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
						controller.enqueue(encoder.encode(event.delta.text));
					}
				}
			} catch (err) {
				controller.error(err);
				return;
			}
			controller.close();
		},
		cancel() {
			claudeStream.abort();
		}
	});

	return new Response(readable, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'X-Content-Type-Options': 'nosniff',
			'Cache-Control': 'no-store'
		}
	});
};
