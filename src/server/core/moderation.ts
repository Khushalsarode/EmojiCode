// Optional hosted moderation layer — see 01_PRODUCT_DOCUMENTATION.md, Section 9.1.
//
// The local word-denylist (wordFilter.ts) always runs first and for free; this
// module adds a real classifier on top of it, but only when an API key is
// configured via Devvit's settings manager (`devvit settings set openaiApiKey`).
// OpenAI's Moderation endpoint is free for API users and doesn't count against
// usage limits, so this adds no per-request cost — it just needs an account
// and an API key. See 02_SETUP_AND_DEPLOYMENT.md, Section 7 for setup.

import { settings } from '@devvit/web/server';

const MODERATION_ENDPOINT = 'https://api.openai.com/v1/moderations';
const MODERATION_MODEL = 'omni-moderation-latest';
const TIMEOUT_MS = 4000;

export type ModerationResult =
  | { checked: true; flagged: boolean; categories: string[] }
  // No API key configured — caller should rely on the local denylist alone,
  // this is not an error state.
  | { checked: false };

export const runHostedModeration = async (input: string): Promise<ModerationResult> => {
  const apiKey = await settings.get<string>('openaiApiKey');
  if (!apiKey) return { checked: false };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(MODERATION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: MODERATION_MODEL, input }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Moderation API returned ${res.status}`);
    }

    const json = (await res.json()) as {
      results?: { flagged: boolean; categories: Record<string, boolean> }[];
    };
    const result = json.results?.[0];
    if (!result) {
      throw new Error('Moderation API returned no results');
    }

    const categories = Object.entries(result.categories)
      .filter(([, isFlagged]) => isFlagged)
      .map(([category]) => category);

    return { checked: true, flagged: result.flagged, categories };
  } finally {
    clearTimeout(timeout);
  }
};
