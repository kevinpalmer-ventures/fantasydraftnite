# Fantasy Draft Nite — design brief

## Design read
For fantasy football commissioners and their league-mates deciding where draft night happens; the register is the electric last ten seconds before a pick is announced, televised-sports tension, not SaaS calm.

## Concept spine
**"The site is a live draft-night broadcast."** Every section is a segment of a TV production: chyron lower-thirds, an on-the-clock timer, a pick ticker, a draft board. The visitor is not reading about the product, they are inside the show.

## Delivery tier
`cinema` (Lenis + GSAP, Tier-1 hero, scroll chapters). Marketing site + a fully interactive `/demo` draft room (snake + auction simulator with mock data) and a TV-board view.

## Locked palette
- Ground: midnight broadcast navy `#0B1322`, tint shifts `#0E1A30`, `#13203A` (navy desk, deliberately not graphite)
- Ink: chalk `#EEF2F8`
- Muted meta: slate `#93A0B8`
- Accent (the ONE accent): broadcast scarlet `#D2394C` (~57% sat)
Defense: scarlet is the on-air REC light and the red-zone graphic package; navy is the broadcast desk. Avoids all banned families (no orange/amber, no neon cyan/green glow, no purple, no beige/brass).

## Locked type
**Outfit** (display + body, tight tracking, 600–800 for chyrons) + **IBM Plex Mono** (tickers, timers, codes, data readouts). Geometric grotesk carries scoreboard scale; mono is the chyron data voice.

## Tier-1 technique
**B1 — Cutout parallax rig** (wow-catalog, layered depth family). Hero stage image split into background bowl plate, haze/confetti mid layer, and cutout stage subject; 4 layers move at different rates on scroll AND subtly on cursor. Defense: the spine puts the visitor ON the stage, so the hero must feel volumetric, like standing under the lights. (A1 film scrub was ruled out: no ffmpeg on the build machine for frame extraction; documented fallback per asset-system.) Mobile degradation: cursor drift disabled, scroll-only parallax with shorter travel. Reduced motion: static composed stack.

## Combinatorial pick (held across all boards)
- Theme paradigm: Deep Dark with a broadcast-navy twist (never graphite)
- Background character: full-bleed cinematic imagery in hero and TV band; solid with soft ambient depth elsewhere
- Typography character: clean geometric grotesk + mono data voice, compressed uppercase chyron labels
- Hero architecture: massive image-first, restrained text bottom-left
- Section system: poster-stacked storytelling with asymmetric premium flow
- Signature components: oversized product-facts strip · product UI panel stack · hover-accordion slices · layered image crop frames (diptych)
- Narrative spine: stage/spotlight ("on air, on the clock")
- Second-read moment: one oversized numeral as structure, the anti-snipe `:07` in S4

## Section plan (one layout family each, no consecutive repeats)
1. **S1 Hero** — image-as-canvas parallax stage; anchor bottom-left over image. Headline "Draft night, on air." 1 sub-line, CTA row.
2. **S2 Three screens, one room** — product UI panel stack (manager phone / commissioner console / TV board), asymmetric; anchor top-left lead. Product-facts strip under it (4–12 teams, 2 formats, 1 price per draft, results kept 2 years).
3. **S3 Snake vs Auction** — color-blocked diptych with layered crop frames; anchor stacked center split.
4. **S4 The rules engine** — hover-accordion slices (anti-snipe clock, server deadlines, private queues, keepers, auto-draft, grades); anchor off-grid offset with the giant `:07` numeral.
5. **S5 TV night** — full-bleed cinematic poster band (TV board + player-card takeover); anchor centered statement.
6. **S6 Run a mock draft** — framed banner CTA block into /demo with mini board motif; centered frame.
7. **S7 One price, then draft** — editorial block: 3 steps + per-draft pricing + waitlist form (D1); anchor top-left.
Footer: monogram, nav echo, waitlist echo link.
Eyebrow budget: max 3 across S1–S7.

## Asset plan (Higgsfield kit)
- Hero visual: 2 candidates, cinematic empty draft stage under stadium lights, navy/scarlet grade; winner gets remove_background cutout + clean background plate for the parallax rig; confetti-bokeh haze layer for screen-blend.
- Section plates: dark ambient haze gradient plate; navy duotone turf macro; chyron light-streak plate.
- Content imagery: 3 product UI stills (manager phone, commissioner console, TV board) same grade; snake board still + auction paddle still for the diptych.
- Custom icon set: one sheet, 8 glyphs, 2px chalk stroke + scarlet node (timer, gavel, snake path, queue, TV, lock, code ticket, grade) sliced + background-removed.
- Logo: FDN chyron-badge monogram; head kit (favicon/apple/manifest icons) derived from it.
- OG image: 1200×630 composed wide in brand language.
- Cinema video: ambient TV-band loop only if generation budget allows; scrub skipped (no ffmpeg), noted above.

## CTA inventory (bespoke chrome, no shared button class)
- **Run the demo draft** (hero, primary): scarlet chyron block with pulsing on-air dot, mono uppercase label, clipped corner; :active compresses.
- **See how it works** (hero, secondary): underlined inline link + arrow, underline draws on hover.
- **Open the TV board** (S5): ghost outline slab over imagery with scrim, scanline sweep on hover.
- **Run the demo draft** (S6, same intent = same label as hero): oversized framed banner block, whole frame is the hit target, border thickens on hover.
- **Join the waitlist** (S7 submit): full-width ticket-stub bar with perforation notch, mono label.
- Nav link to demo: mono bracket link `[ DEMO ]`.
