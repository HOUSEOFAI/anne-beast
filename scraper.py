#!/usr/bin/env python3
"""
THE MAGNIFICENT BEAST — Daily Intelligence Scraper
Runs on GitHub Actions at 7am UTC daily.
Scrapes Reddit + RSS, detects pain patterns, generates report via Claude,
saves to JSONBin for the Netlify poster to consume at 9am UTC.
"""

import os
import json
import time
import re
import requests
import feedparser
from datetime import datetime, timezone

import anthropic

# ─── Import client config ────────────────────────────────────────────────────
from client_config import (
    CLIENT_NAME, CLIENT_BRAND, CLIENT_NICHE,
    IDEAL_CLIENT_DESCRIPTION, OFFERS, REPORT_VOICE_RULES,
    CONTENT_PILLARS, REDDIT_SUBS, PAIN_PATTERNS,
    PAIN_SEARCH_SUBS, RSS_FEEDS, YOUTUBE_HANDLES
)

# ─── Env vars ────────────────────────────────────────────────────────────────
ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]
JSONBIN_BIN_ID    = os.environ["JSONBIN_BIN_ID"]
JSONBIN_API_KEY   = os.environ["JSONBIN_API_KEY"]

anthropic_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

# ─── Reddit scraper ──────────────────────────────────────────────────────────
def scrape_reddit(subreddits, limit=25):
    posts = []
    headers = {"User-Agent": "Mozilla/5.0 (HOAI-Beast/1.0)"}
    for sub in subreddits:
        try:
            url = f"https://www.reddit.com/r/{sub}/hot.json?limit={limit}"
            r = requests.get(url, headers=headers, timeout=15)
            if r.status_code != 200:
                print(f"Reddit {sub}: HTTP {r.status_code}")
                continue
            data = r.json()
            for item in data.get("data", {}).get("children", []):
                p = item.get("data", {})
                title = p.get("title", "")
                body  = p.get("selftext", "")
                score = p.get("score", 0)
                if score > 5 and title:
                    posts.append({
                        "source": f"r/{sub}",
                        "title": title,
                        "body": body[:500],
                        "score": score,
                        "url": f"https://reddit.com{p.get('permalink','')}"
                    })
            time.sleep(1.5)
        except Exception as e:
            print(f"Reddit {sub} error: {e}")
    return posts


# ─── RSS scraper ─────────────────────────────────────────────────────────────
def scrape_rss(feeds, limit=10):
    articles = []
    for url in feeds:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:limit]:
                title   = getattr(entry, "title", "")
                summary = getattr(entry, "summary", "")[:500]
                link    = getattr(entry, "link", "")
                if title:
                    articles.append({
                        "source": feed.feed.get("title", url),
                        "title": title,
                        "summary": summary,
                        "url": link
                    })
        except Exception as e:
            print(f"RSS {url} error: {e}")
    return articles


# ─── YouTube scraper (no API key — HTML scrape) ───────────────────────────────
def scrape_youtube(handles, limit=5):
    videos = []
    headers = {"User-Agent": "Mozilla/5.0"}
    for handle in handles:
        try:
            url = f"https://www.youtube.com/{handle}/videos"
            r = requests.get(url, headers=headers, timeout=15)
            titles = re.findall(r'"title":\{"runs":\[\{"text":"([^"]{10,100})"', r.text)
            seen = set()
            for t in titles[:limit]:
                if t not in seen:
                    seen.add(t)
                    videos.append({"source": handle, "title": t})
        except Exception as e:
            print(f"YouTube {handle} error: {e}")
        time.sleep(1)
    return videos


# ─── Pain pattern detection ───────────────────────────────────────────────────
def detect_pain_patterns(posts, pain_patterns):
    hits = {category: [] for category in pain_patterns}
    for post in posts:
        text = (post.get("title","") + " " + post.get("body","")).lower()
        for category, phrases in pain_patterns.items():
            for phrase in phrases:
                if phrase.lower() in text:
                    hits[category].append({
                        "phrase": phrase,
                        "source": post.get("source",""),
                        "title": post.get("title","")[:100]
                    })
    return {k: v for k, v in hits.items() if v}


# ─── Generate intelligence report via Claude ─────────────────────────────────
def generate_report(reddit_posts, rss_articles, youtube_videos, pain_hits):
    today = datetime.now(timezone.utc).strftime("%B %d, %Y")

    content_summary = []
    content_summary.append("=== REDDIT SIGNAL ===")
    for p in reddit_posts[:15]:
        content_summary.append(f"[{p['source']}] {p['title']}")

    content_summary.append("\n=== RSS ARTICLES ===")
    for a in rss_articles[:10]:
        content_summary.append(f"[{a['source']}] {a['title']}")

    content_summary.append("\n=== YOUTUBE TOPICS ===")
    for v in youtube_videos[:10]:
        content_summary.append(f"[{v['source']}] {v['title']}")

    content_summary.append("\n=== PAIN PATTERN HITS ===")
    for cat, hits in pain_hits.items():
        content_summary.append(f"{cat}: {len(hits)} hits")
        for h in hits[:3]:
            content_summary.append(f"  - \"{h['phrase']}\" via {h['source']}")

    prompt = f"""You are the Daily Intelligence Analyst for {CLIENT_BRAND}.

CLIENT: {CLIENT_NAME}
BRAND: {CLIENT_BRAND}
NICHE: {CLIENT_NICHE}

IDEAL CLIENT:
{IDEAL_CLIENT_DESCRIPTION}

OFFERS:
{OFFERS}

VOICE RULES:
{REPORT_VOICE_RULES}

CONTENT PILLARS:
{', '.join(CONTENT_PILLARS)}

TODAY'S RAW SIGNAL ({today}):
{chr(10).join(content_summary)}

Generate a daily intelligence report with:

1. TOP 3 EMERGING TOPICS (what the ideal client is talking about TODAY)
2. PAIN POINT FREQUENCY (which pain categories are most active)
3. OFFER OPPORTUNITY (which offer fits today's pain signal best)
4. READY-TO-USE CONTENT:
   - 1 Facebook post (conversational, empathetic, 150-200 words)
   - 1 Instagram caption (visual hook, 80-120 words, ends with CTA)
   - 1 LinkedIn post (authority positioning, 100-150 words)
   - 1 Email subject line + preview text

Write in the brand voice. No hustle language. No "busy woman" framing.
The report should feel like a wise friend who lit a candle before writing it.

Return as valid JSON with keys: emerging_topics, pain_frequency, offer_opportunity, facebook_post, instagram_caption, linkedin_post, email_subject, email_preview, generated_at
"""

    response = anthropic_client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = response.content[0].text.strip()
    # Extract JSON if wrapped in markdown
    if "```json" in raw:
        raw = raw.split("```json")[1].split("```")[0].strip()
    elif "```" in raw:
        raw = raw.split("```")[1].split("```")[0].strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "emerging_topics": ["Signal gathered — parsing error"],
            "pain_frequency": {},
            "offer_opportunity": OFFERS.split("\n")[0] if OFFERS else "",
            "facebook_post": raw[:500],
            "instagram_caption": "",
            "linkedin_post": "",
            "email_subject": f"{CLIENT_BRAND} — Daily Signal",
            "email_preview": "Your daily intelligence is ready.",
            "generated_at": today,
            "raw_response": raw
        }


# ─── Save to JSONBin ──────────────────────────────────────────────────────────
def save_to_jsonbin(data):
    headers = {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_API_KEY,
        "X-Bin-Versioning": "false"
    }
    url = f"https://api.jsonbin.io/v3/b/{JSONBIN_BIN_ID}"
    r = requests.put(url, json=data, headers=headers, timeout=30)
    if r.status_code in (200, 201):
        print(f"✅ Saved to JSONBin: {JSONBIN_BIN_ID}")
    else:
        print(f"❌ JSONBin error {r.status_code}: {r.text}")
    return r.status_code


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    print(f"\n🌹 {CLIENT_BRAND} — Daily Intelligence Scraper")
    print(f"📅 {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}\n")

    print("📡 Scraping Reddit...")
    all_subs = list(set(REDDIT_SUBS + PAIN_SEARCH_SUBS))
    reddit_posts = scrape_reddit(all_subs, limit=20)
    print(f"   {len(reddit_posts)} posts collected")

    print("📰 Scraping RSS...")
    rss_articles = scrape_rss(RSS_FEEDS)
    print(f"   {len(rss_articles)} articles collected")

    print("🎬 Scraping YouTube...")
    youtube_videos = scrape_youtube(YOUTUBE_HANDLES, limit=5)
    print(f"   {len(youtube_videos)} videos collected")

    print("🔍 Detecting pain patterns...")
    pain_hits = detect_pain_patterns(reddit_posts, PAIN_PATTERNS)
    print(f"   {sum(len(v) for v in pain_hits.values())} hits across {len(pain_hits)} categories")

    print("🤖 Generating intelligence report via Claude...")
    report = generate_report(reddit_posts, rss_articles, youtube_videos, pain_hits)
    report["client"] = CLIENT_BRAND
    report["scraped_at"] = datetime.now(timezone.utc).isoformat()
    report["reddit_post_count"] = len(reddit_posts)
    report["rss_article_count"] = len(rss_articles)

    print("💾 Saving to JSONBin...")
    status = save_to_jsonbin(report)

    if status in (200, 201):
        print(f"\n✅ Done! {CLIENT_BRAND} intelligence ready for the Beast poster.\n")
        print(f"📌 Top topic: {report.get('emerging_topics', [''])[0] if report.get('emerging_topics') else 'n/a'}")
    else:
        print("\n⚠️  Report generated but JSONBin save failed. Check secrets.")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
