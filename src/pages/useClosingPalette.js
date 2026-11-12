import { useLayoutEffect } from "react";

const scrubDuration = 800;

export default function useClosingPalette(landingRef) {
  useLayoutEffect(() => {
    const landing = landingRef.current;
    const footer = landing.querySelector(".orbit-closing");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function readProgress() {
      const viewport = window.innerHeight;
      const top = footer.getBoundingClientRect().top;
      return Math.min(1, Math.max(0, (viewport * 0.75 - top) / (viewport * 0.5)));
    }

    function paint(progress) {
      // Match the reference's cubic ease-out within the scroll range.
      const darkness = 1 - (1 - progress) ** 3;
      landing.style.setProperty("--orbit-closing-darkness", `${darkness * 100}%`);
      landing.dataset.closingScheme = darkness >= 0.52 ? "dark" : "light";
    }

    let progress = readProgress();
    let target = progress;
    let from = progress;
    let startedAt = 0;
    let frame = 0;
    let needsMeasurement = false;
    paint(progress);

    function update(now) {
      frame = 0;
      if (needsMeasurement) {
        needsMeasurement = false;
        const next = readProgress();
        if (next !== target) {
          from = progress;
          target = next;
          startedAt = now;
        }
      }

      const elapsed = Math.min(1, (now - startedAt) / scrubDuration);
      if (reducedMotion.matches || elapsed === 1) {
        progress = target;
      } else {
        const blend = (1 - 2 ** (-10 * elapsed)) / (1 - 2 ** -10);
        progress = from + (target - from) * blend;
      }
      paint(progress);

      if (progress !== target) frame = requestAnimationFrame(update);
    }

    function scheduleUpdate() {
      needsMeasurement = true;
      if (!frame) frame = requestAnimationFrame(update);
    }

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    reducedMotion.addEventListener("change", scheduleUpdate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      reducedMotion.removeEventListener("change", scheduleUpdate);
    };
  }, [landingRef]);
}
