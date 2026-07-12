// Shared types between client and server — keep this the single source of truth
// for request/response shapes so client and server can never drift apart.
// Picked by the submitter at creation time (Section 13.5's submission form) —
// pre-filled with a best-guess auto-inferred default (core/category.ts) but
// always stored as whatever the submitter actually selected.
export const CATEGORY_OPTIONS = [
    'Movie',
    'TV Series',
    'Music',
    'Comics',
    'Book',
    'Game',
    'Anime',
    'Sub-Lore',
    'Other',
];
// Language of the answer/cipher, picked by the submitter alongside category.
export const LANGUAGE_OPTIONS = [
    'English',
    'Hindi',
    'Marathi',
    'Bengali',
    'Tamil',
    'Telugu',
    'Gujarati',
    'Punjabi',
    'Kannada',
    'Malayalam',
    'Urdu',
    'Spanish',
    'French',
    'German',
    'Portuguese',
    'Russian',
    'Japanese',
    'Korean',
    'Chinese',
    'Arabic',
    'Other',
];
// "1st" / "2nd" / "3rd" / "4th"... — shared by the server's guess-confirmation
// comment reply and the client's in-app feedback (Section 13.4's "🥈 2nd to
// solve this one") so the two can never say something different.
export const ordinal = (n) => {
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 13)
        return `${n}th`;
    switch (n % 10) {
        case 1:
            return `${n}st`;
        case 2:
            return `${n}nd`;
        case 3:
            return `${n}rd`;
        default:
            return `${n}th`;
    }
};
export const rankMedal = (rank) => (rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🎖️');
//# sourceMappingURL=api.js.map