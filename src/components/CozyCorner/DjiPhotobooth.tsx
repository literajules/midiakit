"use client";
import { useLanguage } from "@/components/Language";

import { useCallback, useEffect, useRef, useState } from "react";
import SceneModal from "@/components/SceneModal/SceneModal";
import { playSound } from "@/lib/sound";
import "./DjiPhotobooth.css";

/**
 * Selfie redonda com a câmera DJI — pede permissão de câmera ao navegador,
 * mostra o preview em espelho dentro de uma moldura circular, conta "3, 2,
 * 1, diga xis!" e captura um PNG redondo (cantos transparentes) que dá pra
 * baixar. Tudo no cliente: nenhuma imagem sai do navegador da pessoa.
 *
 * Fases: "requesting" (pedindo permissão) → "live" (preview rodando) →
 * "counting" (contagem antes do clique) → "captured" (foto pronta). Ou
 * "denied"/"unsupported" se a câmera não puder ser usada — a experiência
 * ainda assim fecha normalmente, só sem foto.
 */

type Phase = "requesting" | "live" | "counting" | "captured" | "denied" | "unsupported";

const COUNT_START = 3;
const TICK_MS = 750;
const SHUTTER_DELAY_MS = 500;

type Props = {
  onClosed: () => void;
  onJournal?: (photo: string) => void;
  originPoint?: { x: number; y: number } | null;
};

export default function DjiPhotobooth({ onClosed, originPoint, onJournal }: Props) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // se o navegador nem tem a API, nem precisa tentar — calculado na
  // inicialização (não dentro do efeito) pra não disparar um setState
  // síncrono assim que o componente monta.
  const [phase, setPhase] = useState<Phase>(() =>
    typeof navigator !== "undefined" && typeof navigator.mediaDevices?.getUserMedia === "function"
      ? "requesting"
      : "unsupported"
  );
  const [count, setCount] = useState(COUNT_START);
  const [photo, setPhoto] = useState<string | null>(null);

  /* ---- pede a câmera ao montar; libera ao desmontar (fecha o modal) ---- */
  useEffect(() => {
    if (phase === "unsupported") return;
    let disposed = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (disposed) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setPhase("live");
      })
      .catch((err: DOMException) => {
        if (disposed) return;
        setPhase(err.name === "NotFoundError" ? "unsupported" : "denied");
      });

    return () => {
      disposed = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
    // só na montagem — `phase` aqui é só a checagem inicial de suporte,
    // não deve re-pedir a câmera a cada troca de fase.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- captura o quadro atual num canvas quadrado, recortado em círculo —
     espelhado igual ao preview, pra foto final bater com o que a pessoa viu ---- */
  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;

    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    ctx.restore();

    playSound("shutter");
    setPhoto(canvas.toDataURL("image/png"));
  }, []);

  /* ---- contagem "3, 2, 1, diga xis!" até o clique de verdade ---- */
  useEffect(() => {
    if (phase !== "counting") return;
    if (count > 0) {
      const t = window.setTimeout(() => setCount((c) => c - 1), TICK_MS);
      return () => window.clearTimeout(t);
    }
    // count chegou a 0: já mostrando "diga xis!" — espera um instante,
    // tira a foto de verdade e revela o resultado.
    const t = window.setTimeout(() => {
      capture();
      setPhase("captured");
    }, SHUTTER_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [phase, count, capture]);

  const startCountdown = () => {
    setCount(COUNT_START);
    setPhase("counting");
  };

  const retake = () => {
    setPhoto(null);
    setPhase("live");
  };

  const statusText =
    phase === "requesting"
      ? t("pedindo acesso à câmera…", "requesting camera access…")
      : phase === "counting"
        ? count > 0
          ? String(count)
          : "diga xis!"
        : phase === "captured"
          ? t("foto tirada!", "photo taken!")
          : null;

  return (
    <SceneModal
      onClosed={onClosed}
      dialogClassName="dji-photobooth"
      aria-labelledby="dji-photobooth-title"
      originPoint={originPoint}
    >
      <p className="dji-photobooth__sign">{t("click · câmera DJI", "click · DJI camera")}</p>
      <h2 id="dji-photobooth-title" className="dji-photobooth__title">
        diga &ldquo;xis&rdquo;!
      </h2>

      <p className="sr-only" role="status" aria-live="polite">
        {statusText}
      </p>

      <div className="dji-photobooth__frame">
        {phase === "captured" && photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={t("Sua selfie redonda", "Your round selfie")} className="dji-photobooth__photo" />
        ) : (
          <video ref={videoRef} className="dji-photobooth__video" autoPlay muted playsInline aria-hidden="true" />
        )}

        {phase === "counting" && (
          <span className="dji-photobooth__count" aria-hidden="true">
            {count > 0 ? count : "xis!"}
          </span>
        )}

        {phase === "requesting" && (
          <span className="dji-photobooth__hint" aria-hidden="true">
            {t("pedindo acesso à câmera…", "requesting camera access…")}
          </span>
        )}
      </div>

      <canvas ref={canvasRef} hidden />

      {phase === "denied" && (
        <p className="dji-photobooth__msg">
          {t("Sem acesso à câmera. Permita o acesso nas configurações do navegador e tente de novo.", "Camera access was denied. Allow access in your browser settings and try again.")}
        </p>
      )}
      {phase === "unsupported" && (
        <p className="dji-photobooth__msg">
          {t("Esse navegador (ou essa conexão) não deixa usar a câmera aqui — costuma funcionar em HTTPS ou localhost.", "The camera is unavailable in this browser or connection.")}
        </p>
      )}

      <div className="dji-photobooth__actions">
        {phase === "live" && (
          <button type="button" className="dji-photobooth__btn" onClick={startCountdown}>
            {t("tirar foto", "take a photo")}
          </button>
        )}
        {phase === "captured" && (
          <>
            <button type="button" className="dji-photobooth__btn dji-photobooth__btn--ghost" onClick={retake}>
              {t("tirar outra", "retake")}
            </button>
            {photo && (
              <a className="dji-photobooth__btn" href={photo} download="selfie-dollhouse.png">
                {t("baixar", "download")}
              </a>
            )}
            {photo && onJournal && (
              <button type="button" className="dji-photobooth__btn" onClick={() => onJournal(photo)}>
                {t("deixar um recado no meu journal", "leave a note in my journal")}
              </button>
            )}
          </>
        )}
      </div>
    </SceneModal>
  );
}
