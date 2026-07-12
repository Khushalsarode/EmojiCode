// Auto-category inference (Section 9.3) — used as the pre-filled default in
// the submission form, but the submitter always has final say (Section 13.5):
// whatever they pick is what gets stored, this is just a smart starting point.
const RULES = [
    {
        category: 'Movie',
        patterns: [
            /\b(movie|film|cinema|hollywood|pixar|disney|marvel|star wars|lord of the rings|matrix|inception)\b/i,
            /\b(lion king|frozen|avatar|titanic|joker|batman|spiderman|spider-man)\b/i,
        ],
    },
    {
        category: 'TV Series',
        patterns: [
            /\b(show|series|sitcom|netflix|hbo|tv)\b/i,
            /\b(friends|office|breaking bad|stranger things|game of thrones|seinfeld|simpsons)\b/i,
        ],
    },
    {
        category: 'Music',
        patterns: [/\b(song|album|band|singer|rapper|music|lyrics|concert)\b/i],
    },
    {
        category: 'Comics',
        patterns: [/\b(comic|manga|graphic novel|marvel comics|dc comics|superhero)\b/i],
    },
    {
        category: 'Anime',
        patterns: [/\b(anime|naruto|one piece|dragon ball|studio ghibli|shonen)\b/i],
    },
    {
        category: 'Game',
        patterns: [
            /\b(game|videogame|video game|nintendo|playstation|xbox|steam|pokemon|zelda|minecraft|fortnite)\b/i,
        ],
    },
    {
        category: 'Book',
        patterns: [/\b(book|novel|harry potter|hobbit|gatsby|orwell|tolkien)\b/i],
    },
    {
        category: 'Sub-Lore',
        patterns: [/\b(reddit|subreddit|mod|karma|upvote|snoo|lore)\b/i],
    },
];
export const inferCategory = (answer) => {
    for (const rule of RULES) {
        if (rule.patterns.some((p) => p.test(answer)))
            return rule.category;
    }
    return 'Other';
};
//# sourceMappingURL=category.js.map