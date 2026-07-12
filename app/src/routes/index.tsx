import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { SiteFooter, SiteNav } from "../components/site/chrome";
import { Hero } from "../components/site/hero";
import {
  DemoCtaSection,
  EngineSection,
  FormatsSection,
  PricingSection,
  ScreensSection,
  TvSection,
} from "../components/site/sections";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  useSiteMotion();
  return (
    <div className="bg-pitch font-display text-chalk">
      <SiteNav />
      <main>
        <Hero />
        <ScreensSection />
        <FormatsSection />
        <EngineSection />
        <TvSection />
        <DemoCtaSection />
        <PricingSection />
      </main>
      <SiteFooter />
    </div>
  );
}

/**
 * Phase 4 motion pass. Everything is screenshot-safe: the initial paint is the
 * complete composed page; scroll-linked effects move transforms only, and
 * text builds fire on mount. Reduced motion skips the whole pass.
 */
function useSiteMotion() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }, { default: SplitType }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("split-type"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      // Lenis bridged into the GSAP ticker (autoRaf off) so scrubs stay smooth
      const lenis = new Lenis({ autoRaf: false });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      const removers: (() => void)[] = [];

      const ctx = gsap.context(() => {
        // Hero headline build, on mount (not viewport-gated)
        const headline = document.querySelector("[data-hero-headline]");
        if (headline) {
          const split = new SplitType(headline as HTMLElement, { types: "chars" });
          gsap.from(split.chars, {
            yPercent: 105,
            duration: 0.9,
            ease: "power4.out",
            stagger: 0.028,
            clearProps: "all",
          });
          (headline as HTMLElement).style.overflow = "hidden";
        }

        // Tier-1: hero parallax rig, scroll-scrubbed transforms
        const hero = document.querySelector("[data-hero]");
        if (hero) {
          const scrub = { trigger: hero, start: "top top", end: "bottom top", scrub: 0.7 } as const;
          gsap.to("[data-hero-layer='bg']", { yPercent: 12, scale: 1.12, ease: "none", scrollTrigger: { ...scrub } });
          gsap.to("[data-hero-layer='mid']", { yPercent: -14, ease: "none", scrollTrigger: { ...scrub } });
          gsap.to("[data-hero-layer='fg']", { yPercent: 22, xPercent: 4, ease: "none", scrollTrigger: { ...scrub } });
          gsap.to("[data-hero-layer='type']", { yPercent: -26, ease: "none", scrollTrigger: { ...scrub } });

          // cursor drift, spring-smoothed
          const layers: [string, number][] = [
            ["[data-hero-layer='bg']", 8],
            ["[data-hero-layer='mid']", 18],
            ["[data-hero-layer='fg']", 30],
          ];
          const movers = layers
            .map(([sel, range]) => {
              const el = document.querySelector(sel);
              if (!el) return null;
              return {
                x: gsap.quickTo(el, "x", { duration: 0.8, ease: "power3.out" }),
                y: gsap.quickTo(el, "y", { duration: 0.8, ease: "power3.out" }),
                range,
              };
            })
            .filter(Boolean) as { x: (v: number) => void; y: (v: number) => void; range: number }[];
          const onMove = (e: MouseEvent) => {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            for (const m of movers) {
              m.x(nx * m.range);
              m.y(ny * m.range * 0.6);
            }
          };
          window.addEventListener("mousemove", onMove, { passive: true });
          removers.push(() => window.removeEventListener("mousemove", onMove));
        }

        // Section entrances: transform-only slide, scrubbed near the edge
        for (const el of gsap.utils.toArray<HTMLElement>("[data-reveal]")) {
          gsap.from(el, {
            y: 70,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "top 72%", scrub: 0.6 },
          });
        }

        // Giant :07 numeral tracks the engine section
        gsap.fromTo(
          "[data-clock-numeral]",
          { xPercent: 22 },
          {
            xPercent: -6,
            ease: "none",
            scrollTrigger: { trigger: "#engine", start: "top bottom", end: "bottom top", scrub: 0.8 },
          },
        );

        // Snake path draws itself on mount of its section
        const path = document.querySelector<SVGPathElement>("[data-snake-path]");
        if (path) {
          const len = path.getTotalLength();
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
          gsap.to(path, {
            strokeDashoffset: 0,
            duration: 2,
            ease: "power2.inOut",
            scrollTrigger: { trigger: "#formats", start: "top 70%" },
          });
        }

        // TV plate settles from a slight zoom
        gsap.fromTo(
          "[data-tv-plate]",
          { scale: 1.12 },
          { scale: 1.02, ease: "none", scrollTrigger: { trigger: "#tv", start: "top bottom", end: "bottom top", scrub: 0.8 } },
        );

        // Magnetic pull on the nav demo link
        for (const el of gsap.utils.toArray<HTMLElement>("[data-magnetic]")) {
          const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
          const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
          const onMove = (e: MouseEvent) => {
            const r = el.getBoundingClientRect();
            xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
            yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
          };
          const onLeave = () => {
            xTo(0);
            yTo(0);
          };
          el.addEventListener("mousemove", onMove);
          el.addEventListener("mouseleave", onLeave);
          removers.push(() => {
            el.removeEventListener("mousemove", onMove);
            el.removeEventListener("mouseleave", onLeave);
          });
        }
      });

      cleanup = () => {
        for (const r of removers) r();
        ctx.revert();
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);
}
