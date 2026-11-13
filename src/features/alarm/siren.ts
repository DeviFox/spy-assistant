/*
 * Event sounds for the timed alarm, synthesised with WebAudio (no audio files, works offline).
 * Every function is a no-op when WebAudio is unavailable.
 */
type Ctor = typeof AudioContext;
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (!ctx) {
    const C: Ctor | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/**
 * Machine alarm for the countdown: a low drone under a fast triple beep (not a vehicle siren).
 * Returns a stop function that fades it out.
 */
export function startAlarm(volume = 0.05): () => void {
  const a = audio();
  if (!a) return () => {};
  const out = a.createGain();
  out.gain.value = 1;
  out.connect(a.destination);

  const drone = a.createOscillator();
  drone.type = 'sawtooth';
  drone.frequency.value = 55;
  const droneLp = a.createBiquadFilter();
  droneLp.type = 'lowpass';
  droneLp.frequency.value = 400;
  const droneGain = a.createGain();
  droneGain.gain.setValueAtTime(0, a.currentTime);
  droneGain.gain.linearRampToValueAtTime(volume * 0.9, a.currentTime + 0.2);
  drone.connect(droneLp).connect(droneGain).connect(out);
  drone.start();

  // Beep pattern every 0.7s: three short square beeps, scheduled slightly ahead.
  const period = 0.7;
  let next = a.currentTime + 0.05;
  const schedule = () => {
    while (next < a.currentTime + 0.4) {
      for (let i = 0; i < 3; i++) beepAt(a, out, 1046, next + i * 0.11, 0.07, volume);
      next += period;
    }
  };
  schedule();
  const timer = window.setInterval(schedule, 100);

  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    window.clearInterval(timer);
    const n = a.currentTime;
    out.gain.cancelScheduledValues(n);
    out.gain.setValueAtTime(1, n);
    out.gain.linearRampToValueAtTime(0, n + 0.1);
    drone.stop(n + 0.12);
    window.setTimeout(() => out.disconnect(), 400);
  };
}

function beepAt(a: AudioContext, dest: AudioNode, freq: number, t: number, dur: number, volume: number) {
  const g = a.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(volume, t + 0.004);
  g.gain.setValueAtTime(volume, t + dur - 0.01);
  g.gain.linearRampToValueAtTime(0, t + dur);
  const o = a.createOscillator();
  o.type = 'square';
  o.frequency.value = freq;
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + dur + 0.01);
}

let noiseBuf: AudioBuffer | null = null;
/** Short burst of band-passed digital noise with an optional chirp: one glitch. */
export function glitchBurst(intensity = 1) {
  const a = audio();
  if (!a) return;
  if (!noiseBuf) {
    noiseBuf = a.createBuffer(1, a.sampleRate * 0.5, a.sampleRate);
    const d = noiseBuf.getChannelData(0);
    // Sample-and-hold noise sounds more "digital" than plain white noise.
    let v = 0;
    for (let i = 0; i < d.length; i++) {
      if (i % 6 === 0) v = Math.random() * 2 - 1;
      d[i] = v;
    }
  }
  const t = a.currentTime;
  const dur = 0.04 + Math.random() * 0.12;
  const src = a.createBufferSource();
  src.buffer = noiseBuf;
  const bp = a.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 600 + Math.random() * 3400;
  bp.Q.value = 2;
  const g = a.createGain();
  const vol = 0.07 * intensity;
  g.gain.setValueAtTime(vol, t);
  g.gain.setValueAtTime(vol, t + dur * 0.8);
  g.gain.linearRampToValueAtTime(0, t + dur);
  src.connect(bp).connect(g).connect(a.destination);
  src.start(t, Math.random() * 0.3, dur + 0.02);
  if (Math.random() < 0.4) tone(200 + Math.random() * 1800, 0, 0.05, 0.03 * intensity, 'square', 80 + Math.random() * 3000);
}

function tone(freq: number, start: number, dur: number, volume: number, type: OscillatorType, endFreq?: number) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + start;
  const g = a.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(volume, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const o = a.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

/** Short tick for the last seconds of the countdown. */
export const tick = () => tone(1400, 0, 0.06, 0.05, 'square');
/**
 * Critical error: workstation locked. A digital crunch, three dissonant "ERR" stabs
 * (two detuned squares beating against each other) and a stepped power-down sweep.
 */
export function lockdownTone() {
  const a = audio();
  if (!a) return;
  const t0 = a.currentTime + 0.02;
  const out = a.createGain();
  out.gain.value = 1;
  const lp = a.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 3200;
  out.connect(lp).connect(a.destination);

  // 1. Crunch: the signal tears.
  glitchBurst(1.6);
  glitchBurst(1.2);

  // 2. Three hard stabs, dissonant and buzzy.
  [0.14, 0.44, 0.74].forEach((at, i) => {
    const t = t0 + at;
    const dur = i === 2 ? 0.34 : 0.22;
    const g = a.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.075, t + 0.005);
    g.gain.setValueAtTime(0.075, t + dur - 0.03);
    g.gain.linearRampToValueAtTime(0, t + dur);
    g.connect(out);
    for (const f of [146.8, 155.6, 293.7]) {
      const o = a.createOscillator();
      o.type = 'square';
      o.frequency.value = f;
      o.connect(g);
      o.start(t);
      o.stop(t + dur + 0.01);
    }
  });

  // 3. Power-down: pitch falls in hard digital steps, then cuts out.
  const t = t0 + 1.16;
  const dur = 1.1;
  const o = a.createOscillator();
  o.type = 'sawtooth';
  const steps = 22;
  for (let k = 0; k <= steps; k++) o.frequency.setValueAtTime(440 * Math.pow(30 / 440, k / steps), t + (dur * k) / steps);
  const g = a.createGain();
  g.gain.setValueAtTime(0.07, t);
  g.gain.setValueAtTime(0.07, t + dur * 0.7);
  g.gain.linearRampToValueAtTime(0, t + dur);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + dur + 0.02);
  window.setTimeout(() => out.disconnect(), (1.16 + dur + 0.3) * 1000);
}
/** Two rising blips: answer accepted. */
export const grantedTone = () => {
  tone(880, 0, 0.12, 0.06, 'square');
  tone(1320, 0.12, 0.18, 0.06, 'square');
};
