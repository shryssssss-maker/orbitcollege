import { useEffect, useMemo, useRef, useState } from "react";
import { SPIRAL_COMPACT, SPIRAL_DESKTOP, advance, layoutFor, tilePose } from "./spiral-math.js";
import "./spiral-cta.css";

// The closing "Get into Orbit" section: a spiral of campus posters drifting
// slowly inward behind one big call to action. Geometry lives in spiral-math.js.
const artwork = [
  "/techideate_51.jpg", "/seed/cycling.jpg", "/seed/coffee.jpg", "/muj.jpg", "/poster.jpg",
  "/seed/brand.jpg", "/mujsideview.png", "/seed/hackathon.jpg", "/muj.png", "/seed/avatar.jpg",
];

export default function SpiralCTA() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const tileRefs = useRef([]);
  const [compact, setCompact] = useState(false);
  const [near, setNear] = useState(false);
  const [size, setSize] = useState({ width: 1440, height: 600 });

  const config = compact ? SPIRAL_COMPACT : SPIRAL_DESKTOP;
  const layout = useMemo(
    () => layoutFor(size.width, size.height, config),
    [size.width, size.height, config],
  );

  // Phone layout below 800px, same breakpoint as the rest of the landing page.
  useEffect(() => {
    const query = window.matchMedia("(max-width: 800px)");
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Track the stage size, and only build the tiles once the section is close.
  useEffect(() => {
    const stage = stageRef.current;
    const measure = () => setSize((current) => (
      current.width === stage.clientWidth && current.height === stage.clientHeight
        ? current
        : { width: stage.clientWidth, height: stage.clientHeight }
    ));
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(stage);
    const visibility = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setNear(true); },
      { rootMargin: "600px 0px" },
    );
    visibility.observe(sectionRef.current);
    return () => { resize.disconnect(); visibility.disconnect(); };
  }, []);

  useEffect(() => {
    if (!near) return undefined;
    const section = sectionRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let progress = config.progress;
    let inView = true;
    let frame = 0;
    let previous;

    function paint() {
      tileRefs.current.forEach((tile, index) => {
        if (!tile) return;
        const pose = tilePose(index, progress, layout, config, size.width, size.height);
        if (!pose) {
          tile.style.opacity = "0";
          return;
        }
        tile.style.transform = `translate3d(${pose.x}px, ${pose.y}px, 0) translate(-50%, -50%) rotate(${pose.rotation}deg) scale(${pose.scale})`;
        tile.style.opacity = String(pose.opacity);
      });
    }

    function tick(time) {
      const elapsed = previous === undefined ? 0 : time - previous;
      previous = time;
      progress = advance(progress, elapsed, config.speed, config.direction, layout);
      paint();
      frame = requestAnimationFrame(tick);
    }

    function sync() {
      cancelAnimationFrame(frame);
      previous = undefined;
      const animate = inView && !document.hidden && !reducedMotion.matches;
      tileRefs.current.forEach((tile) => { if (tile) tile.style.willChange = animate ? "transform, opacity" : "auto"; });
      if (animate) {
        frame = requestAnimationFrame(tick);
      } else {
        // Still or reduced motion: hold the resting arrangement.
        if (reducedMotion.matches) progress = config.progress;
        paint();
      }
    }

    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    }, { rootMargin: "300px 0px" });
    visibility.observe(section);
    document.addEventListener("visibilitychange", sync);
    reducedMotion.addEventListener("change", sync);
    sync();

    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reducedMotion.removeEventListener("change", sync);
    };
  }, [near, layout, config, size.width, size.height]);

  return (
    <section className="orbit-join" aria-labelledby="orbit-join-title" ref={sectionRef}>
      <div className="orbit-join-stage" ref={stageRef} aria-hidden="true">
        {near && Array.from({ length: layout.tiles }, (_, index) => (
          <div
            className="orbit-join-tile"
            key={index}
            ref={(element) => { tileRefs.current[index] = element; }}
            style={{ width: config.base, height: config.base }}
          >
            <img src={artwork[index % artwork.length]} alt="" loading="lazy" decoding="async" draggable={false} />
          </div>
        ))}
      </div>
      <div className="orbit-join-copy">
        <h2 className="orbit-join-title" id="orbit-join-title">
          <button className="orbit-join-cta" type="button">Get into Orbit</button>
        </h2>
        <p>College happens here.</p>
      </div>
    </section>
  );
}
