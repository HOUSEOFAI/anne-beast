#!/usr/bin/env python3
"""
🌹 Everyday Ceremony By Anne — Daily Intelligence Scraper
Scrapes Reddit, RSS, YouTube. Detects pain patterns. Generates report via Claude API.
"""

import os
import json
import sys
import time
import logging
from datetime import datetime
from typing import List, Dict
import requests
from dotenv import load_dotenv
from anthropic import Anthropic

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

from client_config import (
    CLIENT_NAME, CLIENT_BRAND, CLIENT_NICHE, IDEAL_CLIENT_DESCRIPTION,
    OFFERS, REPORT_VOICE_RULES, YOUTUBE_HANDLES, REDDIT_SUBS,
    PAIN_PATTERNS, RSS_FEEDS, PAIN_SEARCH_SUBS
)

ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY')
if not ANTHROPIC_API_KEY:
    logger.error("CRITICAL: ANTHROPIC_API_KEY not found in environment variables")
    sys.exit(1)

anthropic_client = Anthropic(api_key=ANTHROPIC_API_KEY)

JSONBIN_BIN_ID = os.environ.get('JSONBIN_BIN_ID')
JSONBIN_API_KEY = os.environ.get('JSONBIN_API_KEY')

def scrape_reddit(subreddits: List[str], limit: int = 25) -> List[Dict]:
    posts = []
    headers = {'User-Agent': 'Mozilla/5.0 (Everyday Ceremony Bot v1.0)'}
    
    for subreddit in subreddits:
        retry_count = 0
        max_retries = 3
        
        while retry_count < max_retries:
            try:
                logger.info(f"📱 Scraping Reddit r/{subreddit}...")
                url = f"https://www.reddit.com/r/{subreddit}/new.json?limit={limit}"
                response = requests.get(url, headers=headers, timeout=10)
                response.raise_for_status()
                
                data = response.json()
                posts_data = data.get('data', {}).get('children', [])
                
                for post in posts_data:
                    post_data = post.get('data', {})
                    posts.append({
                        'source': 'reddit',
                        'subreddit': subreddit,
                        'title': post_data.get('title', ''),
                        'text': post_data.get('selftext', ''),
                        'score': post_data.get('score', 0),
                        'url': f"https://reddit.com{post_data.get('permalink', '')}"
                    })
                
                logger.info(f"   ✅ {len(posts_data)} posts from r/{subreddit}")
                break
                
            except requests.exceptions.RequestException as e:
                retry_count += 1
                logger.warning(f"   ⚠️  Reddit r/{subreddit}: {e}")
                if retry_count < max_retries:
                    wait_time = 2 ** retry_count
                    logger.info(f"   Retrying in {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    logger.error(f"   ❌ Failed after {max_retries} retries")
    
    logger.info(f"📱 Total Reddit posts: {len(posts)}")
    return posts

def scrape_rss_feeds(feed_urls: List[str]) -> List[Dict]:
    try:
        import feedparser
    except ImportError:
        logger.error("feedparser not installed. Install with: pip install feedparser")
        return []
    
    articles = []
    
    for feed_url in feed_urls:
        try:
            logger.info(f"📰 Scraping RSS: {feed_url[:50]}...")
            feed = feedparser.parse(feed_url)
            
            for entry in feed.entries[:15]:
                articles.append({
                    'source': 'rss',
                    'feed': feed_url,
                    'title': entry.get('title', ''),
                    'summary': entry.get('summary', ''),
                    'link': entry.get('link', ''),
                    'published': entry.get('published', '')
                })
            
            logger.info(f"   ✅ {len(feed.entries[:15])} articles")
            
        except Exception as e:
            logger.warning(f"   ⚠️  RSS feed error: {e}")
    
    logger.info(f"📰 Total RSS articles: {len(articles)}")
    return articles

def scrape_youtube_channel(channel_handle: str) -> List[Dict]:
    videos = []
    
    try:
        from yt_dlp import YoutubeDL
        logger.info(f"🎬 Scraping YouTube {channel_handle}...")
        
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': 'in_playlist',
            'playlistend': 10,
        }
        
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://youtube.com/{channel_handle}/videos", download=False)
            
            if info and 'entries' in info:
                for entry in info['entries']:
                    videos.append({
                        'source': 'youtube',
                        'channel': channel_handle,
                        'title': entry.get('title', ''),
                        'url': entry.get('url', ''),
                        'duration': entry.get('duration', 0)
                    })
        
        logger.info(f"   ✅ {len(videos)} videos")
        
    except ImportError:
        logger.warning("   ⚠️  yt-dlp not installed. Install with: pip install yt-dlp")
    except Exception as e:
        logger.warning(f"   ⚠️  YouTube scrape error: {e}")
    
    return videos

def scrape_youtube_channels(handles: List[str]) -> List[Dict]:
    all_videos = []
    for handle in handles:
        all_videos.extend(scrape_youtube_channel(handle))
        time.sleep(1)
    
    logger.info(f"🎬 Total YouTube videos: {len(all_videos)}")
    return all_videos

def detect_pain_patterns(content: List[Dict], pain_keywords: Dict[str, List[str]]) -> Dict:
    logger.info("🔍 Detecting pain patterns...")
    
    pain_hits = {}
    
    for category, keywords in pain_keywords.items():
        pain_hits[category] = []
        
        for item in content:
            text = f"{item.get('title', '')} {item.get('text', '')} {item.get('summary', '')}".lower()
            
            for keyword in keywords:
                if keyword.lower() in text:
                    pain_hits[category].append({
                        'source': item.get('source', 'unknown'),
                        'keyword': keyword,
                        'item': item
                    })
    
    total_hits = sum(len(v) for v in pain_hits.values())
    logger.info(f"   Found {total_hits} pain pattern hits")
    
    return pain_hits

def generate_report(reddit_posts: List[Dict], rss_articles: List[Dict], 
                   youtube_videos: List[Dict], pain_hits: Dict) -> str:
    logger.info("🤖 Generating intelligence report via Claude...")
    
    content_summary = f"""
TODAY'S CONTENT COLLECTED:
- Reddit posts: {len(reddit_posts)}
- RSS articles: {len(rss_articles)}
- YouTube videos: {len(youtube_videos)}

PAIN PATTERNS DETECTED:
{json.dumps(pain_hits, indent=2)[:2000]}

REDDIT HIGHLIGHTS:
{json.dumps([p['title'] for p in reddit_posts[:5]], indent=2)}

RSS HIGHLIGHTS:
{json.dumps([a['title'] for a in rss_articles[:5]], indent=2)}

YOUTUBE HIGHLIGHTS:
{json.dumps([v['title'] for v in youtube_videos[:5]], indent=2)}
"""
    
    system_prompt = f"""You are {CLIENT_BRAND}'s content intelligence AI. 
Ideal Client: {IDEAL_CLIENT_DESCRIPTION}
Brand Voice: {REPORT_VOICE_RULES}
Offers: {OFFERS}
Niche: {CLIENT_NICHE}

Generate a concise intelligence report (under 1000 words) with:
1. Top 3 Emerging Topics
2. Pain Point Frequency
3. Offer Opportunities
4. Content Ideas
5. Audience Insights

Be specific. Include exact quote snippets. Make it actionable."""

    try:
        message = anthropic_client.messages.create(
            model="claude-opus-4-1",
            max_tokens=1500,
            system=system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": f"Generate today's intelligence report based on this content:\n\n{content_summary}"
                }
            ]
        )
        
        report = message.content[0].text
        logger.info("✅ Report generated successfully")
        return report
        
    except Exception as e:
        logger.error(f"❌ Claude API error: {e}")
        raise

def save_to_jsonbin(report: str, metadata: Dict) -> bool:
    if not JSONBIN_BIN_ID or not JSONBIN_API_KEY:
        logger.warning("⚠️  JSONBin credentials missing")
        return False
    
    try:
        logger.info("☁️  Saving to JSONBin...")
        
        url = f"https://api.jsonbin.io/v3/b/{JSONBIN_BIN_ID}"
        headers = {
            "Content-Type": "application/json",
            "X-Master-Key": JSONBIN_API_KEY
        }
        
        payload = {
            "timestamp": datetime.utcnow().isoformat(),
            "client": CLIENT_NAME,
            "report": report,
            "metadata": metadata
        }
        
        response = requests.put(url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        
        logger.info("✅ Saved to JSONBin")
        return True
        
    except Exception as e:
        logger.error(f"❌ JSONBin save error: {e}")
        return False

def main():
    try:
        logger.info("=" * 60)
        logger.info(f"🌹 {CLIENT_BRAND} — Daily Intelligence Scraper")
        logger.info(f"📅 {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")
        logger.info("=" * 60)
        
        reddit_posts = scrape_reddit(REDDIT_SUBS) if REDDIT_SUBS else []
        rss_articles = scrape_rss_feeds(RSS_FEEDS) if RSS_FEEDS else []
        youtube_videos = scrape_youtube_channels(YOUTUBE_HANDLES) if YOUTUBE_HANDLES else []
        
        all_content = reddit_posts + rss_articles + youtube_videos
        
        pain_hits = detect_pain_patterns(all_content, PAIN_PATTERNS)
        
        report = generate_report(reddit_posts, rss_articles, youtube_videos, pain_hits)
        
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        local_file = f"daily_report_{timestamp}.json"
        
        metadata = {
            "sources": {
                "reddit": len(reddit_posts),
                "rss": len(rss_articles),
                "youtube": len(youtube_videos)
            },
            "pain_hits": {k: len(v) for k, v in pain_hits.items()}
        }
        
        with open(local_file, 'w') as f:
            json.dump({
                "timestamp": datetime.utcnow().isoformat(),
                "client": CLIENT_NAME,
                "report": report,
                **metadata
            }, f, indent=2)
        
        logger.info(f"📁 Report saved locally: {local_file}")
        
        save_to_jsonbin(report, metadata)
        
        logger.info("=" * 60)
        logger.info("✅ Scrape cycle complete")
        logger.info("=" * 60)
        
        return 0
        
    except Exception as e:
        logger.error(f"FATAL ERROR: {e}", exc_info=True)
        return 1

if __name__ == "__main__":
    sys.exit(main())
