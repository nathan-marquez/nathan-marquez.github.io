---
date: 2025-07-10
---
# writeaway.fun - An AI Writing Platform built for the World's Largest Hackathon

![Write Away Demo](media/writeaway/write_away.mp4)

Try it at [www.writeaway.fun](www.writeaway.fun)! This was my submission for the Bolt.new world's largest hackathon. It's essentially a "Cursor for Writing". You can make agentic edits across files, press tab to autocomplete, and there are even reactive "AI-Blocks" that update
in real time based on the content of the document.

## Tech Stack

  - **Agent**: I made my own bespoke agent framework mainly leveraging Gemini 2.5 Flash. Rather than relying on something like AI SDK or LangChain, I wanted to get my hands dirty with actually creating the orchestration framework for an agent. Ended up being a great learning experience\!
  - **Frontend**: As per the hackathon requirements, the frontend had to be mainly built with Bolt.new. By default, this creates a React app that can easily be deployed in Vercel. I got the bulk of it done in Bolt.new, then added some finishing touches in Cursor.
  - **Backend**: There actually is no backend\! Everything runs in one repo, including the agent. API keys are hidden behind Vercel env variables. Although I later found out that this gets bundled with the frontend, and I had mistakenly thought they would be hidden from the client. Oops\!
  - **Landing Page**: Framer

## Sharing with the world

I actually had a few incredible opportunities to share my work:

The first was **Design Buddies Demo Night**. I was actually in San Francisco for YC Startup School, when my friends Selena and Ileen had invited me to this Design Buddies event. Design Buddies is a Bay Area-based group for professional designers, and they typically run workshops, meetups, and fireside chats with prominent designers and leaders in Tech. This event in particular was specifically for the Bolt.new hackathon, and encouraged people to demo their projects. At the last minute, I emailed the organizer and was selected to demo\!

![Write Away Demo](media/writeaway/db_submission.png)

I arrived at the event, and to my surprise, the CEO of Bolt.new, Eric, was there\! I nervously gave my demo with him about 4 feet from me... and he loved it\!

![Write Away Demo](media/writeaway/db_demo.png)

Eric congratulated me as I finished my presentation,

"This is so cool\!"

And I got to chat with him about the company, improvements to the platform, and overall what it was like running a hugely popular vibe coding startup.

-----

The next opportunity I had to share WriteAway was that I was selected to be on the gallery page for the Bolt.new hackathon showcase\!

![Write Away Demo](media/writeaway/bolt_showcase.png)

-----

Finally, a couple days after I was added to the gallery page, I received a DM from Bolt.new:

![Write Away DM](media/writeaway/bolt_ask.png)

I took some time off of work that Friday, logged onto the presentation platform, and presented to 2.9k viewers\!

You can watch the [recording here](https://youtu.be/8jbIMr6yRMM?t=6435) :)

![Write Away Presentation](media/writeaway/bolt_present.png)

During the presentation, a comment was dropped in the chat that really warmed my heart:

![Bolt Comment](media/writeaway/bolt_comment.png)

It makes me really happy that a parent was able to share a story with their child, all crafted in WriteAway.

### The end of the hackathon

The month-long hackathon concluded with a final announcement video of who won. I actually didn't end up winning any prizes\! To be honest, I'm totally ok with that -- the experience of building it and getting to share it with the Bolt community was so rewarding in and of itself.

## A bit of History

The concept for WriteAway was actually born in my sophomore year college dorm room. My roommate, Chris, and I had an idea for a "distraction-free, beautiful writing environment" that would promote flow-state journaling and brainstorming. People could spitball thoughts and ideas, and we could use NLP models to extract information like sentiment and topics. This was during 2021, before LLMs, so we were planning to use pretty basic models like BERT. Unfortunately, we got busy with studies and never saw it to completion.

Here's some of Chris' old drawings of what the logo could look like.
![Write Away Demo](media/writeaway/logo.png)

And some of the Notion docs we had.
![Write Away Demo](media/writeaway/artifacts.png)

![Write Away Demo](media/writeaway/design.png)

![Write Away Demo](media/writeaway/roadmap.png)

So thanks Chris for coming up with the cool WriteAway name :) Hope I was able to successfully bring our dorm room idea to life.