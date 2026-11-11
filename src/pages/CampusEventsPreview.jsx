import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import "./campus-events-preview.css";

const categories = [
  { title: "Campus Fests", action: "Explore fests", order: [5, 2, 6, 0, 1, 4, 7, 3] },
  { title: "Hackathons", action: "Explore hackathons", order: [4, 6, 0, 1, 3, 7, 2, 5] },
  { title: "Workshops", action: "Explore workshops", order: [3, 5, 1, 7, 2, 6, 0, 4] },
  { title: "Club Meetups", action: "Explore meetups", order: [1, 4, 6, 2, 5, 0, 7, 3] },
  { title: "All Events", action: "Explore all events", order: [7, 0, 4, 6, 1, 2, 5, 3] },
];

const springTimes = [480, 310, 350, 270, 370, 435, 420, 450];

function PreviewCards({ rows, side, displayed }) {
  const start = side === "left" ? 0 : 4;
  return (
    <div className={`orbit-event-preview-track is-${side}`}>
      {springTimes.slice(start, start + 4).map((duration, index) => {
        const slot = start + index;
        const { name, type } = rows[displayed][slot];
        return (
          <div className="orbit-event-preview-slot" style={{ "--event-spring-time": `${duration}ms` }} key={slot}>
            <figure className="orbit-event-preview-card">
              <div className="orbit-event-preview-art">
                {rows.map((posters, row) => (
                  <img
                    key={row}
                    src={posters[slot].image}
                    alt=""
                    width="130"
                    height="130"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    data-current={row === displayed || undefined}
                  />
                ))}
              </div>
              <figcaption><strong>{name}</strong><span>{type}</span></figcaption>
            </figure>
          </div>
        );
      })}
    </div>
  );
}

export default function CampusEventsPreview({ posters }) {
  const [{ active, displayed, moving }, setSelection] = useState({ active: null, displayed: 0, moving: false });
  const previews = [
    ...posters,
    { name: "Campus Fest", type: "CAMPUS LIFE", image: "/poster.jpg" },
    { name: "Design Club", type: "TECH & DESIGN", image: "/seed/brand.jpg" },
  ];
  const rows = categories.map(({ order }) => order.map((index) => previews[index]));

  function select(index, toggle = false) {
    setSelection((current) => {
      if (index === null || (toggle && current.active === index)) {
        return { ...current, active: null };
      }
      if (current.active === index) return current;
      return { active: index, displayed: index, moving: current.active !== null };
    });
  }

  return (
    <section className="orbit-event-preview" aria-labelledby="orbit-event-preview-heading">
      <div className="orbit-event-preview-heading">
        <h2 id="orbit-event-preview-heading">The best events on campus</h2>
        <p>See what’s happening around Manipal University Jaipur.</p>
      </div>
      <div
        className="orbit-event-preview-stage"
        onPointerLeave={(event) => { if (event.pointerType === "mouse") select(null); }}
        onBlur={(event) => {
          const stage = event.currentTarget;
          if (!stage.contains(event.relatedTarget) && !stage.matches(":hover")) select(null);
        }}
      >
        <ul className="orbit-event-preview-list">
          {categories.map(({ title, action }, index) => {
            const expanded = active === index;
            return (
              <li
                className="orbit-event-preview-row"
                data-active={expanded || undefined}
                key={title}
                onPointerEnter={(event) => { if (event.pointerType === "mouse") select(index); }}
              >
                <button
                  className="orbit-event-preview-label"
                  type="button"
                  aria-expanded={expanded}
                  onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) select(index); }}
                  onClick={(event) => select(index, event.nativeEvent.pointerType !== "mouse")}
                >
                  <span className="orbit-event-preview-title">{title}</span>
                  <span className="orbit-event-preview-action" aria-hidden="true">{action}<ArrowUpRight size={13} /></span>
                </button>
              </li>
            );
          })}
        </ul>
        <div
          className="orbit-event-preview-gallery"
          style={{ "--event-gallery-row": displayed }}
          data-open={active !== null || undefined}
          data-moving={moving || undefined}
          aria-hidden="true"
        >
          <PreviewCards rows={rows} side="left" displayed={displayed} />
          <PreviewCards rows={rows} side="right" displayed={displayed} />
        </div>
      </div>
    </section>
  );
}
