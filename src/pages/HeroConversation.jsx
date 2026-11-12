import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./hero-conversation.css";

// A group chat playing over a party photo, like the one on partiful.com's hero.
// Messages arrive one by one (typing dots first), an event invite lands after
// the third, the thread scrolls up as it fills, then clears and starts again.
// Sizes and timings are measured from the reference; copy and imagery are ours.

// --- stage, in design pixels (scaled to fit whatever box it is given) ---
const STAGE_W = 548;
const STAGE_H = 565;
const PHOTO_W = 420;
const PHOTO_RADIUS = 16.4;
const THREAD_LEFT = 28;
const THREAD_W = 499;
const BOTTOM_INSET = 24;
const ROW_GAP = 36;

// --- bubbles ---
const AVATAR = 55.35;
const AVATAR_GAP = 14;
const RADIUS = 28;
const PAD_V = 14;
const PAD_H = 24;
const MAX_TEXT = 335;
const FONT_SIZE = 21.28;
const LINE_HEIGHT = 1.22;
const TYPING = { width: 33, height: 20 };
const INVITE = { width: 196, height: 166 };

// --- timing, seconds ---
const START_DELAY = 0.3;
const MESSAGE_INTERVAL = 0.55;
const INVITE_DELAY = 1;
const JITTER = 1.2;
const TYPING_MIN = 0.65;
const TYPING_MAX = 2.1;
const PUSH = 0.25;
const LOOP_PAUSE = 6;
const EXIT = 0.5;
const EXIT_STAGGER = 0.1;
const RESET_PAUSE = 0.7;

const friends = {
  maya: { name: "Maya", src: "/landing/culture/student-life.webp", x: 52, originY: 55 },
  liv: { name: "Liv", src: "/landing/culture/student-life.webp", x: 76, originY: 53 },
  zoe: { name: "Zoe", src: "/landing/culture/student-life.webp", x: 100, originY: 52 },
};

const beats = [
  { id: "m1", kind: "message", sender: "maya", side: "left", text: "what’s happening this weekend???" },
  { id: "m2", kind: "message", sender: "liv", side: "left", text: "nothing yet lol" },
  { id: "m3", kind: "message", sender: "zoe", side: "right", text: "fest @ the quad?" },
  { id: "invite", kind: "invite", sender: "zoe", side: "right" },
  { id: "m4", kind: "message", sender: "maya", side: "left", text: "wait... perfect" },
  { id: "m5", kind: "message", sender: "liv", side: "left", text: "LET'S GOOOO" },
  { id: "m6", kind: "message", sender: "zoe", side: "right", text: "c u there" },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// How tall a row is before it has been measured.
function estimateHeight(item, heights) {
  if (heights[item.id]) return heights[item.id];
  if (item.kind === "invite") return Math.max(INVITE.height, AVATAR);
  if (item.stage === "typing") return Math.max(AVATAR, TYPING.height + PAD_V * 2);
  const lines = Math.max(1, Math.ceil((item.text.length * FONT_SIZE * 0.51) / MAX_TEXT));
  return Math.max(AVATAR, lines * FONT_SIZE * LINE_HEIGHT + PAD_V * 2);
}

// Rows stack up from the bottom: the newest sits at the bottom inset.
function stack(items, heights) {
  const tops = new Map();
  let edge = STAGE_H - BOTTOM_INSET;
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const top = edge - estimateHeight(items[index], heights);
    tops.set(items[index].id, top);
    edge = top - ROW_GAP;
  }
  return tops;
}

// iOS-style bubble outline with a tail at the bottom corner.
function bubblePath(width, height) {
  const r = clamp(RADIUS, 8, Math.floor(Math.max(8, height / 2)));
  return [
    `M ${r} 0 H ${width - r} A ${r} ${r} 0 0 1 ${width} ${r} V ${height - r} A ${r} ${r} 0 0 1 ${width - r} ${height}`,
    `H ${1.06 * r} C ${0.94 * r} ${height} ${0.72 * r} ${height + 0.23 * r} ${0.49 * r} ${height + 0.32 * r}`,
    `C ${0.4 * r} ${height + 0.36 * r} ${0.32 * r} ${height + 0.3 * r} ${0.42 * r} ${height + 0.17 * r}`,
    `C ${0.57 * r} ${height - 0.01 * r} ${0.55 * r} ${height - 0.1 * r} ${0.4 * r} ${height - 0.2 * r}`,
    `A ${r} ${r} 0 0 1 0 ${height - r} V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`,
  ].join(" ");
}

function Avatar({ friend }) {
  return (
    <div className="orbit-chat-avatar" aria-hidden="true">
      <img
        src={friend.src}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        style={{ objectPosition: `${friend.x}% 50%`, transformOrigin: `50% ${friend.originY}%` }}
      />
    </div>
  );
}

function TypingDots() {
  return <span className="orbit-chat-dots" aria-hidden="true"><i /><i /><i /></span>;
}

function Bubble({ text, side, typing }) {
  const probe = useRef(null);
  const [size, setSize] = useState({ width: 100, height: 24 });
  const gradient = useId();

  // Measure the text at its natural width so the bubble can grow to it.
  useLayoutEffect(() => {
    const element = probe.current;
    const measure = () => setSize((current) => {
      const next = { width: Math.ceil(element.offsetWidth), height: Math.ceil(element.offsetHeight) };
      return Math.abs(current.width - next.width) <= 0.5 && Math.abs(current.height - next.height) <= 0.5 ? current : next;
    });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text]);

  const content = typing ? TYPING : size;
  const width = Math.min(MAX_TEXT + PAD_H * 2, content.width + PAD_H * 2);
  const height = content.height + PAD_V * 2;
  const tail = clamp(RADIUS, 8, Math.floor(Math.max(8, height / 2))) * 0.36;
  const right = side === "right";
  const path = bubblePath(width, height);

  return (
    <div className="orbit-chat-bubble" data-side={side} style={{ width, height }}>
      {right ? (
        <svg
          className="orbit-chat-tail"
          style={{ left: 0, height: `calc(100% + ${tail}px)` }}
          viewBox={`0 0 ${width + 7} ${height + tail}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgb(66, 181, 252)" />
              <stop offset="100%" stopColor="rgb(7, 139, 250)" />
            </linearGradient>
          </defs>
          <path d={path} fill={`url(#${gradient})`} transform={`translate(${width} 0) scale(-1 1)`} />
        </svg>
      ) : (
        <svg
          className="orbit-chat-tail"
          style={{ left: -7, height: `calc(100% + ${tail}px)` }}
          viewBox={`-7 0 ${width + 7} ${height + tail}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={path} fill="rgb(233, 233, 235)" />
        </svg>
      )}
      <div className="orbit-chat-text">
        <span className="orbit-chat-typing" data-on={typing || undefined}><TypingDots /></span>
        <span className="orbit-chat-words" data-on={!typing || undefined}>{text}</span>
      </div>
      <span className="orbit-chat-probe" ref={probe} aria-hidden="true">{text}</span>
    </div>
  );
}

function Invite() {
  return (
    <div className="orbit-chat-invite" style={{ width: INVITE.width, height: INVITE.height }}>
      <div className="orbit-chat-invite-art">
        <img src="/poster.jpg" alt="" loading="lazy" decoding="async" draggable={false} />
        <span>OrbitCollege</span>
      </div>
      <div className="orbit-chat-invite-bar">
        <img src="/orbitcollege.png" alt="" width="30" height="30" draggable={false} />
        <div><strong>RSVP to Fest!</strong><small>Orbit</small></div>
        <b>View</b>
      </div>
    </div>
  );
}

// One row of the thread: avatar plus a bubble (or the invite card).
function Row({ item, top, leaving, onMeasure }) {
  const ref = useRef(null);
  const friend = friends[item.sender];

  useLayoutEffect(() => {
    const element = ref.current;
    const measure = () => onMeasure(item.id, Math.ceil(element.offsetHeight));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [item.id, onMeasure]);

  let transform = `translate3d(0, ${top}px, 0)`;
  let transition = `transform ${PUSH * 1000}ms ease-in-out`;
  if (leaving) {
    transform = `translate3d(0, ${top - leaving.shift}px, 0)`;
    transition = `transform ${EXIT * 1000}ms cubic-bezier(.85, 0, .15, 1) ${leaving.delay}ms`;
  } else if (!item.mounted) {
    // New rows start just below the stage and rise into place.
    transform = `translate3d(0, ${STAGE_H + 30}px, 0)`;
    transition = "none";
  }

  return (
    <div className="orbit-chat-row" style={{ transform, transition }}>
      <div className="orbit-chat-line" data-side={item.side} ref={ref}>
        <Avatar friend={friend} />
        {item.kind === "invite" ? <Invite /> : <Bubble text={item.text} side={item.side} typing={item.stage === "typing"} />}
      </div>
    </div>
  );
}

const typingTime = (text) => {
  const spread = TYPING_MAX - TYPING_MIN;
  const byLength = clamp(text.length * 0.022, 0, spread);
  return clamp(TYPING_MIN + byLength + Math.random() * (spread - byLength) * clamp(JITTER, 0, 1), TYPING_MIN, TYPING_MAX);
};
const gapBefore = (beat) => {
  const base = beat.kind === "invite" ? INVITE_DELAY : MESSAGE_INTERVAL;
  return Math.max(beat.kind === "invite" ? 1.4 : 0.05, base + (Math.random() - 0.5) * JITTER);
};

export default function HeroConversation() {
  const rootRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [items, setItems] = useState([]);
  const [heights, setHeights] = useState({});
  const [exit, setExit] = useState(null);
  const [reduced, setReduced] = useState(false);
  const latest = useRef({ items, heights });
  latest.current = { items, heights };

  const measureRow = useMemo(() => (id, height) => {
    setHeights((current) => (current[id] === height ? current : { ...current, [id]: height }));
  }, []);

  // Fit the fixed-size stage to its box.
  useEffect(() => {
    const root = rootRef.current;
    const fit = () => setScale(Math.min(root.clientWidth / STAGE_W, root.clientHeight / STAGE_H) || 1);
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduced) {
      // No motion: show the finished conversation.
      setExit(null);
      setItems(beats.map((beat) => ({ ...beat, stage: "sent", mounted: true })));
      return undefined;
    }

    let dead = false;
    let active = false;
    const root = rootRef.current;
    const sync = () => { active = !document.hidden && inView; };
    let inView = false;

    // Time only counts while the chat is on screen, so it never plays unseen.
    const sleep = (seconds) => new Promise((resolve) => {
      let left = seconds * 1000;
      const timer = window.setInterval(() => {
        if (dead) { window.clearInterval(timer); return; }
        if (!active) return;
        left -= 50;
        if (left <= 0) { window.clearInterval(timer); resolve(); }
      }, 50);
    });
    const nextFrames = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const observer = new IntersectionObserver(([entry]) => { inView = entry.intersectionRatio >= 0.2; sync(); }, { threshold: [0, 0.2] });
    observer.observe(root);
    document.addEventListener("visibilitychange", sync);

    async function leave() {
      const { items: current, heights: measured } = latest.current;
      const tops = stack(current, measured);
      const visible = current.filter((item) => tops.get(item.id) + estimateHeight(item, measured) > 0)
        .sort((a, b) => tops.get(a.id) - tops.get(b.id));
      const lowest = current.reduce((max, item) => Math.max(max, tops.get(item.id) + estimateHeight(item, measured)), 0);
      const shift = Math.max(STAGE_H + BOTTOM_INSET, lowest + ROW_GAP + 4);
      const delays = new Map(visible.map((item, index) => [item.id, index * EXIT_STAGGER * 1000]));
      setExit({ shift, delays });
      await sleep(Math.max(0, visible.length - 1) * EXIT_STAGGER + EXIT);
    }

    (async () => {
      while (!dead) {
        setExit(null);
        setItems([]);
        for (let index = 0; index < beats.length && !dead; index += 1) {
          const beat = beats[index];
          const typing = beat.kind === "message";
          setItems((current) => [...current, { ...beat, stage: typing ? "typing" : "sent", mounted: false }]);
          await nextFrames();
          setItems((current) => current.map((item) => (item.id === beat.id ? { ...item, mounted: true } : item)));
          await sleep(PUSH);
          if (typing) {
            const wait = typingTime(beat.text);
            await sleep(index === 0 ? Math.max(START_DELAY, wait) : wait);
            setItems((current) => current.map((item) => (item.id === beat.id ? { ...item, stage: "sent" } : item)));
          }
          if (beats[index + 1]) await sleep(gapBefore(beats[index + 1]));
        }
        await sleep(LOOP_PAUSE);
        if (dead) break;
        await leave();
        await sleep(RESET_PAUSE);
      }
    })();

    return () => {
      dead = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [reduced]);

  const tops = stack(items, heights);

  return (
    <div className="orbit-chat" ref={rootRef} role="img" aria-label="Friends planning the weekend in a group chat and sharing an event invite">
      <div className="orbit-chat-stage" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        <div className="orbit-chat-photo" style={{ left: (STAGE_W - PHOTO_W) / 2, width: PHOTO_W, borderRadius: PHOTO_RADIUS }}>
          <img src="/landing/culture/campus-fests.webp" alt="" width="420" height="565" fetchPriority="high" decoding="async" draggable={false} />
        </div>
        <div className="orbit-chat-thread" style={{ left: THREAD_LEFT, width: THREAD_W }}>
          {items.map((item) => (
            <Row
              item={item}
              key={item.id}
              top={tops.get(item.id)}
              leaving={exit ? { shift: exit.shift, delay: exit.delays.get(item.id) ?? 0 } : null}
              onMeasure={measureRow}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
