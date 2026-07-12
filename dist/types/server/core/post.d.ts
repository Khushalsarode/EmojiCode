import { type CipherCategory, type CipherLanguage } from '../../shared/api';
export type CreateCipherResult = {
    status: 'published';
    postId: string;
    postUrl: string;
} | {
    status: 'rejected';
    reason: string;
};
export declare const createCipherPost: (emojis: string[], answer: string, hardMode?: boolean, category?: CipherCategory, language?: CipherLanguage) => Promise<CreateCipherResult>;
export type HubPostResult = {
    status: 'ready';
    postId: string;
    postUrl: string;
    created: boolean;
} | {
    status: 'rejected';
    reason: string;
};
export declare const getOrCreateHubPost: () => Promise<HubPostResult>;
