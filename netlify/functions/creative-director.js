// ============================================================
// ANNE'S CREATIVE DIRECTOR — Netlify Function
// POST /.netlify/functions/creative-director
// Turns one piece of content into a week of posts in Anne's voice
// Returns: { linkedin: [3 posts], instagram: [3 posts], facebook: [2 posts] }
// ============================================================

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  let source, contentType, pillar;
  try {
    const body = JSON.parse(event.body || '{}');
    source = body.source || '';
    contentType = body.contentType || 'content';
    pillar = body.pillar || '';
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!source) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'No source content provided' }) };
  }

  const SYSTEM = `You are Anne McClain's Creative Director for Everyday Ceremony By Anne.

## Who Anne Is
Anne creates handcrafted ritual products — candles, incense, self-care kits — for women who have spent years giving everything to everyone else and are ready to return to themselves. Tagline: "Celebrating You Today, Tomorrow and Always."

## Anne's 7 Content Pillars
1. The Sacred Self — returning to yourself after years of giving everything
2. Quiet Luxury — redefining luxury as presence, not price
3. The Ceremony Within — making everyday moments sacred
4. Ritual & Healing — the quiet power of consistent self-care
5. Celebrating You — honoring yourself fully, not when you've earned it
6. Boston Besties — the magic of women who show up for each other
7. The CEO Board — leading life and business with wisdom

## Anne's Voice Rules
- Tone: elevated, poetic, luxurious, inclusive, grounding
- Short paragraphs. White space. Language that feels like candlelight.
- Signature phrases: "Celebrating you today, tomorrow, and always" / "quiet luxury" / "everyday ceremony" / "returning to yourself"
- NEVER use: em dashes (—), exclamation points, "busy woman", "hack", "optimize", "amazing", "incredible", "genuinely"
- Numbers always as digits
- Never open with "I" as the first word
- Instagram: 3-5 short stanzas + 2-3 hashtags. Poetic. Stop-the-scroll hook.
- Facebook: conversational, warm, ends with a question inviting community
- LinkedIn: professional authority lens. Women in leadership. Ends with 2-3 hashtags.

## The 10 Viral Hook Frameworks
1. THE CONFESSION: "I was wrong about [thing]."
2. THE NUMBER DROP: Specific surprising number or result
3. THE IDENTITY SHIFT: "[Old identity] doesn't run this anymore."
4. THE UNPOPULAR TRUTH: Say what others won't
5. THE SCENE-SETTER: Drop her into a specific cinematic moment
6. THE DIRECT ADDRESS: Speak to exactly one woman
7. THE CONTRAST: Two worlds, one line
8. THE QUESTION THAT STINGS: A question she can't say no to
9. THE MICRO-STORY: Tiny story, huge point
10. THE AUTHORITY OPENER: Lead with lived experience`;

  const pillarLine = pillar ? `Focus on this pillar where possible: ${pillar}` : 'Choose the most fitting pillar for each post from Anne\'s 7 pillars.';

  const USER = `Here is Anne's source ${contentType}:

---
${source.substring(0, 3000)}
---

${pillarLine}

Extract the key ideas, emotions, and wisdom from this content. Then write:

3 LINKEDIN POSTS — professional authority, women in leadership lens
3 INSTAGRAM POSTS — poetic, visual, stop-the-scroll
2 FACEBOOK POSTS — warm, conversational, community-inviting

Every post must:
- Open with a viral hook (use one of the 10 frameworks)
- Be fully in Anne's voice (sacred, grounding, poetic)
- NOT be a summary — be an original post inspired by the content

Return ONLY in this exact JSON format:
{
  "linkedin": ["post 1", "post 2", "post 3"],
  "instagram": ["post 1", "post 2", "post 3"],
  "facebook": ["post 1", "post 2"]
}`;

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
        max_tokens: 4000,
        system: SYSTEM,
        messages: [{ role: 'user', content: USER }]
      }),
      signal: AbortSignal.timeout(40000)
    });

    if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
    const data = await res.json();
    let text = data.content[0].text.trim();

    // Strip markdown code fences if present
    text = text.replace(/^```json\s*/i,'').replace(/\s*```$/,'').trim();

    const result = JSON.parse(text);
    return { statusCode: 200, headers, body: JSON.stringify(result) };

  } catch (err) {
    console.error('creative-director error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
