# ============================================================
# THE MAGNIFICENT BEAST — ANNE McCLAIN
# Everyday Ceremony By Anne
# client_config.py — The ONLY file that changes between clients
# Controls the daily viral scraper (GitHub Actions, 7am UTC)
# ============================================================

CLIENT_NAME  = "Anne McClain"
CLIENT_BRAND = "Everyday Ceremony By Anne"
CLIENT_NICHE = "Handcrafted ritual products and self-care ceremonies for women who have put others first and are ready to return to themselves"

IDEAL_CLIENT_DESCRIPTION = """
She is a soulful woman — likely in her 40s or 50s — who has spent years giving everything
to everyone else. She's successful by most measures but feels quietly disconnected from
herself. She's not looking for a wellness program or a morning routine checklist.
She's looking for something that feels like coming home.

For her, luxury isn't about price. It's about presence. She wants small, sacred practices
that interrupt the busyness — a candle lit with intention, a ritual that says:
this moment is mine.

She's tried getaways, counseling, looking outside herself for the answer. Nothing
quite landed. What she really wants is something intimate and personal —
a daily ceremony that honors who she is, not who she's been performing.
"""

OFFERS = """
Mystic Harmony DIY Incense Guide (Free): Entry-point guide to crafting your own sacred rituals at home
Mystic Rose Candle Collection: Small batch, hand-poured scented candles — luxury not defined by price but by presence
Self-Care Ritual Kit: A curated collection of handcrafted ritual tools to anchor daily ceremony
"""

REPORT_VOICE_RULES = """
- Always: poetic, elevated, grounding, warm, inclusive
- Always: "quiet luxury", "everyday ceremony", "celebrating you", "quiet ritual", "returning to yourself"
- Always: short paragraphs, white space, language that feels like candlelight
- Never: hustle culture language, productivity framing, clinical wellness-speak
- Never: "self-care routine", "hack", "optimize", "busy woman" (she knows she's busy, don't remind her)
- Tone: like a wise, warm friend who lights candles and actually reads poetry
- Her tagline: "Celebrating You Today, Tomorrow and Always"
"""

CONTENT_PILLARS = [
    "The Sacred Self",
    "Quiet Luxury",
    "The Ceremony Within",
    "Ritual & Healing",
    "Celebrating You",
    "Boston Besties",
    "The CEO Board",
]

# YouTube channels in the self-care/ritual/wellness niche
YOUTUBE_HANDLES = [
    "@SelfCareIsForEveryone",
    "@TheRitualWitch",
    "@SlowLivingWithStyle",
    "@MindfulLuxury",
    "@EverydayWellnessRituals",
]

# Subreddits where Anne's ideal client spends time
REDDIT_SUBS = [
    "selfcare",
    "wellness",
    "slowliving",
    "womenover40",
    "AromatherapyAndCandles",
]

# Pain patterns — exact language the ideal client uses
PAIN_PATTERNS = {
    "Disconnection from Self": [
        "I don't even know who I am anymore",
        "I give and give and there's nothing left for me",
        "I've lost myself somewhere along the way",
        "I feel like I'm just going through the motions",
    ],
    "Busyness & No Presence": [
        "I can't slow down even when I try",
        "I'm always on but never here",
        "I keep waiting for things to calm down before I take care of myself",
        "Even my self-care feels like another thing on my to-do list",
    ],
    "Tried Everything": [
        "I've done the therapy, the retreats, the journaling",
        "Nothing seems to stick",
        "I know what I should do but I can't make myself do it",
        "Every solution feels like more work",
    ],
    "Worth & Receiving": [
        "I feel guilty when I spend time on myself",
        "I don't know how to receive",
        "I feel like I have to earn rest",
        "Luxury feels selfish",
    ],
    "Longing for Ritual": [
        "I want something that feels sacred",
        "I want my home to feel like a sanctuary",
        "I want small moments that feel intentional",
        "I'm craving something slow and beautiful",
    ],
}

# RSS feeds — wellness, ritual, slow living blogs and newsletters
RSS_FEEDS = [
    "https://www.mindbodygreen.com/rss.xml",
    "https://www.wellandgood.com/feed/",
    "https://www.ritualandceremony.com/feed",
]

# Additional subreddits for pain-point intelligence scraping
PAIN_SEARCH_SUBS = [
    "selfcare",
    "womenover40",
    "slowliving",
    "wellness",
]
