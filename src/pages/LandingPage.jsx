import { useEffect, useRef, useState } from "react";
import { CalendarDays, Orbit, Sparkles, Users } from "lucide-react";
import CampusEventsPreview from "./CampusEventsPreview.jsx";
import LandingFooter from "./LandingFooter.jsx";
import CampusCulture from "./CampusCulture.jsx";
import OccasionsDeck from "./OccasionsDeck.jsx";
import FeatureShowcase from "./FeatureShowcase.jsx";
import SpiralCTA from "./SpiralCTA.jsx";
import LandingHeader from "./LandingHeader.jsx";
import "./landing.css";

const campusHighlights = [
  { label: "MUJ", description: "Campus life at Manipal University Jaipur.", style: "university" },
  { label: "Student Clubs", description: "Find the clubs that share your interests.", style: "clubs" },
  { label: "Communities", description: "Find your people and join the conversation.", style: "communities" },
  { label: "Campus Events", description: "See what’s happening and make a plan.", style: "events" },
  { label: "LocaliTea", description: "Catch up on what students are talking about.", style: "tea" },
];

const marqueeSlides = [...campusHighlights, ...campusHighlights];
const marqueeSideSlots = Math.floor((marqueeSlides.length - 1) / 2);

function marqueeSlot(index, center) {
  return (index - center + marqueeSideSlots + marqueeSlides.length) % marqueeSlides.length - marqueeSideSlots;
}

const posters = [
  { name: "Campus After Hours", type: "CAMPUS LIFE", image: "/muj.jpg", color: "#dba7fa" },
  { name: "TechIdeate", type: "TECH & DESIGN", image: "/techideate_51.jpg", color: "#ccf661" },
  { name: "The Coffee Club", type: "HANGOUTS", image: "/seed/coffee.jpg", color: "#ffbfbc" },
  { name: "Build Night", type: "HACKATHONS", image: "/seed/hackathon.jpg", color: "#b4d3ff" },
  { name: "Weekend Ride", type: "SPORTS", image: "/seed/cycling.jpg", color: "#ffbd73" },
  { name: "Meet on Campus", type: "COMMUNITIES", image: "/mujsideview.png", color: "#d0c6ff" },
];

const features = [
  { title: "Find your people", description: "Discover student clubs and communities by interest, and keep up with the ones you join.", label: "Explore clubs", screen: "Explore", rows: ["Design & Creative", "Tech & Coding", "Music & Culture"], color: "#e7deff" },
  { title: "Make campus plans", description: "See what’s coming up at MUJ, register for events, and find your passes in one place.", label: "See events", screen: "Campus events", rows: ["TechIdeate", "Weekend Ride", "The Coffee Club"], color: "#d5ecff" },
  { title: "Hear what’s happening", description: "Catch announcements, join the conversation, and share what’s on your mind in LocaliTea.", label: "Explore Orbit", screen: "LocaliTea", rows: ["What are you doing this weekend?", "Best spot to study on campus?", "Anyone going to the fest?"], color: "#ffe1e8" },
];

function PreviewButton({ children, light = false }) {
  return <button className={`orbit-landing-button${light ? " is-light" : ""}`} type="button" disabled>{children}</button>;
}

function CampusMarquee() {
  const region = useRef(null);
  const [visible, setVisible] = useState(false);
  const [selection, setSelection] = useState({ active: 2, previous: 2 });

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.intersectionRatio >= 0.25);
    }, { threshold: 0.25 });
    observer.observe(region.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const element = region.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      if (document.hidden || reducedMotion.matches || element.matches(":has(:focus-visible)")) return;
      setSelection(({ active }) => ({ active: (active + 1) % marqueeSlides.length, previous: active }));
    }, 3200);
    return () => window.clearInterval(timer);
  }, [visible, selection]);

  return (
    <section className="orbit-landing-marquee" aria-label="Explore campus life" ref={region}>
      <div className="orbit-landing-marquee-card" aria-hidden="true" />
      <div className="orbit-landing-marquee-track">
        {marqueeSlides.map(({ label, description, style }, index) => {
          const slot = marqueeSlot(index, selection.active);
          const previousSlot = marqueeSlot(index, selection.previous);
          const centered = slot === 0;
          const descriptionId = `orbit-marquee-description-${index}`;
          return (
            <div
              className="orbit-landing-marquee-slide"
              data-active={centered || undefined}
              data-wrapped={Math.abs(slot - previousSlot) > marqueeSideSlots || undefined}
              inert={Math.abs(slot) > 2 ? "" : undefined}
              style={{ "--marquee-slot": slot }}
              key={index}
            >
              <button
                className="orbit-landing-marquee-wordmark"
                data-style={style}
                type="button"
                aria-pressed={centered}
                aria-describedby={centered ? descriptionId : undefined}
                tabIndex={Math.abs(slot) <= 1 ? 0 : -1}
                onClick={() => setSelection(({ active }) => ({ active: index, previous: active }))}
              >
                {label}
              </button>
              <p id={descriptionId} aria-hidden={!centered}>{description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Poster({ poster }) {
  return (
    <div className="orbit-landing-poster" style={{ "--poster-color": poster.color }}>
      <img src={poster.image} alt="" loading="lazy" />
      <div><small>{poster.type}</small><strong>{poster.name}</strong></div>
    </div>
  );
}

function PhonePreview({ screen, rows, color }) {
  return (
    <div className="orbit-landing-phone" style={{ "--phone-color": color }} aria-hidden="true">
      <div className="orbit-landing-phone-camera" />
      <div className="orbit-landing-phone-brand"><Orbit size={21} /> Orbit</div>
      <strong>{screen}</strong>
      <div className="orbit-landing-phone-items">
        {rows.map((row, index) => (
          <div key={row}><span>{[<Sparkles key="spark" />, <Users key="people" />, <CalendarDays key="date" />][index]}</span>{row}</div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="orbit-landing">
      <LandingHeader />
      <main>
        <section className="orbit-landing-hero" aria-labelledby="orbit-landing-title">
          <div className="orbit-landing-hero-inner">
            <h1 id="orbit-landing-title">Campus<br />comes alive</h1>
            <p>Discover events & find your people</p>
            <div className="orbit-landing-actions">
              <PreviewButton light>Explore events</PreviewButton>
              <PreviewButton>Join Orbit</PreviewButton>
            </div>
          </div>
        </section>

        <CampusMarquee />

        <section className="orbit-landing-intro">
          <h2>Your campus. One place.</h2>
          <p>Find your people and make plans at MUJ.</p>
          <div className="orbit-landing-intro-grid orbit-landing-wrap">
            {features.map((feature, index) => (
              <article key={feature.title}>
                <div className="orbit-landing-intro-art" style={{ background: feature.color }}>
                  <PhonePreview {...feature} />
                </div>
                <h3>{["Discover your clubs", "Find what’s on", "Stay in the loop"][index]}</h3>
                <p>{["Explore communities around your interests", "See upcoming events and register", "Keep up with campus conversations"][index]}</p>
              </article>
            ))}
          </div>
          <PreviewButton>Explore Orbit</PreviewButton>
        </section>

        <OccasionsDeck />

        <CampusEventsPreview posters={posters} />

        <FeatureShowcase />

        <CampusCulture />

        <section className="orbit-landing-campus">
          <h2>Made for life at MUJ</h2>
          <p>Find your corner of campus.</p>
          <div className="orbit-landing-campus-grid orbit-landing-wrap">
            {posters.slice(0, 5).map((poster) => <Poster key={poster.name} poster={poster} />)}
          </div>
        </section>

        <SpiralCTA />
      </main>

      <LandingFooter />
    </div>
  );
}
