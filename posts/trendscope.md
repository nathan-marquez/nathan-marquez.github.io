---
date: 2025-08-22
---

# Reel Ideas - Daily reports of trending TikToks in your creator niche

![Trendscope Demo](media/trendscope.png)

Business owners and founders who want to grow on social media often have to spend a lot of time scrolling on TikTok. My girlfriend, who owns a sticker and handmade art business, voiced this pain point to me. Why should she have to spend 1 hour a day
scrolling on Reels to find viral video ideas? She'd rather spend that time actually making art!

## Tech Stack
- Supabase
    - Database
    - Edge Functions
    - Auth
- Next.js
- Apify
- Gemini

## The Product
- Reel Ideas is an automation that leverages LLMs, and web scrapers from Apify. 
- Users sign up and input information about their "niche", essentially what specific genre or topics on TikTok they are interested in. 
- Then, a Cron Job built and orchestrated with Supabase Edge Functions will kick off an Apify job to scrape keywords in TikTok search related to that niche.
- We poll for results from Apify, then once we have search results, kick off a ranker to rank the videos based on views, comments, followers, and other signals. We grab the first N candidates from this first ranking stage.
- We then call an LLM to rerank and pull the Top 3 results. We leverage the LLM’s ability to reason about the user, what they want to know about in their niche, and the data to figure out what is most relevant.
- We package the top three results with in-depth analysis, append the rest of the results in a pretty data list, and email the report to the user!

To this day, the Cron job is still emailing TikTok research reports to my girlfriend :) 