'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic, Loader2, BrainCircuit, AudioLines, Waves } from 'lucide-react';
import type { VoiceAgentStatus } from '@/types';

interface VoiceOrbProps {
  status: VoiceAgentStatus;
  volumeLevel: number;
}

// ---------- Simplex-style 2D noise ----------
// Attempt to mimic a fluid, organic distortion
const PERM = new Uint8Array(512);
const GRAD = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1],
];
(function initNoise() {
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
})();

function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a: number, b: number, t: number) { return a + t * (b - a); }
function dot2(g: number[], x: number, y: number) { return g[0] * x + g[1] * y; }

function noise2D(x: number, y: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);
  const g00 = GRAD[PERM[X + PERM[Y]] & 7];
  const g10 = GRAD[PERM[X + 1 + PERM[Y]] & 7];
  const g01 = GRAD[PERM[X + PERM[Y + 1]] & 7];
  const g11 = GRAD[PERM[X + 1 + PERM[Y + 1]] & 7];
  const n00 = dot2(g00, xf, yf);
  const n10 = dot2(g10, xf - 1, yf);
  const n01 = dot2(g01, xf, yf - 1);
  const n11 = dot2(g11, xf - 1, yf - 1);
  return lerp(lerp(n00, n10, u), lerp(n01, n11, u), v);
}

function fbm(x: number, y: number, octaves: number): number {
  let val = 0, amp = 1, freq = 1, max = 0;
  for (let i = 0; i < octaves; i++) {
    val += noise2D(x * freq, y * freq) * amp;
    max += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return val / max;
}

// ---------- Color helpers ----------
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

// ---------- Constants ----------
const SIZE = 300;
const CENTER = SIZE / 2;
const BASE_RADIUS = 90;

function getStatusHueShift(status: VoiceAgentStatus): number {
  switch (status) {
    case 'idle': return 0;
    case 'connecting': return 30;
    case 'listening': return 180;    // cyan-shifted
    case 'thinking': return 270;     // purple-shifted
    case 'speaking': return 120;     // green-blue shifted
  }
}

export function VoiceOrb({ status, volumeLevel }: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const volumeRef = useRef(0);
  const smoothVolumeRef = useRef(0);
  const statusRef = useRef(status);

  statusRef.current = status;

  useEffect(() => {
    volumeRef.current = volumeLevel;
  }, [volumeLevel]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const currentStatus = statusRef.current;
    const isActive = currentStatus !== 'idle';
    const targetVol = volumeRef.current;

    // Smooth volume interpolation
    smoothVolumeRef.current += (targetVol - smoothVolumeRef.current) * 0.15;
    const vol = smoothVolumeRef.current;

    const time = Date.now() * 0.001;
    const hueShift = getStatusHueShift(currentStatus);

    ctx.clearRect(0, 0, SIZE * dpr, SIZE * dpr);
    ctx.save();
    ctx.scale(dpr, dpr);

    // ---------- 1. Build the distorted blob path ----------
    const noiseScale = 1.8;
    const noiseSpeed = isActive ? 0.8 : 0.3;
    const noiseAmplitude = isActive ? 12 + vol * 30 : 6;
    const pointCount = 200;

    function getBlobRadius(angle: number): number {
      const nx = Math.cos(angle) * noiseScale + time * noiseSpeed;
      const ny = Math.sin(angle) * noiseScale + time * noiseSpeed * 0.7;
      const n = fbm(nx, ny, 4);
      return BASE_RADIUS + n * noiseAmplitude;
    }

    function getBlobPoint(angle: number): [number, number] {
      const r = getBlobRadius(angle);
      return [CENTER + Math.cos(angle) * r, CENTER + Math.sin(angle) * r];
    }

    // Create blob path
    const blobPath = new Path2D();
    const firstPt = getBlobPoint(0);
    blobPath.moveTo(firstPt[0], firstPt[1]);
    for (let i = 1; i <= pointCount; i++) {
      const angle = (i / pointCount) * Math.PI * 2;
      const pt = getBlobPoint(angle);
      blobPath.lineTo(pt[0], pt[1]);
    }
    blobPath.closePath();

    // ---------- 2. Ambient glow behind the blob ----------
    const glowSize = BASE_RADIUS + 60 + vol * 20;
    const ambientGlow = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, glowSize);
    ambientGlow.addColorStop(0, `hsla(${220 + hueShift}, 80%, 70%, ${isActive ? 0.08 + vol * 0.06 : 0.03})`);
    ambientGlow.addColorStop(0.5, `hsla(${280 + hueShift}, 60%, 50%, ${isActive ? 0.04 : 0.01})`);
    ambientGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = ambientGlow;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // ---------- 3. Chromatic aberration layers ----------
    // Draw the blob 3 times offset for R, G, B channels
    const chromaOffset = isActive ? 2.5 + vol * 3 : 1.5;
    const layers = [
      { color: `hsla(${0 + hueShift}, 100%, 65%, 0.25)`, dx: -chromaOffset, dy: -chromaOffset * 0.5 },
      { color: `hsla(${120 + hueShift}, 100%, 65%, 0.2)`, dx: chromaOffset * 0.5, dy: -chromaOffset },
      { color: `hsla(${240 + hueShift}, 100%, 70%, 0.25)`, dx: chromaOffset, dy: chromaOffset * 0.5 },
    ];

    for (const layer of layers) {
      ctx.save();
      ctx.translate(layer.dx, layer.dy);
      ctx.fillStyle = layer.color;
      ctx.fill(blobPath);
      ctx.restore();
    }

    // ---------- 4. Main blob fill with iridescent gradient ----------
    ctx.save();
    ctx.clip(blobPath);

    // Dark base
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Iridescent edge glow — draw multiple radial color bands
    const edgeColors = [
      { angle: time * 0.3, hue: 200 + hueShift, radius: BASE_RADIUS * 0.9 },
      { angle: time * 0.3 + 2, hue: 280 + hueShift, radius: BASE_RADIUS * 0.85 },
      { angle: time * 0.3 + 4, hue: 340 + hueShift, radius: BASE_RADIUS * 0.95 },
      { angle: time * 0.5 + 1, hue: 160 + hueShift, radius: BASE_RADIUS * 0.8 },
    ];

    for (const ec of edgeColors) {
      const ex = CENTER + Math.cos(ec.angle) * 25;
      const ey = CENTER + Math.sin(ec.angle) * 25;
      const grad = ctx.createRadialGradient(ex, ey, ec.radius * 0.3, ex, ey, ec.radius * 1.2);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.6, `hsla(${ec.hue}, 90%, 55%, ${0.15 + vol * 0.1})`);
      grad.addColorStop(0.85, `hsla(${ec.hue + 30}, 80%, 45%, ${0.25 + vol * 0.15})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, SIZE, SIZE);
    }

    // Interior brightness — glassy center
    const interiorGrad = ctx.createRadialGradient(
      CENTER - 15, CENTER - 20, 0,
      CENTER, CENTER, BASE_RADIUS
    );
    interiorGrad.addColorStop(0, `rgba(255,255,255,${isActive ? 0.25 + vol * 0.15 : 0.15})`);
    interiorGrad.addColorStop(0.3, `rgba(200,210,255,${isActive ? 0.1 : 0.05})`);
    interiorGrad.addColorStop(0.7, 'transparent');
    interiorGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = interiorGrad;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Specular highlight (top-left)
    const specGrad = ctx.createRadialGradient(
      CENTER - 25, CENTER - 35, 0,
      CENTER - 25, CENTER - 35, 45
    );
    specGrad.addColorStop(0, `rgba(255,255,255,${isActive ? 0.5 + vol * 0.2 : 0.35})`);
    specGrad.addColorStop(0.4, `rgba(255,255,255,${isActive ? 0.15 : 0.08})`);
    specGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = specGrad;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Secondary specular (bottom-right, subtle)
    const spec2 = ctx.createRadialGradient(
      CENTER + 30, CENTER + 25, 0,
      CENTER + 30, CENTER + 25, 30
    );
    spec2.addColorStop(0, `rgba(255,255,255,${isActive ? 0.1 : 0.04})`);
    spec2.addColorStop(1, 'transparent');
    ctx.fillStyle = spec2;
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.restore();

    // ---------- 5. Edge highlight / rim light ----------
    ctx.save();
    ctx.strokeStyle = `hsla(${220 + hueShift}, 60%, 75%, ${isActive ? 0.15 + vol * 0.1 : 0.08})`;
    ctx.lineWidth = 1.5;
    ctx.stroke(blobPath);
    ctx.restore();

    // ---------- 6. Pulse rings when active ----------
    if (isActive) {
      const pulseCount = 2;
      for (let p = 0; p < pulseCount; p++) {
        const phase = ((time * 0.6 + p * 0.5) % 1);
        const pulseR = BASE_RADIUS + phase * 50;
        const pulseAlpha = (1 - phase) * 0.08 * (1 + vol);
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${220 + hueShift}, 70%, 70%, ${pulseAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    ctx.restore();
    frameRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [draw]);

  const statusIcons = {
    idle: <Mic className="h-6 w-6" />,
    connecting: <Loader2 className="h-6 w-6 animate-spin" />,
    listening: <Waves className="h-6 w-6" />,
    thinking: <BrainCircuit className="h-6 w-6" />,
    speaking: <AudioLines className="h-6 w-6" />,
  };

  return (
    <div className="relative flex items-center justify-center py-2">
      <canvas ref={canvasRef} className="relative z-10" />
      <div className="absolute z-20 flex items-center justify-center">
        <motion.div
          key={status}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="text-white/70"
        >
          {statusIcons[status]}
        </motion.div>
      </div>
    </div>
  );
}
