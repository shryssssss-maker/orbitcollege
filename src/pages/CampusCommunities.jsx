import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle, Star } from "lucide-react";
import "./campus-communities.css";

const cards = [
  { title: "Fest crew", image: "/landing/culture/campus-fests.webp", message: "Who’s going to the fest? Let’s meet at the main gate before the first set." },
  { title: "From ‘who’s coming?’ in the group chat to ‘see you there.’", label: "Group chats", gradient: "pink" },
  { title: "The campus group chat", image: "/landing/culture/student-clubs.webp", message: "Coffee after class? Let’s meet outside the library at four." },
  { title: "Find your people", label: "On campus, on Orbit", dark: true },
  { title: "Game Night Crew", image: "/landing/culture/game-nights.webp", message: "Game night this Friday. Bring a friend and your favorite game." },
  { title: "There’s a group for whatever you’re into.", label: "Campus communities", gradient: "blue" },
];

const slides = [...cards, ...cards];
const slotsPerSide = slides.length / 2;

function slideSlot(index, active) {
  return (index - active + slotsPerSide + slides.length) % slides.length - slotsPerSide;
}

function CommunityCard({ title, image, message, label, dark }) {
  if (image) {
    return (
      <>
        <img src={image} alt="" loading="lazy" decoding="async" draggable="false" />
        <div className="orbit-communities-message">
          <h3>{title}</h3>
          <p className="orbit-communities-message-meta"><MessageCircle size={14} aria-hidden="true" /> Example group chat</p>
          <p>{message}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <h3>{title}</h3>
      {dark && (
        <div className="orbit-communities-stars" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => <Star key={index} fill="currentColor" />)}
        </div>
      )}
      <p>{label}</p>
    </>
  );
}

export default function CampusCommunities() {
  const [selection, setSelection] = useState({ active: 2, previous: 2 });
  const drag = useRef(null);

  function move(direction) {
    setSelection(({ active }) => ({ active: (active + direction + slides.length) % slides.length, previous: active }));
  }

  function startDrag(event) {
    if (!event.isPrimary || event.button !== 0) return;
    drag.current = { pointer: event.pointerId, x: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function updateDrag(event) {
    if (event.pointerId !== drag.current?.pointer) return;
    const viewport = event.currentTarget;
    const distance = event.clientX - drag.current.x;
    const limit = viewport.firstElementChild.offsetWidth;
    viewport.dataset.dragging = "";
    viewport.style.setProperty("--community-drag", `${Math.max(-limit, Math.min(distance, limit))}px`);
  }

  function endDrag(event) {
    if (event.pointerId !== drag.current?.pointer) return;
    const viewport = event.currentTarget;
    const distance = event.clientX - drag.current.x;
    drag.current = null;
    delete viewport.dataset.dragging;
    viewport.style.removeProperty("--community-drag");
    if (event.type === "pointerup" && Math.abs(distance) >= 40) move(distance > 0 ? -1 : 1);
  }

  return (
    <section className="orbit-communities" aria-labelledby="orbit-communities-heading">
      <header className="orbit-communities-heading">
        <h2 id="orbit-communities-heading">Campus life runs on Orbit</h2>
        <p>Find your communities and keep the group chat going.</p>
      </header>

      <div
        className="orbit-communities-viewport"
        id="orbit-communities-cards"
        onPointerDown={startDrag}
        onPointerMove={updateDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
      >
        {slides.map((card, index) => {
          const slot = slideSlot(index, selection.active);
          const previousSlot = slideSlot(index, selection.previous);
          return (
            <article
              className="orbit-communities-card"
              key={index}
              data-style={card.image ? "photo" : card.dark ? "dark" : card.gradient}
              data-centered={slot === 0 || undefined}
              data-wrapped={Math.abs(slot - previousSlot) > slotsPerSide || undefined}
              aria-hidden={index >= cards.length || undefined}
              style={{ "--community-slot": slot }}
            >
              <CommunityCard {...card} />
            </article>
          );
        })}
      </div>

      <div className="orbit-communities-controls">
        <button type="button" aria-label="Previous community card" aria-controls="orbit-communities-cards" onClick={() => move(-1)}><ChevronLeft aria-hidden="true" /></button>
        <button type="button" aria-label="Next community card" aria-controls="orbit-communities-cards" onClick={() => move(1)}><ChevronRight aria-hidden="true" /></button>
        <span className="orbit-communities-status" aria-live="polite">{slides[selection.active].title}</span>
      </div>
    </section>
  );
}
