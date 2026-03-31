/**
 * 8-bit Web Audio synthesizer for Solana Trail
 * All sounds generated programmatically — no external files needed.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

// ============================================================
// CORE OSCILLATOR
// ============================================================
function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "square",
  volume = 0.15,
  delay = 0,
) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  } catch { /* audio not available */ }
}

function playNoise(duration: number, volume = 0.2, delay = 0) {
  try {
    const ctx = getCtx();
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2.5);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    source.connect(gain).connect(ctx.destination);
    source.start(ctx.currentTime + delay);
  } catch { /* audio not available */ }
}

// ============================================================
// SOUND EFFECTS
// ============================================================

/** Keyboard typing click — randomized pitch for realism */
export function sfxType() {
  playTone(700 + Math.random() * 500, 0.025, "square", 0.08);
}

/** Button click — clean blip */
export function sfxClick() {
  playTone(600, 0.06, "square", 0.12);
  playTone(800, 0.04, "square", 0.08, 0.03);
}

/** Gunshot — noise burst + low thump */
export function sfxGunshot() {
  playNoise(0.12, 0.3);
  playTone(80, 0.15, "sine", 0.2);
}

/** Death jingle — descending minor notes */
export function sfxDeath() {
  const notes = [440, 415, 349, 311, 261];
  notes.forEach((freq, i) => playTone(freq, 0.3, "triangle", 0.15, i * 0.18));
}

/** Good event — ascending happy blips */
export function sfxGood() {
  const notes = [523, 659, 784];
  notes.forEach((freq, i) => playTone(freq, 0.12, "square", 0.1, i * 0.1));
}

/** Bad event — descending sad notes */
export function sfxBad() {
  const notes = [349, 311, 261];
  notes.forEach((freq, i) => playTone(freq, 0.15, "triangle", 0.12, i * 0.12));
}

/** Score reveal fanfare — triumphant ascending arpeggio */
export function sfxScoreReveal() {
  const notes = [261, 329, 392, 523, 659, 784, 1047];
  notes.forEach((freq, i) => playTone(freq, 0.25, "triangle", 0.12, i * 0.12));
  // Final chord
  setTimeout(() => {
    playTone(523, 0.6, "triangle", 0.1);
    playTone(659, 0.6, "triangle", 0.08);
    playTone(784, 0.6, "triangle", 0.08);
  }, notes.length * 120);
}

/** Wagon rolling — low rumble */
export function sfxWagon() {
  playTone(60, 0.8, "sawtooth", 0.06);
  playTone(80, 0.6, "sawtooth", 0.04, 0.2);
}

/** CRT boot — rising electronic whine */
export function sfxBoot() {
  const ctx = getCtx();
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch { /* audio not available */ }
}

/** Glitch static — short noise burst */
export function sfxGlitch() {
  playNoise(0.3, 0.15);
  playTone(100, 0.1, "square", 0.1, 0.1);
  playNoise(0.15, 0.1, 0.2);
}

/** Miss — sad trombone wah-wah */
export function sfxMiss() {
  playTone(311, 0.3, "triangle", 0.12);
  playTone(293, 0.3, "triangle", 0.12, 0.25);
  playTone(277, 0.4, "triangle", 0.1, 0.5);
}

// ============================================================
// OREGON TRAIL THEME — simplified 8-bit melody
// Plays a short memorable loop inspired by the classic
// ============================================================
let themeTimeout: ReturnType<typeof setTimeout> | null = null;

export function playTheme() {
  stopTheme();
  // Simple frontier-style melody in C major
  const melody: [number, number][] = [
    // freq, duration pairs
    [523, 0.2],  // C5
    [587, 0.2],  // D5
    [659, 0.3],  // E5
    [523, 0.2],  // C5
    [0, 0.1],    // rest
    [523, 0.2],  // C5
    [587, 0.2],  // D5
    [659, 0.3],  // E5
    [784, 0.3],  // G5
    [659, 0.2],  // E5
    [0, 0.1],    // rest
    [784, 0.2],  // G5
    [880, 0.2],  // A5
    [784, 0.3],  // G5
    [659, 0.2],  // E5
    [587, 0.4],  // D5
    [0, 0.2],    // rest
    [523, 0.2],  // C5
    [440, 0.2],  // A4
    [523, 0.4],  // C5
  ];

  let time = 0;
  melody.forEach(([freq, dur]) => {
    if (freq > 0) {
      themeTimeout = setTimeout(() => playTone(freq, dur * 0.9, "triangle", 0.08), time * 1000);
    }
    time += dur;
  });
}

export function stopTheme() {
  if (themeTimeout) {
    clearTimeout(themeTimeout);
    themeTimeout = null;
  }
}
