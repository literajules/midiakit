"use client";

import { useEffect, useRef, useState } from "react";
import type { LngLatBoundsLike, Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CITIES, type CityId, type CozyPlace } from "./cozyPlaces";

/**
 * O mapa em si (MapLibre GL JS + estilo Positron da OpenFreeMap).
 *
 * - Só roda no navegador: a biblioteca é importada dentro de um efeito e este
 *   arquivo é carregado com `next/dynamic({ ssr: false })` pelo modal.
 * - Os pins são elementos HTML (botões) numerados, então recebem foco por
 *   teclado e leitor de tela lê "1. Nome do lugar".
 * - A atribuição cartográfica (OpenFreeMap / OpenMapTiles / OpenStreetMap)
 *   fica sempre visível no canto inferior direito.
 */

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

/**
 * Bug conhecido do MapLibre GL v6 com o Turbopack (bundler padrão do
 * `next dev`): o worker interno (onde os tiles vetoriais são decodificados)
 * não é resolvido corretamente — o mapa nunca termina de carregar (sem
 * erro visível, só o fundo/tiles que nunca aparecem; os pins e o resto da
 * interface funcionam normalmente). Ver github.com/maplibre/maplibre-gl-js
 * issues #8126 e vercel/next.js #86495.
 *
 * Correção: apontar explicitamente pro worker já compilado, copiado de
 * `node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs` pra
 * `public/vendor/maplibre/` — se o `maplibre-gl` for atualizado, rodar
 * `npm run sync:maplibre-worker` de novo pra recopiar o arquivo.
 * `setWorkerUrl` só precisa rodar uma vez, antes do primeiro `new Map(...)`.
 */
let workerUrlConfigured = false;
function ensureWorkerUrl(ml: typeof import("maplibre-gl")) {
  if (workerUrlConfigured) return;
  workerUrlConfigured = true;
  ml.setWorkerUrl("/vendor/maplibre/maplibre-gl-worker.mjs");
}

export type Insets = { top: number; right: number; bottom: number; left: number };

type Props = {
  city: CityId;
  places: CozyPlace[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** áreas cobertas por cabeçalho/painel flutuantes: a câmera as evita */
  insets: Insets;
  reduced: boolean;
};

/** Ajusta as cores do Positron à paleta do site (--cream/--off-white/--burgundy, ver globals.css). */
function tint(map: MapLibreMap) {
  const paint = (layer: string, prop: "background-color" | "fill-color", value: string) => {
    if (map.getLayer(layer)) map.setPaintProperty(layer, prop, value);
  };
  paint("background", "background-color", "#f3e6cc"); // --cream
  paint("water", "fill-color", "#d7e0d6");
  paint("park", "fill-color", "#e3e6cf");
  paint("landcover_wood", "fill-color", "#dde4c8");
  paint("landuse_residential", "fill-color", "#f7f0df");
  paint("building", "fill-color", "#efe3c8");
}

export default function CozyMapCanvas({ city, places, selectedId, onSelect, insets, reduced }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const pinsRef = useRef<Map<string, { marker: Marker; el: HTMLElement }>>(new Map());
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // valores "vivos" lidos dentro de callbacks sem recriar o mapa
  const live = useRef({ onSelect, insets, reduced, city });
  useEffect(() => {
    live.current = { onSelect, insets, reduced, city };
  });

  /* ---- cria o mapa uma vez ---- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;
    let map: MapLibreMap | null = null;
    let ro: ResizeObserver | null = null;
    const pins = pinsRef.current;

    (async () => {
      try {
        const ml = await import("maplibre-gl");
        if (disposed) return;
        ensureWorkerUrl(ml);
        const start = CITIES.find((c) => c.id === live.current.city) ?? CITIES[0];
        map = new ml.Map({
          container,
          style: STYLE_URL,
          center: start.center,
          zoom: start.zoom,
          minZoom: 2.5,
          maxPitch: 0,
          dragRotate: false,
          attributionControl: { compact: false },
        });
        map.touchZoomRotate.disableRotation();
        map.addControl(new ml.NavigationControl({ showCompass: false }), "bottom-left");
        mapRef.current = map;

        map.on("load", () => {
          if (disposed || !map) return;
          tint(map);
          map.resize();
          setReady(true);
        });
        map.on("error", (e) => {
          // falha de WebGL / estilo: avisa e mantém a lista funcionando
          if (!map?.loaded() && /webgl|style/i.test(String(e?.error?.message))) setFailed(true);
        });

        // o container muda de tamanho junto com o modal (abertura, rotação, resize)
        ro = new ResizeObserver(() => map?.resize());
        ro.observe(container);
      } catch {
        if (!disposed) setFailed(true);
      }
    })();

    return () => {
      disposed = true;
      ro?.disconnect();
      pins.forEach(({ marker }) => marker.remove());
      pins.clear();
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  /* ---- pins + enquadramento da cidade ---- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    let cancelled = false;

    (async () => {
      const ml = await import("maplibre-gl");
      if (cancelled) return;

      pinsRef.current.forEach(({ marker }) => marker.remove());
      pinsRef.current.clear();

      places.forEach((p, i) => {
        const el = document.createElement("div");
        el.className = "cozy-pin";
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cozy-pin__btn";
        btn.textContent = String(i + 1);
        btn.setAttribute("aria-label", `${i + 1}. ${p.name}, ${p.neighborhood}`);
        btn.style.setProperty("--pin-delay", `${200 + i * 70}ms`);
        btn.addEventListener("click", (ev) => {
          ev.stopPropagation();
          live.current.onSelect(p.id);
        });
        el.appendChild(btn);
        const marker = new ml.Marker({ element: el, anchor: "center" }).setLngLat([p.longitude, p.latitude]).addTo(map);
        pinsRef.current.set(p.id, { marker, el });
      });

      const { insets: pad, reduced: rm } = live.current;
      const opts = { padding: pad, duration: rm ? 0 : 1500, essential: false } as const;
      if (places.length >= 2) {
        const b = new ml.LngLatBounds([places[0].longitude, places[0].latitude], [places[0].longitude, places[0].latitude]);
        places.forEach((p) => b.extend([p.longitude, p.latitude]));
        map.fitBounds(b as LngLatBoundsLike, { ...opts, maxZoom: 14.5 });
      } else if (places.length === 1) {
        map.flyTo({ ...opts, center: [places[0].longitude, places[0].latitude], zoom: 14.5 });
      } else {
        const c = CITIES.find((x) => x.id === city) ?? CITIES[0];
        map.flyTo({ ...opts, center: c.center, zoom: c.zoom });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [city, places, ready]);

  /* ---- pin selecionado: destaque + foco animado ---- */
  useEffect(() => {
    pinsRef.current.forEach(({ el, marker }, id) => {
      const on = id === selectedId;
      el.classList.toggle("is-active", on);
      marker.getElement().style.zIndex = on ? "5" : "";
    });
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const p = places.find((x) => x.id === selectedId);
    if (!p) return;
    const { insets: pad, reduced: rm } = live.current;
    map.flyTo({
      center: [p.longitude, p.latitude],
      zoom: Math.max(map.getZoom(), 14.8),
      padding: pad,
      duration: rm ? 0 : 1100,
      essential: false,
    });
  }, [selectedId, places]);

  return (
    <div className="cozy-map__canvas-wrap">
      <div ref={containerRef} className="cozy-map__canvas" role="application" aria-label="Mapa interativo" />
      {!ready && !failed && <div className="cozy-map__loading" aria-hidden="true" />}
      {failed && (
        <p className="cozy-map__fail" role="status">
          Não consegui carregar o mapa agora. A lista de lugares continua funcionando.
        </p>
      )}
    </div>
  );
}
