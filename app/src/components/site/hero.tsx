// S1 hero: the Tier-1 cutout parallax rig. Four layers (stage plate, confetti
// haze, podium cutout, chyron type block) move at different rates on scroll
// and drift subtly with the cursor. Wiring lives in the page motion pass;
// this component owns the composed, screenshot-safe initial state.
import { Link } from "@tanstack/react-router";

export function Hero() {
  return (
    <section data-hero className="relative flex min-h-dvh flex-col justify-end overflow-hidden bg-pitch">
      {/* layer 1: stage plate */}
      <img
        data-hero-layer="bg"
        src="/assets/hero-stage-b.png"
        alt="Empty draft night arena stage under navy and scarlet spotlights"
        className="absolute inset-0 h-full w-full scale-105 object-cover"
      />
      {/* layer 2: confetti haze, screen-blended */}
      <img
        data-hero-layer="mid"
        src="/assets/confetti-haze.png"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-70 mix-blend-screen"
      />
      {/* readability scrim, part of the composed state */}
      <div className="absolute inset-0 bg-gradient-to-t from-pitch via-pitch/30 to-pitch/10" aria-hidden />
      {/* layer 3: podium cutout, foreground right */}
      <img
        data-hero-layer="fg"
        src="/assets/podium-cut.png"
        alt=""
        aria-hidden
        className="absolute -right-8 bottom-0 hidden h-[62vh] object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.7)] md:block lg:right-8"
      />

      {/* layer 4: chyron type block, bottom-left like the board */}
      <div data-hero-layer="type" className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-24 md:px-6 md:pb-20">
        <div className="h-px w-24 bg-chalk/30" aria-hidden />
        <h1 data-hero-headline className="mt-6 max-w-3xl font-display text-5xl font-bold tracking-tighter text-chalk md:text-7xl">
          Draft night, on air.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-chalk/85">
          A real-time draft room for your league. Phones in hand, commissioner in control, the TV as the stage.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          {/* CTA garment: scarlet chyron block with pulsing on-air dot and clipped corner */}
          <Link
            to="/demo"
            className="group inline-flex items-center gap-3 bg-scarlet px-6 py-3.5 font-chyron text-sm font-semibold uppercase tracking-wide text-chalk transition-colors [clip-path:polygon(0_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%)] hover:bg-scarlet-deep active:translate-y-[1px]"
          >
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute h-full w-full animate-ping rounded-full bg-chalk/80 fdr-motion" />
              <span className="relative h-2 w-2 rounded-full bg-chalk" />
            </span>
            Run the demo draft
          </Link>
          {/* CTA garment: inline link whose underline draws in */}
          <a href="#room" className="group relative py-1 text-sm font-medium text-chalk">
            See how it works <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-chalk transition-transform duration-300 group-hover:scale-x-100 fdr-motion" aria-hidden />
          </a>
        </div>
        <div className="mt-10 h-px w-full max-w-md bg-chalk/20" aria-hidden />
      </div>
    </section>
  );
}
