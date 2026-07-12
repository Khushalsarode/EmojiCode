import type { CipherStats } from '../../shared/api';
import type { StoredCipherPost } from './storage';
export declare const computeCipherStats: (cipher: StoredCipherPost) => CipherStats;
