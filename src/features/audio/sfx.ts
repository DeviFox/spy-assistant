/*
 * Atmosphere: a quiet generative background track and small interface sounds.
 * Synthesised with WebAudio like the alarm (no audio files); every function is a no-op without WebAudio.
 */
import type { LogLevel } from '../../types';
import { audio, tone } from '../alarm/siren';

/* ---------- Background track ---------- */

let master: GainNode | null = null;
const LEVEL = 1;

/** A minor pentatonic, walked step by step so the line sounds like a melody, not noise. */
const SCALE = [220, 261.6, 293.7, 329.6, 392, 440, 523.3, 587.3, 659.3];

/**
 * Low filtered drone, slowly breathing, with sparse soft notes echoing over it.
 * Browsers only allow audio after a user gesture, so call this from one. Safe to call repeatedly.
 */
export function startAmbient() {
  const a = audio();
  if (!a || master) return;
  const t0 = a.currentTime;
  master = a.createGain();
  master.gain.setValueAtTime(0, t0);
  master.gain.linearRampToValueAtTime(LEVEL, t0 + 6); // fade in
  master.connect(a.destination);

  // Drone: three detuned saws under a low-pass whose cutoff drifts with a very slow LFO.
  const lp = a.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 300;
  lp.Q.value = 0.8;
  const pad = a.createGain();
  pad.gain.value = 0.011;
  lp.connect(pad).connect(master);
  for (const [f, detune] of [[55, 0], [82.4, 5], [110, -6]]) {
    const o = a.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = f;
    o.detune.value = detune;
    o.connect(lp);
    o.start();
  }
  const lfo = a.createOscillator();
  lfo.frequency.value = 0.035;
  const depth = a.createGain();
  depth.gain.value = 130;
  lfo.connect(depth).connect(lp.frequency);
  lfo.start();

  // Echo for the notes.
  const delay = a.createDelay(2);
  delay.delayTime.value = 0.52;
  const feedback = a.createGain();
  feedback.gain.value = 0.4;
  const wet = a.createGain();
  wet.gain.value = 0.45;
  delay.connect(feedback).connect(delay);
  delay.connect(wet).connect(master);
  const notes = a.createGain();
  notes.connect(master);
  notes.connect(delay);

  let i = 3;
  const play = () => {
    i = Math.max(0, Math.min(SCALE.length - 1, i + [-2, -1, -1, 1, 1, 2][Math.floor(Math.random() * 6)]));
    const t = a.currentTime + 0.05;
    const o = a.createOscillator();
    o.type = 'triangle';
    o.frequency.value = SCALE[i];
    const g = a.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.009, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    o.connect(g).connect(notes);
    o.start(t);
    o.stop(t + 2.7);
    window.setTimeout(play, 1500 + Math.random() * 2800);
  };
  window.setTimeout(play, 3000);
}

/** Fades the background out while the alarm owns the screen, and back in afterwards. */
export function duckAmbient(duck: boolean) {
  const a = audio();
  if (!a || !master) return;
  const n = a.currentTime;
  master.gain.cancelScheduledValues(n);
  master.gain.setValueAtTime(master.gain.value, n);
  master.gain.linearRampToValueAtTime(duck ? 0 : LEVEL, n + (duck ? 0.3 : 2.5));
}

/* ---------- Interface sounds ---------- */

/** Before the first gesture the context is suspended; sounds queued then would all burst out at once later. */
const live = () => audio()?.state === 'running';

/** A new line in the console. The tone follows the line's level. */
export function logBlip(level: LogLevel) {
  if (level === 'input' || !live()) return; // the agent's own typing needs no echo
  if (level === 'success') {
    tone(1320, 0, 0.05, 0.014, 'square');
    tone(1760, 0.05, 0.07, 0.014, 'square');
  } else if (level === 'warning') {
    tone(740, 0, 0.05, 0.016, 'square');
    tone(740, 0.08, 0.05, 0.016, 'square');
  } else if (level === 'error') {
    tone(196, 0, 0.12, 0.022, 'square');
  } else {
    tone(2100, 0, 0.025, 0.01, 'square');
    tone(2800, 0.03, 0.02, 0.007, 'square');
  }
}

/** A window opens: a short upward chirp. */
export function modalOpen() {
  if (!live()) return;
  tone(420, 0, 0.09, 0.02, 'sine', 1300);
  tone(2400, 0.07, 0.025, 0.008, 'square');
}

/** A window closes: the same chirp falling. */
export function modalClose() {
  if (!live()) return;
  tone(1100, 0, 0.08, 0.016, 'sine', 320);
}
