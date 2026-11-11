import { useEffect, useRef, useState } from "react";
import "./campus-culture.css";

const scenes = [
  { title: "Campus Fests", category: "Music & culture", detail: "Big nights on campus", image: "/landing/culture/campus-fests.webp" },
  { title: "Student Clubs", category: "Clubs & communities", detail: "Meet people who share your interests", image: "/landing/culture/student-clubs.webp" },
  { title: "Tech & Design", category: "Workshops & hackathons", detail: "Build something together", image: "/landing/culture/tech-and-design.webp" },
  { title: "Live Music", category: "Music on campus", detail: "Find your next gig", image: "/landing/culture/live-music.webp" },
  { title: "Creative Workshops", category: "Arts & making", detail: "Try a new craft with friends", image: "/landing/culture/creative-workshops.webp" },
  { title: "Campus Sports", category: "Sports & outdoors", detail: "Find a team or join a game", image: "/landing/culture/campus-sports.webp" },
  { title: "Weekend Rides", category: "Outdoor plans", detail: "Get out and explore together", image: "/seed/cycling.jpg" },
  { title: "Campus Hangouts", category: "Campus life", detail: "Make plans between classes", image: "/seed/coffee.jpg" },
  { title: "Student Life", category: "Student communities", detail: "Find your corner of campus", image: "/landing/culture/student-life.webp" },
  { title: "Game Nights", category: "Casual meetups", detail: "Bring your friends or meet new ones", image: "/landing/culture/game-nights.webp" },
  { title: "Around MUJ", category: "Manipal University Jaipur", detail: "See what’s happening on campus", image: "/muj.jpg" },
];

const clamp = (value, maximum = 1) => Math.max(0, Math.min(maximum, value));
const easeOut = (value) => 1 - (1 - clamp(value)) ** 3;

function SceneList({ position, active }) {
  return (
    <ul className="orbit-culture-list" data-position={position} aria-hidden={position ? true : undefined}>
      {scenes.map(({ title }, index) => (
        <li data-current={!position && index === active || undefined} key={title}>{title}</li>
      ))}
    </ul>
  );
}

export default function CampusCulture() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const stackRef = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const list = stackRef.current.querySelector(".orbit-culture-list:not([data-position])");
    const labels = [...list.children];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let progress;
    let previousTime;
    let activeIndex = 0;
    let visible = false;

    function draw(time) {
      frame = 0;
      const viewport = window.innerHeight;
      const { top, height } = section.getBoundingClientRect();
      const reduce = reducedMotion.matches;
      const target = reduce ? 1 : clamp((viewport - top) / (height + viewport));
      const delta = Math.min(50, time - (previousTime ?? time - 16));
      previousTime = time;

      progress = reduce || progress === undefined || Math.abs(progress - target) < 0.001
        ? target : progress + (target - progress) * (1 - Math.exp(-delta / 195));

      // The crop opens during the middle third of the timeline. The zoom runs throughout.
      const crop = 1 - easeOut(progress * 3 - 0.5);
      stage.style.setProperty("--culture-crop", crop);
      stage.style.setProperty("--culture-zoom", 1.5 - easeOut(progress) * 0.5);

      let nearest = 0;
      if (!reduce) {
        let closestDistance = Infinity;
        const centerLine = viewport / 2;
        labels.forEach((label, index) => {
          const { top: labelTop, height: labelHeight } = label.getBoundingClientRect();
          const distance = Math.abs(labelTop + labelHeight / 2 - 1 - centerLine);
          if (distance < closestDistance) {
            closestDistance = distance;
            nearest = index;
          }
        });
      }
      if (nearest !== activeIndex) {
        activeIndex = nearest;
        setActive(nearest);
      }

      if (progress !== target) requestDraw();
    }

    function requestDraw() {
      if (!frame) frame = requestAnimationFrame(draw);
    }

    function requestWhileVisible() {
      if (visible) requestDraw();
    }

    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      requestDraw();
    }, { rootMargin: "100% 0px" });
    const preload = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      scenes.slice(1).forEach(({ image }) => { new Image().src = image; });
      preload.disconnect();
    }, { rootMargin: "70% 0px" });
    visibility.observe(section);
    preload.observe(section);
    window.addEventListener("scroll", requestWhileVisible, { passive: true });
    window.addEventListener("resize", requestDraw);
    reducedMotion.addEventListener("change", requestDraw);
    requestDraw();

    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      preload.disconnect();
      window.removeEventListener("scroll", requestWhileVisible);
      window.removeEventListener("resize", requestDraw);
      reducedMotion.removeEventListener("change", requestDraw);
    };
  }, []);

  const scene = scenes[active];

  return (
    <section className="orbit-culture" aria-labelledby="orbit-culture-title" ref={sectionRef}>
      <div className="orbit-culture-grid">
        <div className="orbit-culture-intro">
          <div>
            <h2 id="orbit-culture-title">Built for campus culture</h2>
            <p>Meet the clubs and communities making things happen at Manipal University Jaipur.</p>
          </div>
          <button className="orbit-culture-button" type="button" disabled>For clubs</button>
        </div>
      </div>
      <div className="orbit-culture-track">
        <div className="orbit-culture-stage" data-scene={active} ref={stageRef} aria-hidden="true">
          <img className="orbit-culture-image" src={scene.image} alt="" loading="lazy" decoding="async" />
        </div>
        <div className="orbit-culture-content">
          <div className="orbit-culture-info orbit-culture-grid">
            <span className="orbit-culture-category">{scene.category}</span>
            <span className="orbit-culture-detail">{scene.detail}</span>
            <button className="orbit-culture-button is-light" type="button" disabled>Explore Orbit</button>
          </div>
          <div className="orbit-culture-list-grid orbit-culture-grid">
            <div className="orbit-culture-list-stack" ref={stackRef}>
              <SceneList position="before" />
              <SceneList active={active} />
              <SceneList position="after" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
