---
date: 2024-07-25
---

# Acadia AI - Quality Analysis for Mulimodal LLM Data

![Acadia Demo](media/small_acadia.mp4)

[Acadia](https://www.acadia-ai.com/) is a Data-Centric AI startup I worked on with [Emily Li](https://x.com/EmilyLiJiayao). It was one of the greatest learning experiences I had,
and was my first serious, all-in attempt at creating a company. It also was a ton of fun to build :) We both dropped out of CMU for one semester and rented a hacker house in Haight-Ashbury. I have a ton of fond memories staying up late to prepare for demos, running customer development calls, getting distracted from work with karaoke, and hanging out other founders in the city.

## The Product

Our mission with Acadia was to tackle a growing problem in AI: as models become more complex and multimodal, understanding the quality of the data they're trained on is more critical than ever. We wanted to bring deep interpretability to the entire data and evaluation pipeline.

To do this, we built a tool called the Playground. It was fully multimodal, meaning it could analyze not just text, but also images and code. We put it to the test on challenging industry benchmarks like `Winoground` for image-caption matching and `HumanEval` for code generation to prove its capabilities.

The goal was to empower MLEs to:
- Systematically compare different models to find the best one for their specific use case.
- Identify and fix hidden weaknesses in their datasets, like duplications or underrepresented categories, leading to better data curation.

Ultimately, Acadia was our first big step toward making it easier for anyone to build high-quality LLM and multimodal applications by starting with high-quality data.