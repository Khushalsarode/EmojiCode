// Live stats + difficulty rating shown on the Solved Recap and guess screens
// — modeled on Pixelary's own stickied "Game Master" stats comment (unique
// players, total guesses, skip rate, solve rate), rendered in our own UI
// rather than a Reddit comment (see README_START_HERE.md for why: stickying
// a comment needs moderator-scope permissions this app doesn't request).
export const computeCipherStats = (cipher) => {
    const uniquePlayers = cipher.uniqueGuessers?.length ?? 0;
    const totalGuesses = cipher.totalGuesses ?? 0;
    const skips = cipher.skips ?? 0;
    const solves = cipher.decoderList.length;
    const uniqueWordsGuessed = Object.keys(cipher.guessDistribution).length;
    const avgGuessesPerPlayer = uniquePlayers > 0 ? totalGuesses / uniquePlayers : 0;
    const engaged = uniquePlayers + skips;
    const skipRate = engaged > 0 ? (skips / engaged) * 100 : 0;
    const solveRate = uniquePlayers > 0 ? (solves / uniquePlayers) * 100 : 0;
    // Difficulty ~ how many guesses it typically takes to crack — the more
    // attempts per player on average, the harder it reads.
    const difficultyScore = Math.min(10, Math.round(avgGuessesPerPlayer * 10) / 10);
    const difficultyLabel = difficultyScore < 3.3 ? 'Easy' : difficultyScore < 6.6 ? 'Medium' : 'Hard';
    const difficultyIcon = difficultyLabel === 'Easy' ? '🟢' : difficultyLabel === 'Medium' ? '🟡' : '🔴';
    return {
        uniquePlayers,
        totalGuesses,
        avgGuessesPerPlayer: Math.round(avgGuessesPerPlayer * 10) / 10,
        uniqueWordsGuessed,
        skips,
        skipRate: Math.round(skipRate),
        solves,
        solveRate: Math.round(solveRate),
        difficultyScore,
        difficultyLabel,
        difficultyIcon,
    };
};
//# sourceMappingURL=difficulty.js.map