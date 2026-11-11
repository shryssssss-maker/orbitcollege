import { Orbit } from "lucide-react";
import "./landing-footer.css";

const panels = [
  { label: "Host an event", title: "Bring campus together", image: "/landing/footer/host.webp" },
  { label: "Explore events", title: "Find your people", image: "/landing/footer/explore.webp" },
];

const footerGroups = [
  ["Explore", "Clubs", "Communities", "Campus events", "LocaliTea"],
  ["Legal", "Terms of service", "Privacy policy"],
  ["Get involved", "Find a club", "Join a community", "Register for an event"],
  ["About and support", "OrbitCollege", "Manipal University Jaipur", "Contact"],
];

export default function LandingFooter() {
  return (
    <footer className="orbit-closing">
      <div className="orbit-closing-panels" aria-label="Host and explore events">
        {panels.map(({ label, title, image }) => (
          <figure className="orbit-closing-panel" key={label} tabIndex={0}>
            <div className="orbit-closing-image">
              <img src={image} alt="" loading="lazy" decoding="async" />
            </div>
            <figcaption>
              <span>{label}</span>
              <strong>{title}</strong>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="orbit-closing-bottom">
        <div className="orbit-closing-signoff">
          <h2>See you soon.</h2>
          <div className="orbit-closing-actions">
            <button type="button" disabled>Get the app</button>
            <button type="button" disabled>Explore events</button>
          </div>
        </div>
        <div className="orbit-closing-links">
          {footerGroups.map(([heading, ...items]) => (
            <ul aria-label={heading} key={heading}>
              {items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          ))}
        </div>
        <div className="orbit-closing-brand"><Orbit size={26} aria-hidden="true" />OrbitCollege</div>
      </div>
    </footer>
  );
}
