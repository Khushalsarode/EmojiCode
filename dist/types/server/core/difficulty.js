// Live stats + difficulty rating (unique players, total guesses, skip rate,
// solve rate) shown on the Solved Recap and guess screens. The lightweight
// version of this — decode count only — is also mirrored onto a stickied
// Reddit comment by core/post.ts and core/guessing.ts; this richer
// breakdown stays in-app only.
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