export type CreateCipherResult = {
    status: 'published';
    postId: string;
    postUrl: string;
} | {
    status: 'rejected';
    reason: string;
};
export declare const createCipherPost: (emojis: string[], answer: string) => Promise<CreateCipherResult>;
