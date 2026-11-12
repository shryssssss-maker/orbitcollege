import { useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import "./feature-showcase.css";

// One pinned phone. Scrolling swaps the screen on it and the copy beside it,
// and each screen's images fly in. Modelled on partiful.com's phone section.
const steps = [
  {
    title: "Find your people",
    description: "Discover student clubs and communities by interest, and keep up with the ones you join.",
    label: "Explore clubs",
    screen: "Explore",
    heading: "Clubs for you",
    sub: "3 picked from your interests",
    color: "#e7deff",
    cards: [["/seed/brand.jpg", "Design & Creative", "Clubs for makers"], ["/seed/hackathon.jpg", "Tech & Coding", "Build something"], ["/seed/avatar.jpg", "Music & Culture", "Find your crowd"]],
  },
  {
    title: "Make campus plans",
    description: "See what’s coming up at MUJ, register for events, and find your passes in one place.",
    label: "See events",
    screen: "Campus events",
    heading: "Coming up",
    sub: "3 events this week",
    color: "#d5ecff",
    cards: [["/techideate_51.jpg", "TechIdeate", "Happening this week"], ["/seed/cycling.jpg", "Weekend Ride", "Saturday, 6:30 AM"], ["/seed/coffee.jpg", "The Coffee Club", "Sunday, 4:00 PM"]],
  },
  {
    title: "Hear what’s happening",
    description: "Catch announcements, join the conversation, and share what’s on your mind in LocaliTea.",
    label: "Explore Orbit",
    screen: "LocaliTea",
    heading: "Trending now",
    sub: "3 conversations",
    color: "#ffe1e8",
    cards: [["/muj.jpg", "Best spot to study?", "Trending in LocaliTea"], ["/mujsideview.png", "Anyone going to the fest?", "12 replies"], ["/seed/avatar.jpg", "Weekend plans?", "Posted 2h ago"]],
  },
];

const last = steps.length - 1;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

// Scroll schedule in stage heights, measured from the reference: hold, slide,
// hold, slide, hold. Each slide takes one full stage height of scrolling.
const SLIDE_START = [0.6, 2.2];
const SLIDE_LENGTH = 1;

// Quartic in-out, the reference's "power3.inOut": slow start, quick middle, slow landing.
const ease = (value) => {
  const t = clamp(value);
  return t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2;
};

export default function FeatureShowcase() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = section.querySelector(".orbit-showcase-stage");
    const screens = [...section.querySelectorAll("[data-screen]")];
    const copies = [...section.querySelectorAll("[data-copy]")];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    let frame = 0;

    function render() {
      const viewport = window.innerHeight;
      const stageHeight = stage.clientHeight;
      const { top } = section.getBoundingClientRect();
      const motion = !reducedMotion.matches;

      // 0 -> 1 while the section scrolls into view; the first screen's images fly in with it.
      const entry = clamp((viewport - top) / viewport);
      // How far we have scrolled while pinned, in stage heights.
      const scrolled = Math.max(0, -top) / stageHeight;
      const [first, second] = SLIDE_START.map((start) => {
        const raw = clamp((scrolled - start) / SLIDE_LENGTH);
        return motion ? ease(raw) : +(raw >= 0.5);
      });

      // Screens rise inside the phone with the same two slides.
      [entry, first, second].forEach((value, index) => screens[index].style.setProperty("--in", value));

      // The copies sit one stage-height apart and slide up together.
      const slides = [-first, 1 - first - second, 1 - second];
      let nearest = 0;
      slides.forEach((slide, index) => {
        if (Math.abs(slide) < Math.abs(slides[nearest])) nearest = index;
        copies[index].style.setProperty("--slide", `${slide * stageHeight}px`);
      });
      copies.forEach((copy, index) => { copy.inert = index !== nearest; });

      if (!section.hasAttribute("data-ready")) section.dataset.ready = "";
      if (inView && motion) frame = requestAnimationFrame(render);
    }

    function requestRender() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(render);
    }

    // Observe a margin around the section so the loop is running before it appears.
    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      requestRender();
    }, { rootMargin: "20% 0px" });
    visibility.observe(section);
    window.addEventListener("resize", requestRender);
    reducedMotion.addEventListener("change", requestRender);
    // Reduced motion has no running loop, so repaint on scroll while the section is near.
    const onScroll = () => { if (inView) requestRender(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    requestRender();

    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      window.removeEventListener("resize", requestRender);
      window.removeEventListener("scroll", onScroll);
      reducedMotion.removeEventListener("change", requestRender);
    };
  }, []);

  return (
    <section className="orbit-showcase" aria-label="What you can do on Orbit" ref={sectionRef}>
      <div className="orbit-showcase-stage">
        <div className="orbit-showcase-copies">
          {steps.map((step) => (
            <div className="orbit-showcase-copy" data-copy key={step.title}>
              <div className="orbit-showcase-heading"><h2>{step.title}</h2></div>
              <div className="orbit-showcase-details">
                <p>{step.description}</p>
                <button className="orbit-landing-button is-light" type="button" disabled>{step.label}</button>
              </div>
            </div>
          ))}
        </div>

        <div className="orbit-showcase-phone" aria-hidden="true">
          <div className="orbit-showcase-status">
            <span>9:41</span>
            <svg viewBox="0 0 17 12" width="17" height="12" aria-hidden="true"><path d="M8.5 2.3c2.4 0 4.6.9 6.3 2.5l1-1.1A10.5 10.5 0 0 0 8.5.8C5.700.8 3.200 1.900 1.200 3.700l1 1.100A8.900 8.900 0 0 1 8.500 2.300Zm0 3.500c1.500 0 2.900.6 4 1.600l1-1.100a7.200 7.200 0 0 0-10 0l1 1.100c1.100-1 2.500-1.600 4-1.600Zm0 3.400c.7 0 1.300.3 1.800.7L8.500 12 6.700 9.900c.5-.4 1.100-.7 1.800-.7Z" fill="currentColor" /></svg>
            <svg viewBox="0 0 27 13" width="27" height="13" aria-hidden="true"><rect x=".5" y=".5" width="22" height="12" rx="3.800" fill="none" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="19" height="9" rx="2.300" fill="currentColor" /><path d="M24.200 4.500v4c.8-.3 1.400-1.100 1.400-2s-.6-1.700-1.400-2Z" fill="currentColor" opacity=".45" /></svg>
          </div>
          <div className="orbit-showcase-island" />
          <div className="orbit-showcase-screens">
            {steps.map((step) => (
              <div className="orbit-showcase-screen" data-screen key={step.screen}>
                <div className="orbit-showcase-title">{step.screen}</div>
                <div className="orbit-showcase-section">
                  <div><strong>{step.heading}</strong><small>{step.sub}</small></div>
                  <i aria-hidden="true"><Plus size={13} strokeWidth={3.2} /></i>
                </div>
                <div className="orbit-showcase-cards">
                  {step.cards.map(([src, name, hint], card) => (
                    <figure style={{ "--card": card }} key={name}>
                      <strong>{name}</strong>
                      <small>{hint}</small>
                      <div className="orbit-showcase-faces">
                        {step.cards.map(([face]) => (
                          <img src={face} alt="" loading="lazy" decoding="async" draggable={false} key={face} />
                        ))}
                        <b>+9</b>
                      </div>
                    </figure>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
