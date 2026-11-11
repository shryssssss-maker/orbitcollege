import {
  CalendarDays, Coffee, Flag, GraduationCap, Laptop, MapPin, Mic2, Music2,
  Orbit, Sparkles, Trophy, Users, Zap,
} from "lucide-react";
import "./landing.css";

const categories = [
  [CalendarDays, "Campus fests"], [Laptop, "Hackathons"],
  [Music2, "Music & arts"], [GraduationCap, "Workshops"],
  [Trophy, "Sports"], [Users, "Club meetups"],
  [Coffee, "Hangouts"], [Flag, "Campus drives"], [Mic2, "Open mics"],
];

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

const footer = [
  ["Explore", "Clubs", "Communities", "Campus events", "LocaliTea"],
  ["Get involved", "Find a club", "Join a community", "Register for an event"],
  ["About", "OrbitCollege", "Manipal University Jaipur"],
  ["Legal", "Terms of service", "Privacy policy"],
  ["Support", "Contact"],
];

function PreviewButton({ children, light = false }) {
  return <button className={`orbit-landing-button${light ? " is-light" : ""}`} type="button" disabled>{children}</button>;
}

function LandingHeader() {
  return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  return (
    <header className="orbit-landing-header">
      <nav className="orbit-landing-nav" aria-label="OrbitCollege overview" tabIndex={0}>
        <div className="orbit-landing-nav-row">
          <Orbit className="orbit-landing-mark" aria-label="OrbitCollege" role="img" strokeWidth={2.65} />
          <ul className="orbit-landing-nav-labels">
            {["Events", "Explore", "Communities", "For Clubs", "About"].map((label) => <li key={label}>{label}</li>)}
          </ul>
          <div className="orbit-landing-actions">
            <PreviewButton>Join Orbit</PreviewButton>
            <PreviewButton light>Log in</PreviewButton>
          </div>
        </div>
        <div className="orbit-landing-menu">
          <div>
            <p className="orbit-landing-menu-kicker">Campus events</p>
            <ul className="orbit-landing-menu-list">
              {categories.map(([Icon, label]) => (
                <li key={label}><Icon aria-hidden="true" size={25} strokeWidth={2.5} />{label}</li>
              ))}
            </ul>
          </div>
          <div className="orbit-landing-menu-card">
            <img src="/landing/balloons.png" alt="" width="512" height="500" />
            <p className="orbit-landing-menu-kicker">Discover</p>
            <h2>Make campus plans</h2>
            <p>Find fests, club meetups, and everything happening around MUJ.</p>
          </div>
        </div>
      </nav>
    </header>
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

        <div className="orbit-landing-strip" aria-label="Explore campus life">
          {[[MapPin, "MUJ"], [Users, "Student clubs"], [Orbit, "Communities"], [CalendarDays, "Campus events"], [Zap, "LocaliTea"]].map(([Icon, label]) => (
            <span key={label}><Icon size={23} aria-hidden="true" />{label}</span>
          ))}
        </div>

        <section className="orbit-landing-intro">
          <h2>Your campus. All in one place.</h2>
          <p>Meet the people and find the plans that make college yours.</p>
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

        <section className="orbit-landing-occasions">
          <div className="orbit-landing-wrap">
            <h2>A million reasons<br />to show up</h2>
            <p>From your first club meetup to the biggest fest of the year.</p>
          </div>
          <div className="orbit-landing-poster-fan" aria-hidden="true">
            {[...posters, ...posters.slice(0, 3)].map((poster, index) => (
              <div key={index} style={{ "--poster-index": index }}><Poster poster={poster} /></div>
            ))}
          </div>
        </section>

        <section className="orbit-landing-events">
          <h2>The best events on your campus</h2>
          <p>See what’s happening around Manipal University Jaipur.</p>
          <ul className="orbit-landing-event-list">
            {["Campus Fests", "Hackathons", "Workshops", "Club Meetups", "All Events"].map((label) => <li key={label}>{label}</li>)}
          </ul>
          <div className="orbit-landing-event-tape" aria-hidden="true">
            {[...posters, ...posters].map((poster, index) => <Poster key={index} poster={poster} />)}
          </div>
        </section>

        <section className="orbit-landing-features" aria-label="What you can do on Orbit">
          {features.map((feature) => (
            <article className="orbit-landing-feature orbit-landing-wrap" key={feature.title}>
              <h2>{feature.title}</h2>
              <PhonePreview {...feature} />
              <div>
                <p>{feature.description}</p>
                <PreviewButton light>{feature.label}</PreviewButton>
              </div>
            </article>
          ))}
        </section>

        <section className="orbit-landing-organizers orbit-landing-wrap">
          <div className="orbit-landing-section-head">
            <div><h2>More than an event</h2><p>Give your campus community a place to grow.</p></div>
            <div className="orbit-landing-actions"><PreviewButton light>For clubs</PreviewButton><PreviewButton>Join Orbit</PreviewButton></div>
          </div>
          <div className="orbit-landing-organizer-grid">
            {[[Users, "Start a community"], [Flag, "Get your club discovered"], [CalendarDays, "List campus events"], [Zap, "Share updates"]].map(([Icon, label], index) => (
              <article key={label} style={{ "--tile-color": ["#e7dbff", "#d7edfc", "#fde0e9", "#e8f8c5"][index] }}>
                <Icon aria-hidden="true" strokeWidth={1.4} /><h3>{label}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="orbit-landing-campus">
          <h2>Made for life at MUJ</h2>
          <p>Find your corner of campus.</p>
          <div className="orbit-landing-campus-grid orbit-landing-wrap">
            {posters.slice(0, 5).map((poster) => <Poster key={poster.name} poster={poster} />)}
          </div>
        </section>

        <section className="orbit-landing-join">
          <div className="orbit-landing-poster-ring" aria-hidden="true">
            {[...posters, ...posters, ...posters].map((poster, index) => (
              <div key={index} style={{ "--angle": `${index * 20}deg`, "--tilt": `${index % 2 === 0 ? 12 : -12}deg` }}><Poster poster={poster} /></div>
            ))}
          </div>
          <div><h2>Get into Orbit</h2><PreviewButton>Join Orbit</PreviewButton><p>College happens here.</p></div>
        </section>
      </main>

      <footer className="orbit-landing-footer">
        <div className="orbit-landing-footer-grid">
          {footer.map(([heading, ...items]) => (
            <div key={heading}><h2>{heading}</h2><ul>{items.map((label) => <li key={label}>{label}</li>)}</ul></div>
          ))}
        </div>
        <div className="orbit-landing-wordmark"><Orbit aria-hidden="true" />OrbitCollege</div>
      </footer>
    </div>
  );
}
