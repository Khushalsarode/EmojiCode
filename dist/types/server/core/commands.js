// Comment commands — a scoped-down analog of Pixelary's `!` comment-command
// system. Deliberately limited to commands that need zero extra permissions:
// `!help` and `!show <guess>` just reply to a comment, something this app
// already does for correct-guess confirmations. Pixelary's `!add`/`!remove`/
// `!words` commands rewrite a crowd-sourced answer dictionary, which is a
// different core-mechanic (many accepted answers vs. our single fuzzy-matched
// answer) — that's a product decision, not an implementation detail, so it's
// deliberately not built here without that being explicitly decided first.
import { reddit, redis } from '@devvit/web/server';
import { keys } from './storage';
import { scoreGuess, censorGuess } from './matching';
import { containsProfanity } from './wordFilter';
const HELP_TEXT = [
    '🔐 **EmojiCode comment commands**',
    '',
    '`!show <guess>` — reveal a specific censored guess from the Solved Recap in full, e.g. `!show lava`',
    '`!help` — show this message',
    '',
    'No command needed to play — just comment your guess normally.',
].join('\n');
export const isCommand = (text) => text.trim().startsWith('!');
const loadCipher = async (postId) => {
    const raw = await redis.get(keys.cipher(postId));
    return raw ? JSON.parse(raw) : null;
};
export const handleCommand = async (commentId, postId, text) => {
    const trimmed = text.trim();
    const bareId = commentId.replace(/^t1_/, '');
    const reply = (body) => reddit.submitComment({ id: `t1_${bareId}`, text: body, runAs: 'APP' });
    if (/^!help\b/i.test(trimmed)) {
        await reply(HELP_TEXT);
        return;
    }
    const showMatch = trimmed.match(/^!show\s+(.+)/i);
    if (showMatch) {
        const query = showMatch[1].trim().toLowerCase();
        const cipher = await loadCipher(postId);
        if (!cipher)
            return;
        const found = Object.entries(cipher.guessDistribution).find(([guess]) => guess.toLowerCase().includes(query));
        if (!found) {
            await reply(`No guess matching "${showMatch[1]}" found (yet).`);
            return;
        }
        const [guessText, count] = found;
        const isCorrect = scoreGuess(guessText, cipher.answer).matched;
        const revealed = containsProfanity(guessText) ? censorGuess(guessText) : guessText;
        await reply(isCorrect
            ? `🔎 "${revealed}" — the correct answer! Guessed ${count} time(s).`
            : `🔎 "${revealed}" was guessed ${count} time(s).`);
        return;
    }
    // Unknown command — ignore quietly rather than spamming a reply for typos.
};
//# sourceMappingURL=commands.js.map