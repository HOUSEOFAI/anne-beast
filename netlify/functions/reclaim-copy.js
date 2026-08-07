// ============================================================
// RECLAIM COPY ENGINE — Netlify Function
// POST /.netlify/functions/reclaim-copy
// Generates fresh buying event copy for the Reclaim kit
// in Anne's voice for the trad goth / darkwave buyer.
// Never repeats — history[] sent from client localStorage.
// ============================================================

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  let type, platform, angle, history;
  try {
    const body = JSON.parse(event.body || '{}');
    type     = body.type     || 'hand-raiser';
    platform = body.platform || 'instagram';
    angle    = body.angle    || '';
    history  = Array.isArray(body.history) ? body.history.slice(0, 8) : [];
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const TYPE_GUIDE = {
    'hand-raiser':   'A hand raiser post — gather interest before the offer opens. CTA: comment a word (e.g. "reclaim") to be added to a list. No price yet.',
    'conviction':    'A conviction post — a bold declarative truth about ceremony, the scene, depth, or her identity. No direct offer. Ends with a resonant observation, not a CTA.',
    'open-day':      'Opening day announcement — the kit is now available. Include prices: Candle $55, Ritual Oil $44, Full Kit $118. One clear CTA: link in bio.',
    'close-day':     'Closing day urgency — the offer closes tonight. Include prices. Anne pours every kit by hand, limited. Quiet urgency, no panic.',
    'email-subject': 'A set of 8 email subject lines for a 7-day buying event. One per day. Day 7 gets two (AM and PM). Short, evocative, scene-appropriate. No punctuation at end.',
    'story':         'An Instagram story script. Frame-by-frame. 6-8 frames. Show the kit in frames 3-4. Last frame is a link sticker frame.',
    'dm':            'A DM follow-up to someone who expressed interest. Include all products + prices. Warm, direct, from Anne personally. Close with her name.'
  };

  const PLATFORM_GUIDE = {
    'instagram': 'Instagram caption — short stacked paragraphs, line breaks between each. 1 CTA at the end. No hashtags unless conviction post (max 3).',
    'facebook':  'Facebook post — slightly longer, community warmth. Ends with a question or open reflection that invites comments.',
    'linkedin':  'LinkedIn post — quiet authority. Professional lens without losing the depth. 1-2 hashtags (#EverydayCeremony optional) at end.',
    'email':     'Email — subject line on line 1 (format: Subject: "..."), blank line, then body. Personal, from Anne. Direct.'
  };

  const SYSTEM = `You are the copy writer for RECLAIM by Everyday Ceremony By Anne (Anne McClain).

## THE OFFER
Reclaim is a ritual ceremony kit made for the woman who has been in the trad goth, darkwave, and deathrock scene long enough to know what is real and what is made for the tourist market. She holds space for her whole scene and has never held ceremony for herself.

## PRODUCTS & PRICES
- The Reclaim Candle — $55 (cedar and bergamot, hand-poured by Anne in small batches)
- The Ritual Oil — $44 (for anointing before the ceremony opens)
- Sacred Morning Incense Bundle — palo santo and lavender
- The Reclaim Journal — 28 guided prompts
- 7-Day Morning Ceremony Framework
- Ceremony Intention Cards
- The Reclaim Circle (private community access)
- Full Ritual Kit — $118 (everything above)

## IDEAL CLIENT
- Been in the trad goth / darkwave / deathrock scene for years — not months
- Goes to the shows. Knows the shops (Slings & Arrows DC, etc.). Knows the people
- Can spot a tourist in the scene before they speak
- Follows @anastasiaofthedark, @cemetarysex, @slingsandarrowsdc, @nightofthewitchdc
- She has the altar, the objects, the look — but the ceremony is always for everyone else
- She holds the events, the community, the space — and has never been held back
- She is done with brands that discovered darkness six months ago on TikTok

## ANNE'S VOICE RULES
- Zero exclamation points. Ever.
- No victim language (not: struggling, stuck, burned out, overwhelmed, barely surviving)
- No pre-facers ("I believe that..." — just state it)
- Short declarative sentences for key truths
- Write as if Anne is speaking directly to this woman — not broadcasting to a crowd
- Tone: quiet authority, dark elegance, no performance, no wellness-speak
- Never use: amazing, incredible, journey, self-care routine, hack, busy woman, em dashes (—)

## COPY TYPE
${TYPE_GUIDE[type] || `A ${type} post.`}

## PLATFORM
${PLATFORM_GUIDE[platform] || platform}

${angle ? `## ANGLE TO INCORPORATE\n"${angle}"` : ''}

## MEMORY — DO NOT REPEAT
These were recently generated. Write something COMPLETELY DIFFERENT — new hook, new opening line, new emotional entry point, new specific detail:
${history.length > 0 ? history.map((h, i) => `[${i + 1}] ${h}`).join('\n\n') : '(no history — this is the first generation)'}

Entry points to rotate through: the show, the altar, the objects, the people she holds, the tourist wave, morning light, the oil, the candle, the journal, being the one who always shows up for others, depth vs. aesthetic, what ceremony actually requires.`;

  const USER = `Write the copy now. Return ONLY the final post text — no labels, no "here's the copy:", no preamble. Raw copy ready to paste.`;

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not set in Netlify environment variables.' })
      };
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 700,
        system: SYSTEM,
        messages: [{ role: 'user', content: USER }]
      }),
      signal: AbortSignal.timeout(25000)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Claude API ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    const copy = data.content[0].text.trim();

    return { statusCode: 200, headers, body: JSON.stringify({ copy }) };

  } catch (err) {
    console.error('reclaim-copy error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
