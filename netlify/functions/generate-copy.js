// ============================================================
// ANNE'S COPY ENGINE — Netlify Function
// POST /.netlify/functions/generate-copy
// Generates copy in Anne's voice via Claude API
// ============================================================

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  let pillar, topic, tone, platform, history;
  try {
    const body = JSON.parse(event.body || '{}');
    pillar = body.pillar || 'Celebrating You';
    topic = body.topic || '';
    tone = body.tone || 'Sacred & Grounding';
    platform = body.platform || 'all';
    history = Array.isArray(body.history) ? body.history.slice(0, 8) : [];
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const SYSTEM = `You are Anne McClain's Creative Director for Everyday Ceremony By Anne.

## Who Anne Is
Anne creates handcrafted ritual products — candles, incense, self-care kits — for women who have spent years giving everything to everyone else and are ready to return to themselves. Tagline: "Celebrating You Today, Tomorrow and Always."

## Anne's Ideal Client
A soulful woman, 40s-50s, who has put others first for so long she's lost the thread back to herself. She's looking for something sacred, not a productivity hack. For her, luxury isn't a price point — it's a presence. She wants small daily practices that feel like coming home.

## Anne's Voice Rules
- Tone: elevated, poetic, luxurious, inclusive, grounding
- Short paragraphs. White space. Language that feels like candlelight.
- Signature phrases: "Celebrating you today, tomorrow, and always" / "quiet luxury" / "everyday ceremony" / "returning to yourself"
- NEVER use: em dashes (—), exclamation points, "busy woman", "self-care routine", "hack", "optimize", "amazing", "incredible", "genuinely", "honestly"
- Numbers always as digits (3 not three)
- Never open a post with "I" as the first word
- Instagram: 3-5 short paragraphs + 3 hashtags
- Facebook: conversational, ends with a question to invite replies
- LinkedIn: professional authority angle, women in leadership lens

## MEMORY — DO NOT REPEAT
The following posts were recently generated. Write something COMPLETELY DIFFERENT — new hook, new opening line, new angle, new emotional entry point. Never reuse an opener or theme from this list:
\${history.length > 0 ? history.map((h, i) => `[${i + 1}] ${h}`).join('\n\n') : '(no history — first generation)'}

Vary the emotional entry point each time: gratitude, longing, quiet power, return, ceremony, self-recognition, depth, belonging.\`;

  const platformsToWrite = platform === 'all' ? ['INSTAGRAM', 'FACEBOOK', 'LINKEDIN'] : [platform.toUpperCase()];
  const topicLine = topic ? `Today's angle: ${topic}` : '';

  const USER = `Write posts for Anne in her voice.

Content pillar: ${pillar}
Tone: ${tone}
${topicLine}

Write the following platforms: ${platformsToWrite.join(', ')}

Return ONLY in this exact format with no commentary:
${platformsToWrite.map(p => p + ':\n[post text]').join('\n\n')}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        system: SYSTEM,
        messages: [{ role: 'user', content: USER }]
      }),
      signal: AbortSignal.timeout(25000)
    });

    if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
    const data = await res.json();
    const text = data.content[0].text;

    // Parse platform sections
    const copy = {};
    const igMatch = text.match(/INSTAGRAM:\s*\n([\s\S]*?)(?=\n(?:FACEBOOK|LINKEDIN):|$)/);
    const fbMatch = text.match(/FACEBOOK:\s*\n([\s\S]*?)(?=\nLINKEDIN:|$)/);
    const liMatch = text.match(/LINKEDIN:\s*\n([\s\S]*?)$/);

    copy.instagram = igMatch?.[1]?.trim() || text.trim();
    copy.facebook = fbMatch?.[1]?.trim() || copy.instagram;
    copy.linkedin = liMatch?.[1]?.trim() || copy.instagram;

    return { statusCode: 200, headers, body: JSON.stringify(copy) };

  } catch (err) {
    console.error('generate-copy error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
