"use client";

import { useEffect, useRef } from "react";
import "./ContentTV.css";

const channels = [
  { id: "DgI-oZFnUfh", title: "moda", format: "carrossel" },
  { id: "DgD3mzBHcaK", title: "lifestyle", format: "carrossel" },
  { id: "Df3HohPNcLq", title: "vlog & lifestyle", format: "reel" },
  { id: "DfzUVZ6Rd1F", title: "lifestyle", format: "reel" },
];

export default function ContentTV() {
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrapbook = section.current;
    const windowEl = viewport.current;
    const track = strip.current;
    if (!scrapbook || !windowEl || !track) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    function update() {
      if (!scrapbook || !windowEl || !track || motion.matches) return;

      const bounds = scrapbook.getBoundingClientRect();
      const stickyHeight = windowEl.parentElement?.offsetHeight ?? window.innerHeight;
      const progress = Math.min(1, Math.max(0, -bounds.top / Math.max(1, bounds.height - stickyHeight)));
      const travel = Math.max(0, track.scrollWidth - windowEl.clientWidth);
      track.style.setProperty("--scrapbook-offset", "-" + progress * travel + "px");
    }
    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }

    schedule();
    const observer = new ResizeObserver(schedule);
    observer.observe(windowEl);
    observer.observe(track);
    window.addEventListener("scroll", schedule, { passive: true });
    motion.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      motion.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <section className="content-scrapbook" ref={section} aria-labelledby="scrapbook-title">
      <div className="content-scrapbook__stage">
        <div className="content-scrapbook__collage" aria-hidden="true">
          <span className="content-scrapbook__cutout content-scrapbook__cutout--cork" />
          <span className="content-scrapbook__cutout content-scrapbook__cutout--lace" />
          <span className="content-scrapbook__cutout content-scrapbook__cutout--paper" />
          <span className="content-scrapbook__cutout content-scrapbook__cutout--fridge" />
          <span className="content-scrapbook__cutout content-scrapbook__cutout--tag" />
          <span className="content-scrapbook__cutout content-scrapbook__cutout--envelope" />
        </div>
        <header className="content-scrapbook__header">
          <h2 id="scrapbook-title">meu scrapbook</h2>
          <p>Role para explorar meus conteúdos.</p>
        </header>
        <div className="content-scrapbook__viewport" ref={viewport}>
          <div className="content-scrapbook__strip" ref={strip}>
            {channels.map(({ id, title, format }) => {
              const post = "https://www.instagram.com/p/" + id + "/";
              return (
                <article key={id} className="content-scrapbook__post">
                  <h3>{title} <span>· {format}</span></h3>
                  <iframe src={post + "embed/"} title={title + " · " + format} loading="lazy" allow="fullscreen" />
                  <a href={post} target="_blank" rel="noreferrer">Ver no Instagram ↗</a>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
