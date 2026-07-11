// NOTE: Devvit Web supports a native "showForm" + devvit.json form-schema
// mechanism for OS-level dialogs, but the exact current schema-registration
// API wasn't confirmed against live docs while scaffolding this project — see
// 04_DEVVIT_WEB_BUILD_SKILL.md, Section 12 (verify-before-trusting policy).
// To avoid shipping an unverified pattern, cipher submission instead goes
// through a plain in-app modal in game.tsx that POSTs JSON to
// /api/submit-cipher (see routes/api.ts) — a pattern already confirmed
// working via /api/init and /api/guess. This file is kept as a placeholder
// in case you confirm the native form API and want to switch back to it.
import { Hono } from 'hono';
export const forms = new Hono();
//# sourceMappingURL=forms.js.map