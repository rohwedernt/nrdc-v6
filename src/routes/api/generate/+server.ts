import { error } from '@sveltejs/kit';
import Anthropic from '@anthropic-ai/sdk';
import type { RequestHandler } from './$types';
import { ANTHROPIC_API_KEY, UNSPLASH_ACCESS_KEY } from '$env/static/private';
import en from '../../../locales/en.json';
import es from '../../../locales/es.json';

export const prerender = false;

// Measured end to end: Sonnet ~40–50 s, Opus 2.5–3.5 min. 300 s is the Hobby ceiling
// with Fluid compute (default for Vercel projects since 2025) and is required for Opus.
export const config = { maxDuration: 300 };

// ── Models ────────────────────────────────────────────────────────────────────
// The brief is a small structured-JSON call, so it runs on the fastest model.
// The build model is the visitor's choice in the prompt card: "fast" (Sonnet, the
// default) or "best" (Opus, richer pages but a much longer wait). Only these two
// values are accepted; anything else falls back to fast.
const BRIEF_MODEL = 'claude-haiku-5-5';
const BUILD_MODELS = {
	fast: 'claude-sonnet-5-5',
	best: 'claude-opus-5-5'
} as const;
type Quality = keyof typeof BUILD_MODELS;
const BUILD_EFFORT: 'low' | 'medium' | 'high' = 'medium';

const CONTACT = {
	email: 'nrohweder@gmail.com',
	linkedin: 'https://www.linkedin.com/in/naterohweder/',
	github: 'https://github.com/nrohweder',
	resume: '/resume.pdf'
};

const MUSIC = {
	rohco: 'https://rohco.vercel.app/',
	nomadic: 'https://nomadic-archive.vercel.app/'
};

// Unsplash demo tier: 50 requests/hour shared by every visitor.
// Hard cap per generation: 1 hero + MAX_EXTRA_IMAGES.
const MAX_EXTRA_IMAGES = 2;

type Locale = 'en' | 'es';

// ── Step 1: Creative brief ───────────────────────────────────────────────────
// One fast call that works out what the prompt *means* visually before any HTML
// gets written. It replaces the old separate translate + image-query calls, and the
// client shows the concept name + palette while the page builds.

interface Brief {
	englishTheme: string;
	interpretation: string;
	conceptName: string;
	palette: { name: string; hex: string; role: string }[];
	displayFont: string;
	bodyFont: string;
	layout: string;
	signatureMoves: string[];
	motion: string;
	sectionLabels: { about: string; contact: string; extras: string };
	useImages: boolean;
	primaryImageQuery: string;
	imageQueries: string[];
}

const BRIEF_SCHEMA = {
	type: 'object',
	additionalProperties: false,
	required: [
		'englishTheme',
		'interpretation',
		'conceptName',
		'palette',
		'displayFont',
		'bodyFont',
		'layout',
		'signatureMoves',
		'motion',
		'sectionLabels',
		'useImages',
		'primaryImageQuery',
		'imageQueries'
	],
	properties: {
		englishTheme: { type: 'string' },
		interpretation: { type: 'string' },
		conceptName: { type: 'string' },
		palette: {
			type: 'array',
			items: {
				type: 'object',
				additionalProperties: false,
				required: ['name', 'hex', 'role'],
				properties: {
					name: { type: 'string' },
					hex: { type: 'string' },
					role: { type: 'string' }
				}
			}
		},
		displayFont: { type: 'string' },
		bodyFont: { type: 'string' },
		layout: { type: 'string' },
		signatureMoves: { type: 'array', items: { type: 'string' } },
		motion: { type: 'string' },
		sectionLabels: {
			type: 'object',
			additionalProperties: false,
			required: ['about', 'contact', 'extras'],
			properties: {
				about: { type: 'string' },
				contact: { type: 'string' },
				extras: { type: 'string' }
			}
		},
		useImages: { type: 'boolean' },
		primaryImageQuery: { type: 'string' },
		imageQueries: { type: 'array', items: { type: 'string' } }
	}
} as const;

const BRIEF_SYSTEM = `You are the creative director for a one-page personal website. A visitor types any prompt (a mood, a color, a place, a film director, a band, an era, a food, a single emoji, a joke) and the site is redesigned around it. You write the design brief that a designer will build from. Your job is to work out what the prompt means visually and commit to it.

First identify what kind of prompt it is, then mine it for its real visual language:
- A person or creator (director, artist, musician, author): their signature aesthetic. Composition, palette, typography, recurring motifs. Wes Anderson means centered symmetry, pastel blocks, Futura, chapter cards, dollhouse framing. Not just "film".
- A place: its materials, signage, light, architecture, typography (transit maps, shop fronts, tiles, maps, stamps).
- An era or movement: its period typography, print processes, layout conventions (Swiss grid, Bauhaus, Y2K chrome, 70s supergraphics, Victorian broadsides).
- A color: build the whole system from that hue (tints, shades, one deliberate counterpoint), and make the color the hero.
- A mood or abstract idea: translate it into tempo, density, contrast, texture and motion.
- An object, food or thing: its materials, packaging, labels, textures, the culture around it.
- Something silly or tiny: take it seriously and make it delightful. Committing to the bit is the point.

Rules:
- Be specific and opinionated. A brief that could fit three different prompts is a failed brief.
- englishTheme: the prompt translated to English if needed, otherwise unchanged.
- interpretation: 1–2 sentences on what the prompt evokes and the angle you are taking.
- conceptName: 2–5 word evocative title for the direction (in the language given as the content language).
- palette: 4–6 colors as #rrggbb hex. Roles: background, surface, text, accent, and so on. Body text against its background must reach WCAG AA contrast (4.5:1).
- displayFont / bodyFont: exact Google Fonts family names that really exist. Pick fonts with character that fit the theme. Avoid Inter, Roboto and Poppins unless the theme is literally about them.
- layout: concrete structure for the four sections (hero, about, contact, extras). Name the composition, the grid, where things sit, and how the page reads as you scroll.
- signatureMoves: exactly 3 concrete details that make the theme unmistakable, such as a CSS/SVG motif, a typographic trick, or an interaction ("contact links styled as luggage tags with a punched hole", "a slow film-grain overlay", "headings set like a subway line diagram").
- motion: the motion personality, plus 1–2 specific animations or interactions.
- sectionLabels: short themed headings (1–4 words) for the about, contact and extras sections, in the content language. They should feel native to the theme ("The Case File", "Dispatches", "B-Sides").
- useImages: true only if real photography would strengthen this theme. Typographic, graphic, color or abstract themes are often better without photos.
- primaryImageQuery and imageQueries (exactly ${MAX_EXTRA_IMAGES}): concrete, photogenic Unsplash search terms in English (nouns and scenes, not adjectives). Fill them even when useImages is false.`;

async function createBrief(client: Anthropic, theme: string, locale: Locale): Promise<Brief> {
	const message = await client.messages.create({
		model: BRIEF_MODEL,
		max_tokens: 4000,
		output_config: {
			effort: 'low',
			format: { type: 'json_schema', schema: BRIEF_SCHEMA as unknown as Record<string, unknown> }
		},
		system: BRIEF_SYSTEM,
		messages: [
			{
				role: 'user',
				content: `Content language: ${locale === 'es' ? 'Spanish' : 'English'}\n\n<prompt>${theme}</prompt>`
			}
		]
	});

	const text = message.content.find((b) => b.type === 'text');
	if (!text || text.type !== 'text') throw new Error('No brief returned');
	const brief = JSON.parse(text.text) as Brief;
	brief.palette = brief.palette.filter((c) => /^#[0-9a-f]{6}$/i.test(c.hex)).slice(0, 6);
	brief.imageQueries = brief.imageQueries.slice(0, MAX_EXTRA_IMAGES);
	brief.signatureMoves = brief.signatureMoves.slice(0, 3);
	return brief;
}

// ── Step 2: Unsplash photos (optional) ───────────────────────────────────────

interface UnsplashImage {
	query: string;
	url: string;
	alt: string;
	credit: string;
	creditUrl: string;
}

async function fetchUnsplashImages(brief: Brief): Promise<UnsplashImage[]> {
	if (!UNSPLASH_ACCESS_KEY || !brief.useImages) return [];

	const fetchOne = async (query: string): Promise<UnsplashImage | null> => {
		try {
			const res = await fetch(
				`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&content_filter=high`,
				{ headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
			);
			if (!res.ok) return null;
			const data = (await res.json()) as {
				results: {
					urls: { regular: string };
					alt_description: string | null;
					user: { name: string; links: { html: string } };
				}[];
			};
			const photo = data.results?.[0];
			if (!photo) return null;
			return {
				query,
				url: photo.urls.regular,
				alt: photo.alt_description ?? query,
				credit: photo.user.name,
				creditUrl: `${photo.user.links.html}?utm_source=nrdc&utm_medium=referral`
			};
		} catch {
			return null; // Images are an enhancement, never a requirement
		}
	};

	const results = await Promise.all(
		[brief.primaryImageQuery, ...brief.imageQueries.slice(0, MAX_EXTRA_IMAGES)].map(fetchOne)
	);
	return results.filter((img): img is UnsplashImage => img !== null);
}

// ── Step 3: Build prompt ─────────────────────────────────────────────────────
// The system prompt holds only stable text (the content plus the craft standards)
// so it can be prompt-cached per locale. Everything theme-specific goes in the
// user message.

function buildSystem(locale: Locale): string {
	const t = locale === 'es' ? es : en;
	const greeting = locale === 'es' ? 'Hola, soy Nate' : "Hi, I'm Nate";
	const tagline =
		locale === 'es'
			? 'Líder de ingeniería. Formador de equipos. Aprendiz de por vida.'
			: 'Engineering leader. Team builder. Lifelong learner.';

	return `You are a world-class web designer and front-end engineer, the kind whose personal sites win awards. You will be given a creative brief for a theme, and you build a single, complete HTML page that is Nate's personal site re-imagined in that theme.

The bar: someone who never saw the prompt should guess the theme within two seconds, and a designer should find nothing to fix. Theme fidelity and craft matter equally.

<content>
Use this content exactly. Never paraphrase, shorten, translate, or skip any of it. Page language: ${locale}.

HERO
- Primary heading: "${greeting}". Use this exact phrasing, not "Nate Rohweder".
- Tagline: "${tagline}"
- Location: "Denver, Colorado". Never mention availability, hiring or open-to-work status; Nate is not looking.

ABOUT: four paragraphs, all four, in this order, verbatim:
1. ${t['about.p1']}
2. ${t['about.p2']}
3. ${t['about.p3']}
4. ${t['about.p4']}

CONTACT: four links
- "${t['contact.email']}" → href="mailto:${CONTACT.email}"
- "${t['contact.linkedin']}" → href="${CONTACT.linkedin}" target="_blank" rel="noopener"
- "${t['contact.github']}" → href="${CONTACT.github}" target="_blank" rel="noopener"
- "${t['contact.resume']}" → href="${CONTACT.resume}" target="_blank" rel="noopener"

EXTRAS: a smaller, playful section
- Heading for a music group: "${t['extras.music']}" with two links:
  - "${t['extras.music.rohco']}" → href="${MUSIC.rohco}" target="_blank" rel="noopener"
  - "${t['extras.music.nomadic']}" → href="${MUSIC.nomadic}" target="_blank" rel="noopener"
- A Pong launcher: a <button type="button" data-nrdc="pong"> whose visible label contains the word "Pong". Make it a fun, themed object (an arcade cabinet, a ticket, a cartridge, a stamp, whatever fits). The host page handles the click: do not write any click handler for it and do not build a Pong game.
</content>

<copy_rules>
- Everything inside <content> is the complete set of facts about Nate. Do not invent facts, skills, quotes, stats, testimonials, dates or claims.
- You may add small themed framing text that carries no facts: the brief's section labels, a decorative kicker or eyebrow ("No. 01", "Side A", "EST. DENVER"), chapter numerals, a themed footer sign-off of a few words. Keep each piece under about six words and keep the total small. It should feel like set dressing, not new content.
- Never present numbers, percentages, ratings, stat readouts or labels as data about Nate ("TRUST 97%", "LEADERSHIP: HIGH", "20+ YRS"). Decorative readouts are fine only when they're clearly about the theme and not about him: a ticking clock, Denver's coordinates, a "No. 01" chapter mark.
- No placeholder text, lorem ipsum, or fake links.
</copy_rules>

<craft>
Theme fidelity:
- Build out every part of the brief: palette, fonts, layout, all three signature moves, motion. Everything on the page should say the theme, including the link styles, the buttons, the dividers, the cursor and the scrollbar where it makes sense, the selection color, and the background.
- Push past the obvious first idea. If the theme is "ocean", don't just make it blue with a wave divider. Think tide charts, nautical flags, porthole frames, sonar pings.
- Draw motifs with CSS (gradients, borders, clip-path, masks, blend modes) and inline SVG (patterns, line art, geometric ornament, textures through small SVG filters). Prefer abstract, geometric or graphic forms. Never draw clumsy literal illustrations (cartoon animals, faces, detailed objects). Stylized silhouettes and iconographic shapes are fine.

Design quality:
- Strong typographic hierarchy: a display heading at least 3× the body size (use clamp()). Body text 17–20px with line-height 1.6–1.8 and a max-width around 65ch.
- Deliberate composition. Use a real grid, asymmetry where it fits, generous and consistent spacing, and clear rhythm between sections. Avoid stacking everything centered in identical cards.
- Color: palette as CSS custom properties on :root. Body text must pass WCAG AA (4.5:1) against whatever it sits on, including over photos, which need a scrim or overlay.
- Avoid generic AI-site defaults unless the brief asks for them: purple-to-blue gradients, glassmorphism cards everywhere, emoji as icons, drop shadows on everything, "modern SaaS" styling.
- The hero should not leave a dead zone. If it is full-height, it has to be fully composed.
- No ::first-letter drop caps.

Motion and interaction:
- Use @keyframes, transitions, and a small amount of vanilla JS (for example IntersectionObserver scroll reveals, pointer-reactive effects, a typewriter, a parallax layer). Keep total JS under about 80 lines with no external libraries.
- Every link and button needs hover and :focus-visible states that fit the theme.
- Wrap all non-essential animation in @media (prefers-reduced-motion: no-preference), or disable it under reduce.
- Content must be visible even if JS fails. Scroll reveals should only hide elements after JS adds a class to <html>.
- All text must end fully visible and readable within about 1.5s of entering the viewport. Keep entrance animations simple and robust: opacity/transform transitions or keyframes of 200ms or longer with explicit end states. Don't split headings into per-character spans animated with tiny or stepped durations; browsers can leave those stuck invisible. If you want a typewriter feel, animate a clip-path or width reveal on the whole heading.

Technical:
- One complete document from <!DOCTYPE html> to </html>, with <html lang="${locale}">, meta charset and viewport.
- Load fonts with <link> tags to fonts.googleapis.com (with preconnect). All CSS and JS inline. No other external resources except the provided photo URLs.
- Set the theme background on both html and body. No white flashes and no horizontal overflow at any width.
- Fully responsive from 360px to 1600px. Grids collapse cleanly and link rows wrap.
- The page renders inside a full-screen iframe. The host overlays a small "Redesign" button at the top-left corner (about 150×50px), so keep important content and fixed elements out of that corner. Don't use localStorage, alert() or window.open().
- SVG correctness: <polyline>/<polygon> points take only "x,y x,y" pairs; complex shapes use <path d>.
- If you use photos, credit each one with a small "Photo: <name>" link (to the credit URL given) in the footer or near the image.

Output budget: aim for 20–35k characters. Spend detail on what's visible and themed, and write CSS efficiently. A complete document always beats an ambitious truncated one, so if you're running long, simplify.

Output ONLY the HTML document: no markdown fences, no commentary before or after.
</craft>`;
}

function buildUserMessage(brief: Brief, images: UnsplashImage[]): string {
	const lines = [
		`<brief>`,
		`Original prompt: "${brief.englishTheme}"`,
		`Interpretation: ${brief.interpretation}`,
		`Concept: ${brief.conceptName}`,
		`Palette: ${brief.palette.map((c) => `${c.hex} ${c.name} (${c.role})`).join('; ')}`,
		`Fonts: display "${brief.displayFont}", body "${brief.bodyFont}"`,
		`Layout: ${brief.layout}`,
		`Signature moves:`,
		...brief.signatureMoves.map((m, i) => `  ${i + 1}. ${m}`),
		`Motion: ${brief.motion}`,
		`Section labels: about "${brief.sectionLabels.about}", contact "${brief.sectionLabels.contact}", extras "${brief.sectionLabels.extras}"`,
		`</brief>`
	];

	if (images.length > 0) {
		lines.push(
			'',
			'<photos>',
			'Real, live photo URLs. Use them as they are, and drop any that do not fit the design. The first one is the best hero candidate.',
			...images.map(
				(img, i) =>
					`${i + 1}. url=${img.url} | alt="${img.alt}" | credit="${img.credit}" creditUrl=${img.creditUrl}`
			),
			'</photos>'
		);
	} else {
		lines.push('', 'No photos for this one. Build the visuals from type, color, CSS and SVG.');
	}

	lines.push(
		'',
		'Treat the brief as direction, not a cage. If a choice in it clearly hurts legibility or craft, adjust it, but keep the theme unmistakable.',
		'Build the page now.'
	);
	return lines.join('\n');
}

// Fallback brief when the brief call fails, so the build can still go ahead.
function fallbackBrief(theme: string, locale: Locale): Brief {
	return {
		englishTheme: theme,
		interpretation: `Interpret "${theme}" freely and boldly.`,
		conceptName: theme.slice(0, 40),
		palette: [],
		displayFont: 'your choice',
		bodyFont: 'your choice',
		layout: 'your choice: whatever expresses the theme best',
		signatureMoves: ['your choice', 'your choice', 'your choice'],
		motion: 'your choice',
		sectionLabels:
			locale === 'es'
				? { about: 'Sobre mí', contact: 'Contacto', extras: 'Extras' }
				: { about: 'About', contact: 'Contact', extras: 'Extras' },
		useImages: false,
		primaryImageQuery: theme,
		imageQueries: []
	};
}

// ── Request handler ───────────────────────────────────────────────────────────
// Response protocol (text/plain stream):
//   line 1: JSON preview of the brief ({} if it failed). The client shows this while the page builds.
//   rest:   the HTML document, streamed as it is generated.

export const POST: RequestHandler = async ({ request }) => {
	if (!ANTHROPIC_API_KEY) {
		throw error(500, 'ANTHROPIC_API_KEY is not configured');
	}

	const { theme, locale, quality } = (await request.json()) as {
		theme: string;
		locale: Locale;
		quality?: Quality;
	};

	if (!theme || typeof theme !== 'string' || theme.trim().length === 0) {
		throw error(400, 'theme is required');
	}

	const safeTheme = theme.trim().slice(0, 500);
	const safeLocale: Locale = String(locale ?? '')
		.toLowerCase()
		.startsWith('es')
		? 'es'
		: 'en';
	const buildModel = BUILD_MODELS[quality === 'best' ? 'best' : 'fast'];
	console.log(`[generate] theme="${safeTheme}" locale=${safeLocale} model=${buildModel}`);

	const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
	const encoder = new TextEncoder();
	const abort = new AbortController();

	// Everything runs inside the stream so headers go out immediately.
	const readable = new ReadableStream({
		async start(controller) {
			const send = (text: string) => controller.enqueue(encoder.encode(text));
			try {
				let brief: Brief;
				try {
					brief = await createBrief(client, safeTheme, safeLocale);
					console.log(`[generate] concept="${brief.conceptName}"`);
				} catch (err) {
					console.warn('[generate] brief failed, using fallback', err);
					brief = fallbackBrief(safeTheme, safeLocale);
				}

				send(
					JSON.stringify({
						conceptName: brief.conceptName,
						interpretation: brief.interpretation,
						palette: brief.palette.map((c) => c.hex),
						fonts: [brief.displayFont, brief.bodyFont]
					}) + '\n'
				);

				const images = await fetchUnsplashImages(brief);

				const stream = client.beta.messages.stream(
					{
						model: buildModel,
						max_tokens: 32000,
						thinking: { type: 'adaptive' },
						output_config: { effort: BUILD_EFFORT },
						// If the build model declines, the API retries on a fallback model in the same call.
						betas: ['server-side-fallback-2026-07-01'],
						// `fallbacks` isn't in the installed SDK's types yet; the SDK forwards it as-is.
						...({ fallbacks: 'default' } as object),
						system: [
							{
								type: 'text',
								text: buildSystem(safeLocale),
								cache_control: { type: 'ephemeral' }
							}
						],
						messages: [{ role: 'user', content: buildUserMessage(brief, images) }]
					},
					{ signal: abort.signal }
				);

				for await (const event of stream) {
					if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
						send(event.delta.text);
					}
				}

				const final = await stream.finalMessage();
				console.log(
					`[generate] done stop=${final.stop_reason} out=${final.usage.output_tokens} cacheRead=${final.usage.cache_read_input_tokens ?? 0}`
				);
			} catch (err) {
				if (!abort.signal.aborted) {
					console.error('[generate] failed', err);
					controller.error(err);
				}
				return;
			}
			controller.close();
		},
		cancel() {
			abort.abort();
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
