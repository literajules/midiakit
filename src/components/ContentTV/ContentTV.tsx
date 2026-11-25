"use client";

import { useLanguage } from "@/components/Language";

import { useEffect, useRef } from "react";
import "./ContentTV.css";

const channels = [
  { id: "DgI-oZFnUfh", title: "moda", format: "carrossel" },
  { id: "DgD3mzBHcaK", title: "lifestyle", format: "carrossel" },
  { id: "Df3HohPNcLq", title: "vlog & lifestyle", format: "reel" },
  { id: "DfzUVZ6Rd1F", title: "lifestyle", format: "reel" },
];

export default function ContentTV() {
  const { t } = useLanguage();
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
      const turn = Math.min(1, Math.max(0, 1 - bounds.top / Math.max(1, stickyHeight * 0.7)));
      scrapbook.style.setProperty("--scrapbook-curl", String(Math.sin(turn * Math.PI)));
      scrapbook.style.setProperty("--scrapbook-entry", String(turn));
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
    <section id="meu-scrapbook" className="content-scrapbook" ref={section} aria-labelledby="scrapbook-title">
      <div className="content-scrapbook__stage">
        <header className="content-scrapbook__header">
          <h2 id="scrapbook-title">{t("meu scrapbook", "my scrapbook")}</h2>
          <p>{t("Role para explorar meus conteúdos.", "Scroll to explore my work.")}</p>
        </header>
        <div className="content-scrapbook__viewport" ref={viewport}>
          <div className="content-scrapbook__strip" ref={strip}>
            {channels.map(({ id, title: category, format: kind }) => {
              const title = t(category, category === 'moda' ? 'fashion' : category);
              const format = t(kind, kind === 'carrossel' ? 'carousel' : kind);
              const post = "https://www.instagram.com/p/" + id + "/";
              return (
                <article key={id} className="content-scrapbook__post" data-format={kind}>
                  <h3 className="content-scrapbook__labels">
                    <span className="content-scrapbook__category" data-category={category}>{title}</span>
                    <span className="content-scrapbook__format">{format}</span>
                  </h3>
                  <a className="content-scrapbook__media" href={post} target="_blank" rel="noreferrer"
                    aria-label={t(`Abrir ${title} no Instagram`, `Open ${title} on Instagram`)}>
                    <iframe src={post + "embed/"} title={title + " · " + format} loading="lazy" tabIndex={-1} aria-hidden="true" />
                  </a>

                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
