"use client";

import { useEffect, useRef, useState } from "react";
import "./ContentTV.css";

const channels = [
  { id: "DgI-oZFnUfh", title: "moda", format: "carrossel" },
  { id: "DgD3mzBHcaK", title: "lifestyle", format: "carrossel" },
  { id: "Df3HohPNcLq", title: "vlog & lifestyle", format: "reel" },
  { id: "DfzUVZ6Rd1F", title: "lifestyle", format: "reel" },
];

export default function ContentTV() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = section.current;
    const screen = stage.current;
    if (!element || !screen) return;
    let frame = 0;

    function update() {
      if (!element || !screen) return;
      const rect = element.getBoundingClientRect();
      const height = screen.offsetHeight;
      const travel = Math.max(1, rect.height - height);
      const progress = Math.max(0, Math.min(1, -rect.top / travel));
      setIndex(Math.min(channels.length - 1, Math.floor(progress * channels.length)));
      setVisible(rect.top < window.innerHeight * .65 && rect.bottom > height * .35);
    }

    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const channel = channels[index];
  const post = "https://www.instagram.com/p/" + channel.id + "/";
  return (
    <section ref={section} className="content-tv" aria-labelledby="content-tv-title">
      <div ref={stage} className="content-tv__stage">
        <div className="content-tv__intro">
          <h2 id="content-tv-title">a tv da jules</h2>
          <p>Role para trocar de canal.</p>
        </div>
        <div className="content-tv__set">
          <div className="content-tv__screen" key={channel.id}>
            {visible && <iframe src={post + "embed/"} title={channel.title + " · " + channel.format} allow="fullscreen" />}
          </div>
        </div>
        <div className="content-tv__info">
          <p aria-live="polite">Canal {index + 1} de {channels.length} · {channel.title} · {channel.format}</p>
          <a href={post} target="_blank" rel="noreferrer">Ver no Instagram ↗</a>
        </div>
      </div>
    </section>
  );
}
