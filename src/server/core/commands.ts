// Comment commands — `!help` and `!show <guess>` just reply to a comment,
// something this app already does for correct-guess confirmations. Rewriting
// the crowd-sourced answer dictionary itself happens through the in-app
// "suggest a phrasing" flow (core/answerDictionary.ts) instead of a comment
// command, so a suggestion always goes through the safety gate with a proper
// hasSolved check rather than being parsed out of free-text comment bodies.

import { reddit, redis } from '@devvit/web/server';
import { keys, answersFor, type StoredCipherPost } from './storage';
import { scoreGuessAgainstAnswers, censorGuess } from './matching';
import { containsProfanity } from './wordFilter';

const HELP_TEXT = [
  '🔐 **EmojiCode comment commands**',
  '',
  '`!show <guess>` — reveal a specific censored guess from the Solved Recap in full, e.g. `!show lava`',
  '`!help` — show this message',
  '',
  'No command needed to play — just comment your guess normally.',
].join('\n');

export const isCommand = (text: string): boolean => text.trim().startsWith('!');

const loadCipher = async (postId: string): Promise<StoredCipherPost | null> => {
  const raw = await redis.get(keys.cipher(postId));
  return raw ? (JSON.parse(raw) as StoredCipherPost) : null;
};

export const handleCommand = async (commentId: string, postId: string, text: string): Promise<void> => {
  const trimmed = text.trim();
  const bareId = commentId.replace(/^t1_/, '');
  const reply = (body: string) => reddit.submitComment({ id: `t1_${bareId}`, text: body, runAs: 'APP' });

  if (/^!help\b/i.test(trimmed)) {
    await reply(HELP_TEXT);
    return;
  }

  const showMatch = trimmed.match(/^!show\s+(.+)/i);
  if (showMatch) {
    const query = showMatch[1]!.trim().toLowerCase();
    const cipher = await loadCipher(postId);
    if (!cipher) return;

    const found = Object.entries(cipher.guessDistribution).find(([guess]) =>
      guess.toLowerCase().includes(query)
    );
    if (!found) {
      await reply(`No guess matching "${showMatch[1]}" found (yet).`);
      return;
    }

    const [guessText, count] = found;
    const isCorrect = scoreGuessAgainstAnswers(guessText, answersFor(cipher)).matched;
    const revealed = containsProfanity(guessText) ? censorGuess(guessText) : guessText;
    await reply(
      isCorrect
        ? `🔎 "${revealed}" — the correct answer! Guessed ${count} time(s).`
        : `🔎 "${revealed}" was guessed ${count} time(s).`
    );
    return;
  }

  // Unknown command — ignore quietly rather than spamming a reply for typos.
};
