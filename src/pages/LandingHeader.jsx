import { useCallback, useEffect, useRef, useState } from "react";
import { Orbit } from "lucide-react";
import {
  Chalkboard, Coffee, Confetti, Flag, Laptop, List, MicrophoneStage,
  MusicNotes, Trophy, UsersThree, X,
} from "@phosphor-icons/react";
import "./landing-header.css";

// Same behaviour as partiful.com's top bar: a floating pill that grows into a
// panel when you point at a label, shows that label's own menu, and shrinks
// back when you leave. On phones it becomes a menu button.
const sections = [
  {
    label: "Events",
    columns: [{
      title: "Campus events",
      icons: true,
      items: [
        [Confetti, "Campus fests"], [Laptop, "Hackathons"], [MusicNotes, "Music & arts"],
        [Chalkboard, "Workshops"], [Trophy, "Sports"], [UsersThree, "Club meetups"],
        [Coffee, "Hangouts"], [Flag, "Campus drives"], [MicrophoneStage, "Open mics"],
      ],
    }],
    card: { kicker: "Discover", title: "Make campus plans", text: "Find fests, club meetups, and everything happening around MUJ.", image: "/landing/balloons.png" },
  },
  {
    label: "Explore",
    columns: [
      { title: "Explore", items: ["Campus events", "Student clubs", "Get featured"] },
      { title: "Browse", items: ["Communities", "LocaliTea", "Campus passes"] },
    ],
    card: { kicker: "Explore", title: "Do something fun", text: "See what’s happening on campus this week and make a plan.", photo: "/landing/culture/campus-fests.webp" },
  },
  {
    label: "Communities",
    columns: [
      { title: "Communities", items: ["Find a community", "Start a community", "Group chats"] },
      { title: "Get started", items: ["Join Orbit", "Log in"] },
    ],
    card: { kicker: "Communities", title: "Find your people", text: "Join the conversation and meet students who share your interests.", photo: "/landing/culture/student-clubs.webp" },
  },
  {
    label: "For Clubs",
    columns: [
      { title: "For clubs", items: ["Orbit for clubs", "List an event", "Share updates"] },
      { title: "Get started", items: ["Create a club page"] },
    ],
    card: { kicker: "Organizers", title: "Grow your club", text: "Give your members one place to find events and keep up.", photo: "/landing/culture/tech-and-design.webp" },
  },
  {
    label: "About",
    columns: [
      { title: "About", items: ["OrbitCollege", "Manipal University Jaipur"] },
      { title: "Support", items: ["Contact"] },
      { title: "Legal", items: ["Terms of service", "Privacy policy"] },
    ],
    card: { kicker: "About", title: "Made for life at MUJ", text: "One place for the clubs, events and people on campus.", photo: "/landing/culture/student-life.webp" },
  },
];

const labelOf = (item) => (Array.isArray(item) ? item[1] : item);

function MenuItem({ item, icons }) {
  const Icon = icons ? item[0] : null;
  return (
    <li>
      <button className="orbit-nav-item" type="button">
        {Icon && <Icon aria-hidden="true" weight="fill" size={24} />}
        {labelOf(item)}
      </button>
    </li>
  );
}

export default function LandingHeader() {
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState(null); // index of the open section (desktop)
  const [drawer, setDrawer] = useState(false); // phone menu
  const navRef = useRef(null);
  const closeTimer = useRef(0);

  const open = useCallback((index) => {
    window.clearTimeout(closeTimer.current);
    setActive(index);
  }, []);
  // A short grace period so crossing the gap between a label and its menu does not flicker.
  const closeSoon = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setActive(null), 140);
  }, []);
  const closeAll = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    setActive(null);
    setDrawer(false);
  }, []);

  // Hide on the way down, return on the way up.
  useEffect(() => {
    let lastScrollY = Math.max(0, window.scrollY);

    function updateHeader() {
      const scrollY = Math.max(0, window.scrollY);
      const distance = scrollY - lastScrollY;
      if (scrollY > 0 && Math.abs(distance) < 4) return;

      const goingDown = scrollY > 0 && distance > 0;
      setHidden(goingDown);
      if (goingDown) closeAll();
      lastScrollY = scrollY;
    }

    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, [closeAll]);

  // Escape or a press outside closes the menu.
  useEffect(() => {
    if (active === null && !drawer) return undefined;
    const onKey = (event) => { if (event.key === "Escape") closeAll(); };
    const onPress = (event) => { if (!navRef.current?.contains(event.target)) closeAll(); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPress);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPress);
    };
  }, [active, drawer, closeAll]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  return (
    <header className="orbit-nav-header" data-hidden={hidden || undefined} inert={hidden ? "" : undefined}>
      <nav
        className="orbit-nav"
        aria-label="OrbitCollege"
        ref={navRef}
        data-open={active !== null || undefined}
        data-drawer={drawer || undefined}
        onPointerLeave={(event) => { if (event.pointerType === "mouse") closeSoon(); }}
        onPointerEnter={(event) => { if (event.pointerType === "mouse") window.clearTimeout(closeTimer.current); }}
      >
        <div className="orbit-nav-row">
          <Orbit className="orbit-nav-mark" aria-label="OrbitCollege" role="img" strokeWidth={2.65} />
          <ul className="orbit-nav-labels">
            {sections.map(({ label }, index) => (
              <li key={label}>
                <button
                  className="orbit-nav-label"
                  type="button"
                  data-active={active === index || undefined}
                  aria-expanded={active === index}
                  aria-controls={`orbit-nav-panel-${index}`}
                  onPointerEnter={(event) => { if (event.pointerType === "mouse") open(index); }}
                  onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) open(index); }}
                  onClick={() => setActive((current) => (current === index ? null : index))}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
          <div className="orbit-nav-actions">
            <button className="orbit-landing-button" type="button">Join Orbit</button>
            <button className="orbit-landing-button is-light" type="button">Log in</button>
            <button
              className="orbit-nav-toggle"
              type="button"
              aria-label={drawer ? "Close menu" : "Open menu"}
              aria-expanded={drawer}
              aria-controls="orbit-nav-drawer"
              onClick={() => setDrawer((current) => !current)}
            >
              {drawer ? <X size={22} weight="bold" aria-hidden="true" /> : <List size={22} weight="bold" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Desktop: one panel per label, stacked, the active one fades in. */}
        <div className="orbit-nav-panels">
          {sections.map(({ label, columns, card }, index) => (
            <div
              className="orbit-nav-panel"
              id={`orbit-nav-panel-${index}`}
              key={label}
              data-active={active === index || undefined}
              inert={active === index ? undefined : ""}
            >
              <div className="orbit-nav-columns">
                {columns.map((column) => (
                  <div key={column.title}>
                    <p className="orbit-nav-kicker">{column.title}</p>
                    <ul className="orbit-nav-list" data-icons={column.icons || undefined}>
                      {column.items.map((item) => <MenuItem item={item} icons={column.icons} key={labelOf(item)} />)}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="orbit-nav-card">
                {card.image && <img className="orbit-nav-card-art" src={card.image} alt="" width="512" height="500" />}
                {card.photo && <img className="orbit-nav-card-photo" src={card.photo} alt="" loading="lazy" />}
                <p className="orbit-nav-kicker">{card.kicker}</p>
                <h2>{card.title}</h2>
                <p>{card.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Phones: every section in one scrolling list. */}
        <div className="orbit-nav-drawer" id="orbit-nav-drawer" inert={drawer ? undefined : ""}>
          {sections.map(({ label, columns }) => (
            <section key={label}>
              <h2>{label}</h2>
              <ul>
                {columns.flatMap((column) => column.items).map((item) => (
                  <li key={labelOf(item)}><button className="orbit-nav-item" type="button">{labelOf(item)}</button></li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </nav>
    </header>
  );
}
