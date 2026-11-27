// Mismo patrón que el resto del hub (imaginaloReact/enganchadoReact/
// enroscaloReact/emojinaloReact/embocaloReact/encastraloReact): tonos
// sintetizados con la Web Audio API, no archivos de audio — ningún repo
// del hub carga .mp3/.wav.

function playTone(
  type: OscillatorType,
  frequencies: { at: number; hz: number }[],
  durationSec: number,
  volume: number,
): void {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    for (const { at, hz } of frequencies) {
      osc.frequency.setValueAtTime(hz, ctx.currentTime + at);
    }
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + durationSec);
  } catch {
    // Web Audio no disponible (navegador viejo, modo restringido, etc.)
  }
}

// Revelar una celda simple: un "tick" corto y neutro — pasa todo el
// tiempo (cada toque seguro), así que tiene que ser el más discreto de
// los tres.
export function playRevealSound(): void {
  playTone("sine", [{ at: 0, hz: 600 }], 0.08, 0.1);
}

// Acertar la bandera en una celda de letra: mismo arpegio ascendente de
// "éxito" que el resto del hub.
export function playFlagSound(): void {
  playTone(
    "sine",
    [
      { at: 0, hz: 523 },
      { at: 0.1, hz: 784 },
      { at: 0.2, hz: 1047 },
    ],
    0.35,
    0.2,
  );
}

// Perder una vida (pisar una bomba directo, o marcar con bandera una
// celda que era simple): mismo barrido descendente de "error" que el
// resto del hub — un glissando real (exponentialRampToValueAtTime), no
// notas escalonadas, así que va aparte de playTone en vez de forzarlo a
// su forma de "lista de notas".
export function playLoseLifeSound(): void {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "square";
    osc.frequency.setValueAtTime(280, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Web Audio no disponible (navegador viejo, modo restringido, etc.)
  }
}
