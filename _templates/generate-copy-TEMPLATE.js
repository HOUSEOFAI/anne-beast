// ============================================================
// HOUSE OF AI — WHITE-LABEL BEAST CONSOLE COPY GENERATOR
// generate-copy.js — Netlify Function
// Drop into any client's /netlify/functions/ folder
// Swap the CLIENT CONFIG block — nothing else changes
// ============================================================

// ██████  CLIENT CONFIG — ONLY EDIT THIS BLOCK  ██████████████

const CLIENT = {
  name: "CLIENT FULL NAME",               // e.g. "Dr. Tanja Isabella"
  company: "CLIENT COMPANY NAME",         // e.g. "Crown Jewels Consulting"
  offer: "CLIENT CORE OFFER",             // e.g. "nervous system healing for high-achieving women over 40"
  historyKey: "client-slug-copy-history", // unique per client, e.g. "tanja-copy-history"

  voice: `
    [Replace with client's voice guide]
    - Tone: warm, direct, feminine authority
    - Signature phrases: "You were born crowned." / "Safety is the greatest luxury."
    - NEVER use: em dashes, exclamation points, "amazing", "incredible", "genuinely"
    - Numbers always as digits (3 not three)
    - Never open with "I" as first word
  `,

  pillars: [
    "Pillar 1 — describe the theme",
    "Pillar 2 — describe the theme",
    "Pillar 3 — describe the theme",
  ],
};

// ██████████████████████████████████████████████████████████████

const { getStore } = require("@netlify/blobs");

// ── COPY HISTORY (RAG — never repeat) ────────────────────────

async function fetchCopyHistory(limit = 25) {
  try {
    const store = getStore("copy-history");
    const data = await store.get(CLIENT.historyKey, { type: "json" });
    return Array.isArray(data) ? data.slice(-limit) : [];
  } catch {
    return [];
  }
}

async function saveCopyToHistory(hook, platform, copy) {
  try {
    const store = getStore("copy-history");
    const existing = await fetchCopyHistory(50);
    existing.push({
      date: new Date().toISOString().split("T")[0],
      platform,
      hook: hook.substring(0, 120),
      snippet: copy.substring(0, 200),
    });
    await store.setJSON(CLIENT.historyKey, existing.slice(-50));
  } catch (e) {
    console.log("History save skipped:", e.message);
  }
}

// ── HOOK FRAMEWORKS ───────────────────────────────────────────

const HOOK_FRAMEWORKS = `
THE 10 VIRAL HOOK FRAMEWORKS — pick one per post, vary daily:
1. THE CONFESSION: "I was wrong about [thing]. Embarrassingly wrong."
2. THE NUMBER DROP: Specific surprising result. Digits only.
3. THE IDENTITY SHIFT: "[Old identity] doesn't run this anymore."
4. THE UNPOPULAR TRUTH: Say what others won't. No hedge.
5. THE SCENE-SETTER: Drop her into a specific cinematic moment.
6. THE DIRECT ADDRESS: Speak to exactly one woman. She feels seen.
7. THE CONTRAST: Two worlds, one line.
8. THE QUESTION THAT STINGS: A question she can't say no to.
9. THE MICRO-STORY: Tiny story, huge point. Under 2 sentences.
10. THE AUTHORITY OPENER: Lead with credential that lands, not brags.
`;

// ── GRADING RUBRIC ────────────────────────────────────────────

const GRADING_RUBRIC = `
GRADING RUBRIC — score every post before returning:
- Hook 0-2: Stops scroll. Specific, surprising, emotionally charged.
- Identity & Transformation 0-2: She sees herself. Change implied or explicit.
- Voice Integrity 0-2: Sounds like ${CLIENT.name}. No forbidden words.
- Clarity & Flow 0-2: Short paragraphs. Easy to read aloud.
- CTA 0-2: One clear step. Invites, never pressures.
Deduct 0.5 for: em dash, spelled-out numbers, filler words, opening with "I".
If score is under 8, rewrite immediately until it hits 8+. Never return a post below 8.
`;

// ── MAIN HANDLER ──────────────────────────────────────────────

exports.handler = async function (event, context) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const {
      platform = "instagram",
      tone = "default",
      pillar = "",
      history = [],        // client can pass frontend history too (localStorage fallback)
    } = JSON.parse(event.body || "{}");

    // Fetch server-side RAG history
    const serverHistory = await fetchCopyHistory(25);

    // Merge server + client history, deduplicate, keep freshest 30
    const allHistory = [...serverHistory, ...history]
      .filter((h, i, arr) => arr.findIndex(x => x.hook === h.hook) === i)
      .slice(-30);

    const historyBlock =
      allHistory.length > 0
        ? `\n\nPREVIOUSLY GENERATED COPY — DO NOT REPEAT these hooks, angles, or phrases:\n` +
          allHistory
            .map((h, i) => `${i + 1}. [${h.date || "recent"} / ${h.platform || ""}] ${h.hook || h.snippet || h}`)
            .join("\n")
        : "";

    const systemPrompt = `You are ${CLIENT.name}'s Creative Director at ${CLIENT.company}. You write social media content for ${CLIENT.offer}.

VOICE GUIDE:
${CLIENT.voice}

${HOOK_FRAMEWORKS}

${GRADING_RUBRIC}
${historyBlock}`;

    const userPrompt = `Write a ${platform.toUpperCase()} post for ${CLIENT.name}.

Platform: ${platform}
Tone: ${tone}
${pillar ? `Today's pillar: ${pillar}` : `Content pillars to choose from: ${CLIENT.pillars.join(", ")}`}

Steps:
1. Choose a hook framework and write a scroll-stopping opening line
2. Write the full post in ${CLIENT.name}'s voice
3. Score it /10 using the rubric
4. If under 8, rewrite until it hits 8+
5. Return ONLY the final post — no score, no commentary

CRITICAL: The hook MUST be fresh. Check the history above and do not repeat any hook, angle, opening phrase, or theme already used.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic API error: ${err}`);
    }

    const data = await response.json();
    const copy = data.content[0].text.trim();

    // Save to RAG history
    const hook = copy.split("\n")[0].substring(0, 120);
    await saveCopyToHistory(hook, platform, copy);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
      body: JSON.stringify({ copy, platform }),
    };
  } catch (err) {
    console.error("Copy generator error:", err.message);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
