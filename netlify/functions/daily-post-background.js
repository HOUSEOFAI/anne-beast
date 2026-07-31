// ============================================================
// THE MAGNIFICENT BEAST — ANNE McCLAIN
// Everyday Ceremony By Anne
// daily-post-background.js — Netlify Background Function
// Fires daily at 9am UTC via netlify.toml schedule
// ============================================================

const SOUL_ID = process.env.HIGGSFIELD_SOUL_ID; // Anne's trained Higgsfield Soul 2.0 ID
// Higgsfield Cloud API — permanent keys, no expiry
// Anne gets both from: cloud.higgsfield.ai → Dashboard → API Keys
const HF_AUTH = `Key ${process.env.HIGGSFIELD_API_KEY}:${process.env.HIGGSFIELD_API_SECRET}`;

// ── CONTENT PILLARS ─────────────────────────────────────────
const PILLARS = [
  {
    name: "The Sacred Self",
    theme: "returning to yourself after years of giving everything to everyone else",
    hooks: [
      "You've been giving from a well that no one ever refills.",
      "She didn't lose herself all at once. It happened one small surrender at a time.",
      "The woman you've been waiting to become is the one you abandoned.",
      "You gave them your mornings. Your evenings. Your quiet.",
      "Somewhere between taking care of everyone else, you forgot you were someone too."
    ]
  },
  {
    name: "Quiet Luxury",
    theme: "redefining luxury as presence and intention, not price",
    hooks: [
      "Real luxury is not something you buy. It's something you return to.",
      "The most expensive thing you own is your attention. Where are you spending it?",
      "She stopped waiting for someone else to make it beautiful.",
      "Luxury is not a price point. It's a practice.",
      "A candle lit with intention costs nothing. But it changes everything."
    ]
  },
  {
    name: "The Ceremony Within",
    theme: "making everyday moments sacred and intentional",
    hooks: [
      "Your morning doesn't have to be a routine. It can be a ceremony.",
      "The ordinary moment you keep rushing past is where the magic is.",
      "She learned to make even Tuesday feel like something sacred.",
      "What would change if you treated getting dressed as a ritual?",
      "You don't need a retreat. You need 10 minutes and a match."
    ]
  },
  {
    name: "Ritual & Healing",
    theme: "the quiet power of consistent, intentional self-care practices",
    hooks: [
      "Healing doesn't always look like a breakthrough. Sometimes it looks like a candle.",
      "The ritual didn't fix everything. It reminded her she was worth showing up for.",
      "She tried the retreats, the therapists, the getaways. Then she tried stillness.",
      "Small practices don't change your life all at once. They change it one morning at a time.",
      "What if the thing you've been searching for has been waiting in the quiet?"
    ]
  },
  {
    name: "Celebrating You",
    theme: "honoring yourself fully — in small moments and grand ones",
    hooks: [
      "Celebrating you today, tomorrow, and always — not when you've earned it.",
      "You keep waiting for a reason to celebrate yourself. This is it.",
      "She stopped waiting to be chosen and chose herself.",
      "Your wholeness is worth honoring. Right now. As you are.",
      "The ceremony isn't for the version of you that has it all together. It's for this one."
    ]
  },
  {
    name: "Boston Besties",
    theme: "the magic of women who truly show up for each other — community, belonging, and sisterhood",
    hooks: [
      "The right women in your corner change everything.",
      "She stopped performing and found her people.",
      "There's a kind of healing that only happens in a room full of women who get it.",
      "Not everyone deserves a seat at your table. But the right ones belong there forever.",
      "Real community doesn't drain you. It fills the well."
    ]
  },
  {
    name: "The CEO Board",
    theme: "leading your life and business with wisdom — your own and the mentors who guide you",
    hooks: [
      "She stopped asking permission and started asking better questions.",
      "Every great decision I've made started with sitting with the right wisdom.",
      "You don't have to figure it out alone. That's not strength. That's stubbornness.",
      "The woman who knows what she wants still needs a board.",
      "Leadership isn't about having all the answers. It's about knowing who to ask."
    ]
  }
];

// ── LUXURY SCENES ────────────────────────────────────────────
// NOTE: Update scene prompts with Anne's actual appearance once known
// (hair color, age, style, energy) — currently using brand-matched placeholders
const SCENES = [
  { name: "Candlelit Morning Ritual", prompt: "An elegant woman in her 40s with a warm, soulful presence, in a beautifully styled home sanctuary at dawn, surrounded by lit candles, dried roses, and ritual objects, wearing a flowing silk robe in deep burgundy, holding a candle, golden morning light, luxury editorial photography, sacred and intimate" },
  { name: "Rose Garden Sanctuary", prompt: "An elegant woman in her 40s with a warm, soulful presence, in a lush private rose garden at golden hour, wearing a flowing cream dress, surrounded by deep pink blooms, soft warm light, luxury botanical editorial, serene and self-possessed, cinematic warmth" },
  { name: "Incense & Intention", prompt: "An elegant woman in her 40s with a warm, soulful presence, seated at a wooden altar table with incense smoke rising, dried herbs and crystals arranged with care, candlelight, wearing a deep burgundy wrap, quiet focus, luxury wellness editorial, intimate and sacred" },
  { name: "Parisian Bath Ritual", prompt: "An elegant woman in her 40s with a warm, soulful presence, in a luxury clawfoot bathtub surrounded by rose petals and candles, marble bathroom, wearing nothing but soft light, eyes closed in peace, Vogue editorial luxury, feminine sovereignty, cinematic" },
  { name: "Velvet Reading Nook", prompt: "An elegant woman in her 40s with a warm, soulful presence, curled in a deep velvet chair by a window with rain outside, holding a warm drink, candle lit beside her, wearing a cashmere wrap in deep plum, books and flowers nearby, editorial luxury, intimate and still" },
  { name: "Moonlit Terrace", prompt: "An elegant woman in her 40s with a warm, soulful presence, on a stone terrace under a crescent moon, night-blooming flowers around her, wearing a flowing ivory dress with gold jewelry, soft candlelight, mystical and sovereign, luxury night editorial, cinematic" },
  { name: "Sacred Morning Table", prompt: "An elegant woman in her 40s with a warm, soulful presence, at a beautifully laid morning table with a ritual tea ceremony, fresh roses in a vase, journal open, morning light streaming in, wearing a silk robe, luxury lifestyle editorial, slow and intentional" },
  { name: "Washington Townhouse Study", prompt: "An elegant woman in her 40s with a warm, soulful presence, in a beautiful DC townhouse study, walls lined with books and meaningful objects, candlelight, wearing a tailored burgundy blazer, writing at a desk, quiet authority, luxury editorial, cinematic intimacy" },
  { name: "Botanical Spa Escape", prompt: "An elegant woman in her 40s with a warm, soulful presence, in a private botanical spa setting with steam rising, tropical plants, stone surfaces, wearing a white linen wrap, surrounded by ritual bath oils and flowers, luxury wellness editorial, serene and restored" },
  { name: "Sunset Ceremony", prompt: "An elegant woman in her 40s with a warm, soulful presence, standing in a field of wildflowers at sunset, arms open, wearing a flowing gold dress, warm amber light, rose petals scattered, Vogue editorial, expansive joy, the ceremony of being fully alive" }
];

// ── HELPERS ──────────────────────────────────────────────────
function getDayIndex(arr) {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return dayOfYear % arr.length;
}

async function fetchIntelligence() {
  try {
    const { getStore } = require("@netlify/blobs");
    const store = getStore("anne-intelligence");
    const data = await store.get("daily-report", { type: "json" });
    if (!data?.report_generated) return null;
    return data;
  } catch {
    return null;
  }
}

// ── FALLBACK COPY ─────────────────────────────────────────────
const COPY_MATRIX_FALLBACK = {
  "The Sacred Self": `INSTAGRAM:\nYou've been giving from a well that no one ever refills.\n\nThe woman who cooks the meals, manages the calendar, holds everyone together — she deserves a ceremony too.\n\nNot when things calm down. Not when everyone else is taken care of.\n\nNow.\n\nYour wholeness is worth celebrating — today, tomorrow, and always.\n\nFACEBOOK:\nSomewhere between taking care of everyone else, we forget that we're someone too.\n\nI created Everyday Ceremony for the woman who gives everything — and deserves something sacred in return.\n\nWhat's one small way you've returned to yourself this week? Share below — I'd love to know.\n\nYOUTUBE:\nYou've been giving from a well that no one ever refills.\n\nReal self-care isn't a spa day you've earned. It's a daily ceremony that says: I matter. My presence matters. My peace matters.\n\nCelebrating you today, tomorrow, and always.`,
  "Celebrating You": `INSTAGRAM:\nCelebrating you today, tomorrow, and always — not when you've earned it.\n\nNot when the house is clean. Not when the project is done. Not when everyone else is settled.\n\nNow. As you are. In this exact moment.\n\nYou don't have to perform your way into worthiness.\n\nFACEBOOK:\nYou keep waiting for a reason to celebrate yourself.\n\nThis is it. Today. This ordinary, unremarkable, beautiful Thursday.\n\nLight the candle. Draw the bath. Make the tea slowly. You are the ceremony.\n\nWhat small thing are you doing today just for you?\n\nYOUTUBE:\nThe ceremony isn't for the version of you that has it all together.\n\nIt's for this one. The one who's tired. The one who's trying. The one who deserves to be seen.\n\nCelebrating you today, tomorrow, and always.`
};

// ── LIVE COPY GENERATION ──────────────────────────────────────
async function generateCopy(pillar, scene, intelligence) {
  const intelContext = intelligence
    ? `TODAY'S INTELLIGENCE:\n- Trending: ${(intelligence.emerging_topics || []).slice(0, 3).join(', ')}\n- Pain phrases heard today: ${(intelligence.pain_points || []).slice(0, 3).join(', ')}`
    : 'No intelligence today — use pillar defaults.';

  const hookIndex = getDayIndex(pillar.hooks);
  const todaysHook = pillar.hooks[hookIndex];

  const systemPrompt = `You are Anne McClain's Creative Director and voice for Everyday Ceremony By Anne.

## Who Anne Is
Anne creates handcrafted ritual products — candles, incense, self-care kits — for women who have spent years giving everything to everyone else and are ready to return to themselves. Her tagline: "Celebrating You Today, Tomorrow and Always."

## Anne's Ideal Client
A soulful woman, likely in her 40s-50s, who has put others first for so long she's lost the thread back to herself. She's not looking for a productivity hack. She's looking for something sacred. For her, luxury isn't a price point — it's a presence. She wants small daily practices that feel like coming home. She's tried retreats and counseling; what she really craves is something intimate, consistent, and her own.

## Anne's Content Pillars
1. The Sacred Self — returning to yourself after years of giving everything
2. Quiet Luxury — redefining luxury as presence, not price
3. The Ceremony Within — making everyday moments sacred
4. Ritual & Healing — the quiet power of consistent self-care
5. Celebrating You — honoring yourself fully, not when you've earned it
6. Boston Besties — the magic of women who show up for each other; sisterhood and community
7. The CEO Board — leading your life and business with wisdom; using mentors and AI to guide decisions

## Anne's Brand Colors
Deep burgundy and gold. Scene descriptions should always evoke candlelight, roses, warm crimson, and gold.

## Anne's Offers
- Mystic Harmony DIY Incense Guide (Free) — entry point to sacred ritual at home
- Mystic Rose Candle Collection — small batch, hand-poured, luxury by presence
- Self-Care Ritual Kit — curated handcrafted ritual tools

## Anne's Voice
- Tone: elevated, poetic, luxurious, inclusive, intentionally grounding
- She sounds like a wise warm friend who lights candles and actually reads poetry
- Short paragraphs. White space. Language that feels like candlelight.
- Signature phrases: "Celebrating you today, tomorrow, and always" / "quiet luxury" / "everyday ceremony" / "returning to yourself" / "quiet ritual"
- NEVER use: hustle language, productivity framing, "busy woman", "self-care routine", "hack", "optimize"
- NEVER use: em dashes (—), exclamation points, filler words (genuinely, honestly, amazing, incredible)
- Numbers always as digits (3 not three)
- Never open a post with "I" as the first word

## The 10 Viral Hook Frameworks — use one per post, vary daily
1. THE CONFESSION: "I was wrong about [thing]. Embarrassingly wrong."
2. THE NUMBER DROP: Specific surprising result. Digits only.
3. THE IDENTITY SHIFT: "[Old identity] doesn't run this anymore."
4. THE UNPOPULAR TRUTH: Say what others won't. No hedge.
5. THE SCENE-SETTER: Drop her into a specific cinematic moment.
6. THE DIRECT ADDRESS: Speak to exactly one woman. She feels seen.
7. THE CONTRAST: Two worlds, one line.
8. THE QUESTION THAT STINGS: A question she can't say no to.
9. THE MICRO-STORY: Tiny story, huge point. Under 2 sentences.
10. THE AUTHORITY OPENER: Lead with lived experience, not credentials.

## Grading Rubric
- Hook 0-2: Stops scroll. Specific, poetic, emotionally charged.
- Identity & Transformation 0-2: She sees herself. She feels invited home.
- Voice Integrity 0-2: Sounds like Anne. Warm. Poetic. No forbidden words.
- Clarity & Flow 0-2: Short paragraphs. Reads like a quiet breath.
- CTA 0-2: One soft, clear invitation. Never pressures.
Deduct 0.5 for: em dash, spelled-out numbers, filler words, opening with "I".
Minimum score: 8/10. Rewrite until it hits 8+.`;

  const userPrompt = `Today's content pillar: ${pillar.name}
Theme: ${pillar.theme}
Today's suggested hook (use or improve): "${todaysHook}"
Today's scene: ${scene.name}
${intelContext}

Write 3 posts — INSTAGRAM, FACEBOOK, YOUTUBE.

For each:
1. Pick a hook framework (use today's hook as inspiration or improve it)
2. Write the full post in Anne's voice — poetic, grounding, intimate
3. Score it /10 using the rubric
4. If score under 8, rewrite immediately

Return ONLY the posts in this exact format — no commentary:
INSTAGRAM:
[post text]

FACEBOOK:
[post text]

YOUTUBE:
[post text]`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      }),
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic API error: ${err}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    console.log('✅ Claude generated fresh copy for Anne');
    return content;

  } catch (err) {
    console.log(`⚠️ Claude unavailable (${err.message}) — using fallback copy`);
    return COPY_MATRIX_FALLBACK[pillar.name] || COPY_MATRIX_FALLBACK["Celebrating You"];
  }
}

function parseCopy(copyText) {
  const igMatch = copyText.match(/INSTAGRAM:\s*\n([\s\S]*?)(?=\n(?:YOUTUBE|FACEBOOK|LINKEDIN):|$)/);
  const ytMatch = copyText.match(/(?:YOUTUBE|LINKEDIN):\s*\n([\s\S]*?)(?=\nFACEBOOK:|$)/);
  const fbMatch = copyText.match(/FACEBOOK:\s*\n([\s\S]*?)$/);

  const instagram = igMatch?.[1]?.trim() || copyText.trim();
  const youtube = ytMatch?.[1]?.trim() || instagram;
  const facebook = fbMatch?.[1]?.trim() || instagram;

  return { instagram, youtube, facebook };
}

// ── FALLBACK IMAGES ──────────────────────────────────────────
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1512361436605-a484bdb34b5f?w=1080&q=80",
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1080&q=80",
  "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1080&q=80",
  "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=1080&q=80",
  "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1080&q=80",
  "https://images.unsplash.com/photo-1602178697726-2f0e69e5a0b3?w=1080&q=80",
  "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=1080&q=80",
  "https://images.unsplash.com/photo-1543362906-acfc16c67564?w=1080&q=80",
];

async function generateImage(scene) {
  try {
    console.log(`🔑 HF_AUTH configured: ${!!process.env.HIGGSFIELD_API_KEY && !!process.env.HIGGSFIELD_API_SECRET}`);
    if (!process.env.HIGGSFIELD_API_KEY || !process.env.HIGGSFIELD_API_SECRET) {
      throw new Error("HIGGSFIELD_API_KEY or HIGGSFIELD_API_SECRET env var is missing");
    }
    const submitRes = await fetch("https://platform.higgsfield.ai/higgsfield-ai/soul/standard", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": HF_AUTH },
      body: JSON.stringify({ prompt: scene.prompt, soul_id: SOUL_ID, aspect_ratio: "3:4" }),
      signal: AbortSignal.timeout(15000)
    });
    if (!submitRes.ok) throw new Error(`Higgsfield submit: ${await submitRes.text()}`);
    const submitData = await submitRes.json();
    const requestId = submitData.request_id;
    const statusUrl = submitData.status_url || `https://platform.higgsfield.ai/requests/${requestId}/status`;
    if (!requestId) throw new Error("No request_id from Higgsfield");
    console.log(`🎨 Higgsfield request: ${requestId}`);
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 10000));
      const statusRes = await fetch(statusUrl, {
        headers: { "Authorization": HF_AUTH }, signal: AbortSignal.timeout(10000)
      });
      const status = await statusRes.json();
      console.log(`🎨 Status: ${status.status}`);
      if (status.status === "completed") {
        const url = status.images?.[0]?.url || status.video?.url;
        if (url) return url;
      }
      if (status.status === "failed" || status.status === "nsfw") throw new Error(`Image ${status.status}`);
    }
    throw new Error("Higgsfield timed out after 5 minutes");
  } catch (err) {
    console.log(`⚠️ Higgsfield unavailable (${err.message}) — using fallback image`);
    return FALLBACK_IMAGES[getDayIndex(FALLBACK_IMAGES)];
  }
}

async function postToBuffer(channelId, text, imageUrl, service = "instagram") {
  if (!channelId) { console.log("⚠️ No channel ID — skipping"); return false; }
  const mutation = `mutation CreatePost($input: CreatePostInput!) { createPost(input: $input) { ... on PostActionSuccess { post { id status createdAt } } ... on InvalidInputError { message } ... on LimitReachedError { message } ... on UnauthorizedError { message } ... on UnexpectedError { message } } }`;
  let postText = text;
  if (service === "instagram" && postText.length > 2100) {
    const hashtagStart = postText.lastIndexOf("\n#");
    const hashtags = hashtagStart > 0 ? postText.slice(hashtagStart) : "";
    const body = hashtagStart > 0 ? postText.slice(0, hashtagStart) : postText;
    const maxBody = 2100 - hashtags.length - 4;
    const truncated = body.slice(0, maxBody);
    const lastSentence = truncated.lastIndexOf(".");
    postText = (lastSentence > 0 ? truncated.slice(0, lastSentence + 1) : truncated) + "..." + hashtags;
  }
  const isYoutube = service === "youtube";
  const assets = (imageUrl && !isYoutube) ? [{ image: { url: imageUrl } }] : [];
  const metadata = {};
  if (service === "instagram") metadata.instagram = { type: "post", shouldShareToFeed: true };
  else if (service === "facebook") metadata.facebook = { type: "post" };
  const variables = { input: { channelId, text: postText, schedulingType: "automatic", mode: "addToQueue", assets, ...(Object.keys(metadata).length ? { metadata } : {}) } };
  const res = await fetch("https://api.buffer.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.BUFFER_ACCESS_TOKEN}` },
    body: JSON.stringify({ query: mutation, variables })
  });
  const data = await res.json();
  if (data.errors) { console.error(`Buffer error:`, data.errors[0].message); return false; }
  const result = data.data?.createPost;
  if (result?.message) { console.error(`Buffer post error:`, result.message); return false; }
  console.log(`✅ Buffer queued: ${result?.post?.id} [${result?.post?.status}]`);
  return true;
}

// ── MAIN ─────────────────────────────────────────────────────
exports.handler = async function(event, context) {
  console.log("🌹 Anne's Beast awakens — Everyday Ceremony By Anne");
  try {
    const pillar = PILLARS[getDayIndex(PILLARS)];
    const scene = SCENES[getDayIndex(SCENES)];
    console.log(`📌 Pillar: ${pillar.name}`);
    console.log(`🎬 Scene: ${scene.name}`);

    const intelligence = await fetchIntelligence();
    console.log(`🧠 Intelligence: ${intelligence ? "loaded" : "not available"}`);

    console.log("✍️ Generating copy via Claude...");
    const rawCopy = await generateCopy(pillar, scene, intelligence);
    const { instagram, youtube, facebook } = parseCopy(rawCopy);
    console.log("✅ Copy ready");

    console.log("🎨 Generating Higgsfield image...");
    const imageUrl = await generateImage(scene);
    console.log(`✅ Image: ${imageUrl}`);

    const channels = {
      instagram: process.env.BUFFER_INSTAGRAM_CHANNEL_ID,
      facebook: process.env.BUFFER_FACEBOOK_CHANNEL_ID,
      linkedin: process.env.BUFFER_LINKEDIN_CHANNEL_ID
    };

    const results = {};
    results.instagram = await postToBuffer(channels.instagram, instagram, imageUrl, "instagram");
    results.facebook = await postToBuffer(channels.facebook, facebook, imageUrl, "facebook");
    results.linkedin = "pending_support";

    console.log("📬 Buffer results:", results);

    try {
      const { getStore } = require("@netlify/blobs");
      const store = getStore("beast-logs");
      const logEntry = { timestamp: new Date().toISOString(), status: "success", pillar: pillar.name, scene: scene.name, imageUrl, results };
      await store.setJSON(`run-${new Date().toISOString().split("T")[0]}`, logEntry);
      await store.setJSON("latest-run", logEntry);
    } catch (e) { console.log("Log store skipped:", e.message); }

    console.log("🌹 Anne's Beast complete. Celebrating her today.");
    return { statusCode: 200, body: JSON.stringify({ success: true, pillar: pillar.name, scene: scene.name, imageUrl, results }) };

  } catch (err) {
    console.error("❌ Beast error:", err.message);
    try {
      const { getStore } = require("@netlify/blobs");
      const store = getStore("beast-logs");
      await store.setJSON("latest-run", { timestamp: new Date().toISOString(), status: "error", error: err.message });
    } catch (e) {}
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
