"use client";

import { useSyncExternalStore } from "react";

/**
 * Efeitos sonoros do dollhouse (clique do interruptor, telefone tocando no
 * hover) + controle de mudo global, persistido em localStorage pra
 * sobreviver a reloads.
 *
 * Mesmo padrão de `usePrefersReducedMotion`/`useNoHover` em `lib/motion.ts`:
 * `useSyncExternalStore` com `getServerSnapshot` fixo evita o mismatch de
 * hidratação entre "sempre com som" (servidor, sem acesso a localStorage) e
 * a preferência real salva no navegador.
 */

const MUTE_KEY = "dollhouse-muted";

export type SoundId = "switch" | "shutter";

const SOURCES: Record<SoundId, string> = {
  switch: "/sounds/switch-click.wav",
  shutter: "/sounds/camera-shutter.wav",
};

// Um <audio> por som, reaproveitado — evita recriar o elemento (e re-buscar
// o arquivo) a cada play().
const cache = new Map<SoundId, HTMLAudioElement>();

function getAudio(id: SoundId): HTMLAudioElement {
  let audio = cache.get(id);
  if (!audio) {
    audio = new Audio(SOURCES[id]);
    audio.preload = "auto";
    cache.set(id, audio);
  }
  return audio;
}

/* ---------- estado de mudo ---------- */

let initialized = false;
let muted = false;
const listeners = new Set<() => void>();

function ensureInitialized() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  try {
    muted = window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    muted = false; // ex. modo privado sem storage — começa com som, ok
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function getSnapshot(): boolean {
  ensureInitialized();
  return muted;
}

function getServerSnapshot(): boolean {
  return false;
}

/** Estado atual de mudo — usar no componente do botão (canto da tela). */
export function useMuted() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setMuted(value: boolean) {
  muted = value;
  initialized = true;
  try {
    window.localStorage.setItem(MUTE_KEY, value ? "1" : "0");
  } catch {
    /* sem persistência disponível — ainda funciona nesta sessão */
  }
  listeners.forEach((l) => l());
}

export function toggleMuted() {
  ensureInitialized();
  setMuted(!muted);
}

/**
 * Toca um efeito sonoro (sem-op se mudo). Ignorado silenciosamente se o
 * navegador bloquear o play() (política de autoplay antes da 1ª interação,
 * ou aba em segundo plano) — não é erro que o visitante precise ver.
 */
export function playSound(id: SoundId) {
  ensureInitialized();
  if (muted) return;
  const audio = getAudio(id);
  try {
    audio.currentTime = 0;
  } catch {
    /* ainda carregando — play() tenta mesmo assim */
  }
  void audio.play().catch(() => {});
}

/* ---------- máquina de café: sintetizado, sem arquivo de terceiro ---------- */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  return audioCtx;
}

/**
 * Vapor + zumbido mecânico da máquina de café (hover do hotspot `breville`
 * no cozy corner) — sintetizado na hora via Web Audio API, sem depender de
 * um arquivo de som de terceiros (sem questão de licença pra resolver).
 * Toca inteiro (~0,65s) a cada vez que o mouse encosta na máquina, mesmo
 * que a chamada anterior ainda esteja terminando — cada chamada cria seus
 * próprios nós, ao contrário do `playSound` acima (que reaproveita um único
 * <audio> por som).
 *
 * Como os outros efeitos deste arquivo: sem-op se mudo; qualquer bloqueio
 * do navegador (AudioContext parado antes da 1ª interação real de clique)
 * é ignorado em silêncio.
 */
export function playCoffeeMachineSound() {
  ensureInitialized();
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === "suspended") void ctx.resume();

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);

    // chiado de vapor: ruído branco num filtro passa-faixa, ataque rápido e
    // decaimento suave (~0,65s no total).
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.65, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 2600;
    bandpass.Q.value = 0.9;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.9, now + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    noise.connect(bandpass).connect(noiseGain).connect(master);

    // zumbido mecânico curto no início (a bomba "ligando"), tom descendo.
    const hum = ctx.createOscillator();
    hum.type = "sawtooth";
    hum.frequency.setValueAtTime(140, now);
    hum.frequency.exponentialRampToValueAtTime(70, now + 0.3);

    const humGain = ctx.createGain();
    humGain.gain.setValueAtTime(0.0001, now);
    humGain.gain.exponentialRampToValueAtTime(0.5, now + 0.03);
    humGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    hum.connect(humGain).connect(master);

    noise.start(now);
    noise.stop(now + 0.65);
    hum.start(now);
    hum.stop(now + 0.3);
  } catch {
    /* API indisponível ou contexto bloqueado — ignora, mesmo espírito do
       catch em playSound(). */
  }
}

let phoneRingTimer: number | null = null;

const PHONE_RING_DURATION = 0.3; // segundos, do início do 1º "ding" ao fim do 2º

/**
 * Uma batida de sino mecânico ("ding") — fundamental + uma parcial
 * levemente inarmônica (não é múltiplo inteiro da fundamental) mais fraca
 * e mais curta, que é o que dá o timbre metálico de sino batido em vez de
 * um apito eletrônico limpo. Ataque quase instantâneo (alguns ms) e
 * decaimento exponencial curto — uma pancada, não um tom sustentado.
 */
function scheduleBellDing(ctx: AudioContext, destination: AudioNode, startTime: number, freq: number) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.55, startTime + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.11);
  gain.connect(destination);

  const fundamental = ctx.createOscillator();
  fundamental.type = "sine";
  fundamental.frequency.value = freq;
  fundamental.connect(gain);

  const overtoneGain = ctx.createGain();
  overtoneGain.gain.setValueAtTime(0.0001, startTime);
  overtoneGain.gain.exponentialRampToValueAtTime(0.22, startTime + 0.003);
  overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.08);
  overtoneGain.connect(destination);

  const overtone = ctx.createOscillator();
  overtone.type = "sine";
  overtone.frequency.value = freq * 2.4; // parcial inarmônica — timbre metálico, não um harmônico "limpo"
  overtone.connect(overtoneGain);

  fundamental.start(startTime);
  fundamental.stop(startTime + 0.12);
  overtone.start(startTime);
  overtone.stop(startTime + 0.09);
}

/**
 * Toque do telefone ao encostar o mouse — sintetizado na hora via Web Audio
 * (mesmo motivo/padrão do `playCoffeeMachineSound` acima: sem depender de
 * um arquivo de áudio de terceiros).
 *
 * "Trim... trim": DUAS batidas de sino curtas (`scheduleBellDing`), não um
 * tom contínuo com trêmulo — a versão anterior (um tom sustentado
 * modulado) não soava como duas pancadas de sino de verdade. Cada "ding"
 * tem uma frequência levemente diferente (1500Hz e 1420Hz) pra não soar
 * idêntico/robótico de um toque pro outro.
 *
 * Curto de propósito (~0,3s no total, as duas batidas): um toque rápido
 * ao passar o mouse, não uma campainha tocando até alguém atender.
 *
 * Ignora chamadas novas enquanto já está tocando (evita cortar/sobrepor o
 * toque se o visitante passar o mouse em cima de novo rapidinho).
 */
export function playPhoneRing() {
  ensureInitialized();
  if (muted || phoneRingTimer !== null) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === "suspended") void ctx.resume();

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.9; // nível geral — cada ding já tem seu próprio envelope
    master.connect(ctx.destination);

    scheduleBellDing(ctx, master, now, 1500); // "trim"
    scheduleBellDing(ctx, master, now + 0.14, 1420); // "trim"

    phoneRingTimer = window.setTimeout(() => {
      phoneRingTimer = null;
    }, PHONE_RING_DURATION * 1000);
  } catch {
    /* API indisponível ou contexto bloqueado — ignora, mesmo espírito do
       catch em playCoffeeMachineSound(). */
    phoneRingTimer = null;
  }
}
