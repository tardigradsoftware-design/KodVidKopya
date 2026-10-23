// Timing for the 29 Ekim film.
// The narration was generated once, then measured: the numbers below are real
// measurements of public/voice.mp3 (ffmpeg silencedetect + duration), not guesses.
// Every scene length is derived from them so the picture lands on the voice.

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Narration starts this many seconds into the film (impact lands first). */
export const VOICE_AT = 0.7;

/** Measured length of public/voice.mp3, seconds. */
export const VOICE_SECONDS = 28.608;

export const sec = (s: number): number => Math.round(s * FPS);
/** Voice-file time (s) -> film frame. */
export const voiceFrame = (t: number): number => sec(t + VOICE_AT);

// Speech windows measured on the processed voice file, in voice time.
const SENTENCE_WINDOWS: readonly (readonly [number, number])[] = [
  [0.0, 1.923],
  [2.475, 5.292],
  [5.765, 7.701],
  [8.318, 10.197],
  [10.765, 14.61],
  [15.076, 23.285],
  [23.79, 24.879],
  [25.354, 28.374],
];

/** Word windows measured for the list in sentence 6 (one pause per value). */
const VALUE_WINDOWS: readonly (readonly [number, number])[] = [
  [15.076, 16.305],
  [16.718, 18.588],
  [18.934, 19.686],
  [19.938, 20.755],
  [21.008, 21.47],
  [21.691, 23.285],
];

export const SCRIPT: readonly string[] = [
  "Bin dokuz yüz yirmi üç.",
  "Küllerin arasından yükselen bir milletin doğuşu; yeni bir devletin ilk nefesi.",
  "Al sancak göklere açıldı.",
  "Ay yıldız, bu topraklarda dalgalandı ve dalgalanıyor.",
  "Aradan geçen her yıl, bu ülkeyi biraz daha güçlendirdi.",
  "Egemenlik, bağımsızlık, akıl, özgürlük ve eşitlik.",
  "Nice yüzyıllara.",
  "Cumhuriyetimizin yüz üçüncü yılı kutlu olsun!",
];

export type Word = { readonly text: string; readonly start: number; readonly end: number };

const VOWELS = new Set("aeıioöuüâîû".split(""));

const syllables = (word: string): number => {
  let n = 0;
  for (const ch of word.toLocaleLowerCase("tr")) if (VOWELS.has(ch)) n += 1;
  return Math.max(1, n);
};

/** Heavier words take longer to say: syllables, plus a breath after punctuation. */
const weightOf = (word: string): number => syllables(word) * 10 + (/[.,;:!?]$/.test(word) ? 12 : 0);

const spread = (text: string, t0: number, t1: number): Word[] => {
  const tokens = text.split(/\s+/).filter(Boolean);
  const weights = tokens.map(weightOf);
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  return tokens.map((token, i) => {
    const start = t0 + (acc / total) * (t1 - t0);
    acc += weights[i];
    const end = t0 + (acc / total) * (t1 - t0);
    return { text: token, start, end };
  });
};

const wordsOf = (i: number): Word[] => {
  const [t0, t1] = SENTENCE_WINDOWS[i];
  if (i === 5) {
    const tokens = SCRIPT[5].split(/\s+/).filter(Boolean);
    return tokens.map((token, k) => ({ text: token, start: VALUE_WINDOWS[k][0], end: VALUE_WINDOWS[k][1] }));
  }
  return spread(SCRIPT[i], t0, t1);
};

export const SENTENCE_WORDS: readonly Word[][] = SCRIPT.map((_, i) => wordsOf(i));

/** Scene boundaries in frames. Total 916 frames = 30.53 s. */
export const SCENE = {
  opening: { from: 0, to: 177 },
  flag: { from: 177, to: 324 },
  count: { from: 324, to: 470 },
  values: { from: 470, to: 719 },
  closing: { from: 719, to: 916 },
} as const;

export const TOTAL_FRAMES = SCENE.closing.to;

export type Cue = {
  readonly start: number;
  readonly end: number;
  /** Which script sentence this card belongs to. 5 and 7 are set in type by the scenes. */
  readonly sentence: number;
  readonly words: readonly { readonly text: string; readonly start: number; readonly end: number }[];
};

const chunk = (words: readonly Word[]): Word[][] => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  let chars = 0;
  for (const w of words) {
    const tooLong =
      cur.length >= 5 ||
      chars + w.text.length > 26 ||
      (cur.length > 0 && w.end - cur[0].start > 2.3);
    if (tooLong && cur.length > 0) {
      out.push(cur);
      cur = [];
      chars = 0;
    }
    cur.push(w);
    chars += w.text.length + 1;
    if (cur.length >= 2 && /[;:]$/.test(w.text)) {
      out.push(cur);
      cur = [];
      chars = 0;
    }
  }
  if (cur.length > 0) out.push(cur);
  return out;
};

const buildCues = (): Cue[] => {
  const groups: { words: Word[]; sentence: number }[] = [];
  SENTENCE_WORDS.forEach((words, sentence) => {
    for (const g of chunk(words)) groups.push({ words: g, sentence });
  });
  return groups.map((g, i) => {
    const start = voiceFrame(g.words[0].start) - 1;
    const limit = i + 1 < groups.length ? voiceFrame(groups[i + 1].words[0].start) - 3 : TOTAL_FRAMES;
    const end = Math.min(voiceFrame(g.words[g.words.length - 1].end) + 7, limit);
    return {
      start,
      end,
      sentence: g.sentence,
      words: g.words.map((w) => ({ text: w.text, start: voiceFrame(w.start), end: voiceFrame(w.end) })),
    };
  });
};

/** Bottom captions: at most five words each, timed on the measured words. */
export const CUES: readonly Cue[] = buildCues();

/** The five values, with the frame each one is spoken. */
export const VALUES = ["EGEMENLİK", "BAĞIMSIZLIK", "AKIL", "ÖZGÜRLÜK", "EŞİTLİK"] as const;
export const VALUE_AT: readonly number[] = [0, 1, 2, 3, 5].map((k) => voiceFrame(SENTENCE_WORDS[5][k].start));

/** Closing line: "Cumhuriyetimizin yüz üçüncü yılı kutlu olsun!" */
export const CLOSING_WORDS = SENTENCE_WORDS[7];
export const NICE_AT = voiceFrame(SENTENCE_WORDS[6][0].start);
export const CLOSING_AT = voiceFrame(SENTENCE_WORDS[7][0].start);
