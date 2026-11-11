import { useEffect, useRef, useState } from "react";
import "./occasions-deck.css";

const placeholderPosters = [
  ["/techideate_51.jpg", "TechIdeate", "#151b67"],
  ["/seed/cycling.jpg", "Weekend Ride", "#aebd61"],
  ["/seed/coffee.jpg", "The Coffee Club", "#e8bbac"],
  ["/muj.jpg", "Campus After Hours", "#d6bcf1"],
  ["/poster.jpg", "Campus Fest", "#fbac54"],
  ["/seed/brand.jpg", "Design Club", "#f2b5dc"],
  ["/mujsideview.png", "Meet on Campus", "#b7cafa"],
  ["/seed/hackathon.jpg", "Build Night", "#c1ebff"],
  ["/muj.png", "Around MUJ", "#ffe6a1"],
  ["/seed/avatar.jpg", "Student Spotlight", "#ff95b9"],
];

const posters = [...placeholderPosters, ...placeholderPosters];
const wrap = (value, length) => ((value % length) + length) % length;
const easeToward = (value, target, blend) => (
  Math.abs(target - value) < 0.0001 ? target : value + (target - value) * blend
);

export default function OccasionsDeck() {
  const deckRef = useRef(null);
  const [lifted, setLifted] = useState(null);

  useEffect(() => {
    const deck = deckRef.current;
    const cards = [...deck.querySelectorAll("button")];
    const pushOffsets = cards.map(() => ({ x: 0, y: 0 }));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compact = window.matchMedia("(max-width: 800px)");
    const desktopHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    let inView = false;
    let frame = 0;
    let previousTime;
    let previousSquare;
    let elapsed = 0;
    let pace = 1;
    let pointer;

    function trackPointer(event) {
      pointer = { x: event.clientX, y: event.clientY };
    }

    function render(time) {
      const { width, height, top, left } = deck.getBoundingClientRect();
      const isCompact = compact.matches;
      const square = width * (isCompact ? 0.31 : 0.161);
      const step = square * 0.4;
      const loop = step * cards.length;
      const motionEnabled = !reducedMotion.matches;
      const keyboardFocus = deck.contains(document.activeElement) && document.activeElement.matches(":focus-visible");
      const hoveredIndex = motionEnabled && desktopHover.matches
        ? cards.indexOf(deck.querySelector(".orbit-occasions-poster:hover"))
        : -1;
      const delta = Math.min(50, time - (previousTime ?? time));

      if (motionEnabled && !keyboardFocus) {
        const targetPace = hoveredIndex >= 0 ? 0 : 1;
        // Ease the wave to a stop under the pointer, then ease it back into motion.
        pace += (targetPace - pace) * (1 - Math.exp(-delta / 270));
        elapsed += delta * pace;
      }
      previousTime = time;

      const scrollOffset = motionEnabled ? Math.max(-height, Math.min(height, -top)) : 0;
      const travel = (elapsed * 0.02 + scrollOffset * 0.72) * width / 1521;
      const waveAmplitude = motionEnabled ? height * (isCompact ? 0.011 : 0.015) : 0;
      const waveTime = elapsed / 6400;
      const cardX = (index) => wrap(index * step + width * 0.12 - travel, loop) - square;
      const cardY = (x) => {
        const across = x / width;
        const rise = Math.max(0.063, 0.487 - across * 0.29 - across ** 2 * 0.128);
        const restingY = height * (isCompact ? 0.23 + rise * 0.8 : rise);
        return restingY + Math.sin((across * 1.15 - waveTime) * 2 * Math.PI) * waveAmplitude;
      };
      const hoveredX = cardX(hoveredIndex);
      const pointerAcross = pointer && hoveredIndex >= 0
        ? Math.tanh((pointer.x - left - hoveredX - square + step / 2) / (step * 0.65))
        : 0;
      const pointerDown = pointer && hoveredIndex >= 0
        ? Math.tanh((pointer.y - top - cardY(hoveredX) - square / 2) / (square * 0.45))
        : 0;
      const pushBlend = motionEnabled ? 1 - Math.exp(-delta / 72) : 1;
      if (square !== previousSquare) {
        deck.style.setProperty("--occasion-card-size", `${square}px`);
        previousSquare = square;
      }

      cards.forEach((card, index) => {
        const x = cardX(index);
        const y = cardY(x);
        const onScreen = x + square > 0 && x < width;
        card.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        card.style.zIndex = Math.round(loop - x);
        if (card.inert === onScreen) card.inert = !onScreen;

        const offset = hoveredIndex < 0 ? 0 : Math.round((x - hoveredX) / step);
        const influence = offset === 0 ? 0 : Math.max(0, 1 - Math.abs(offset) / 4) ** 2;
        const push = pushOffsets[index];
        const pushX = easeToward(push.x, influence * (Math.sign(offset) * 0.15 + pointerAcross * 0.14), pushBlend);
        const pushY = easeToward(push.y, influence * (0.065 + pointerDown * 0.06), pushBlend);
        if (pushX !== push.x || pushY !== push.y) {
          card.style.setProperty("--occasion-push-x", pushX);
          card.style.setProperty("--occasion-push-y", pushY);
          push.x = pushX;
          push.y = pushY;
        }
      });
      if (!deck.hasAttribute("data-ready")) deck.dataset.ready = "";

      if (inView && motionEnabled) frame = requestAnimationFrame(render);
    }

    function requestRender() {
      cancelAnimationFrame(frame);
      previousTime = undefined;
      frame = requestAnimationFrame(render);
    }

    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      requestRender();
    });
    const resize = new ResizeObserver(requestRender);
    visibility.observe(deck);
    resize.observe(deck);
    deck.addEventListener("pointermove", trackPointer, { passive: true });
    reducedMotion.addEventListener("change", requestRender);
    compact.addEventListener("change", requestRender);
    requestRender();

    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      resize.disconnect();
      deck.removeEventListener("pointermove", trackPointer);
      reducedMotion.removeEventListener("change", requestRender);
      compact.removeEventListener("change", requestRender);
    };
  }, []);

  return (
    <section className="orbit-occasions" aria-labelledby="orbit-occasions-title">
      <div className="orbit-occasions-heading">
        <h2 id="orbit-occasions-title">A million<br />reasons to show up</h2>
        <p>For every kind of campus plan.</p>
      </div>
      <div className="orbit-occasions-deck" ref={deckRef}>
        {posters.map(([src, name, color], index) => (
          <button
            className="orbit-occasions-poster"
            key={index}
            type="button"
            aria-label={name}
            aria-pressed={lifted === index}
            onClick={() => setLifted((current) => current === index ? null : index)}
            style={{ "--occasion-poster-color": color }}
          >
            <span className="orbit-occasions-poster-lift">
              <img src={src} alt="" loading="lazy" decoding="async" draggable={false} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
