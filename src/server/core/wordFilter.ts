// Shared bad-word detection — single source of truth for both the submission
// safety gate (core/safety.ts) and guess-display censoring (core/matching.ts),
// so the two checks can never silently drift apart.
//
// Two tiers, deliberately different in consequence:
// - SEVERE: hate speech / harassment / illegal content — grounds to REJECT a
//   cipher submission outright (Section 9.1).
// - PROFANITY: general swearing/adult language — never rejects anything (a
//   guess is already a real posted Reddit comment we can't unpost), just
//   fully masked wherever we render guesses ourselves (Solved Recap).

const SEVERE_DENYLIST: RegExp[] = [
  /\b(nazi|hitler|kkk)\b/i,
  /\b(kill\s+yourself|kys)\b/i,
  /\b(child\s*porn|cp\b|pedophil)/i,
  /\b(doxx?|social\s*security|ssn\b)\b/i,
  /\b(rape|rapist)\b/i,
  /\bslur\b/i,
];

const PROFANITY_DENYLIST: RegExp[] = [
  /\bf+u+c+k+\w*/i,
  /\bs+h+i+t+\w*/i,
  /\ba+s+s+h+o+l+e+\w*/i,
  /\bb+i+t+c+h+\w*/i,
  /\bb+a+s+t+a+r+d+\w*/i,
  /\bc+u+n+t+\w*/i,
  /\bd+i+c+k+\w*/i,
  /\bp+u+s+s+y+\w*/i,
  /\bp+o+r+n+\w*/i,
  /\bs+e+x+\w*/i,
  /\bn+u+d+e+\w*/i,
  /\bh+o+r+n+y+\w*/i,
  /\bw+h+o+r+e+\w*/i,
  /\bs+l+u+t+\w*/i,
];

export const containsSevere = (text: string): boolean => SEVERE_DENYLIST.some((p) => p.test(text));
export const containsProfanity = (text: string): boolean =>
  PROFANITY_DENYLIST.some((p) => p.test(text)) || containsSevere(text);
