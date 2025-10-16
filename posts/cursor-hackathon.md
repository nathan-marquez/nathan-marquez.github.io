---
date: 2025-09-12
---

# Using Cursor Agent to Automate Turning Design System Changes into PRs

![Cursor Agent Demo](media/cursor_hackathon/cursor_demo.mp4)

Worked on this with my friends [Chamod](https://x.com/og_chamod), [Fate](https://x.com/FateJacobson), and [Mathurah](https://x.com/mathurahravi) for a hackathon hosted by Cursor.  
We leveraged Figma webhooks to listen for any changes made to design files and spun up a Cursor Agent with a lightweight Modal backend.  
The agent would figure out the diffs from the file changes and make corresponding CSS updates to a repo’s design system.

## The Hackathon

Mathurah was the one who told me about the hackathon and her idea for an agent that could automate component updates based on Figma changes.  
It seemed super feasible to me -- and also super useful! We joined forces with Chamod and Fate and spent one evening planning out the work.  
We divided it into four main parts that we could each tackle:

1. **Me:** Handle the general backend wiring with Modal (I’d heard about Modal as an easy serverless Python solution at a party the week before and wanted to try it out).  
2. **Mathurah:** Design the system and Figma file, ensuring it would play nicely with the agent.  
3. **Chamod:** Implement that design system in code. It was critical to have a 1:1 mapping between components and files so the agent could easily parse and process them.  
4. **Fate:** Explore the Figma MCP and the general data model that Figma would pass to the backend.

We *thought* we were going to get all the work done before the hackathon… but none of us found the time 😅  
So we actually did what we were supposed to, and hacked **during** the hackathon!

![Luma](media/cursor_hackathon/event.png)

All in all, the hackathon was pretty chill. The office itself looked like a really big apartment, and there was decent free food and drinks.  
I’ve been to some hackathons in the past that were crowded and smelly, but this space was super clean, and they even made us wear shoe covers!

They even had some free swag:

![Team](media/cursor_hackathon/team.jpeg)

When we got to work, we ran into some issues with Modal (oops, that was my task).  
I found that when I made a Modal deployment, my environment secrets wouldn’t propagate immediately, or maybe not at all, and sometimes race conditions occurred.  
This became clear when we tried switching between Figma API keys and kept hitting permission issues due to the wrong keys being accessed.  
In the end, I just decided to hard-code the keys into the script (yikes!). But hey, it got the job done.  

Mathurah and Chamod had a flawless working frontend repo and Figma file, and Fate confirmed that the Cursor Agent had the right capabilities to make edits.

Then came integration. We were able to:

- Successfully get Figma webhooks to trigger a call to the serverless Modal endpoint  
- Flow data through from the Figma changes  
- Kick off a Cursor Agent with the Agent API  

**BUT...** for some reason, the Cursor Agent couldn’t gain access to the repo!  
This was super weird, since we explicitly gave access to the Cursor Agent in the Agent Dashboard.  
We called over the Cursor staff, and after about 30 minutes of debugging... they still couldn’t figure it out 😅

They ended up flagging it to their engineers to investigate.

This actually sucked a lot. We’d done all this work and were *so* close to the finish line.  
Eventually, we ran out of time, and the event organizers started calling for presentations.

Defeated, we watched others present their projects. Some people integrated Cursor Agents with their Apple Watches so they could kick off code changes from their wrists.  
Others built workflow integrations similar to ours, connecting to task management systems.  

As we were watching, a **hail-mary** idea came to mind: make the repo public.  
Surely the agent *had* to be able to access the design system repo if it was public, right?  
I had Chamod (the repo owner) clone it and make it public... but alas, it still didn’t work.

Then I had a final *hail-hail-mary* -- clone the public repo myself.  
I figured maybe something was off with the integration on Chamod’s GitHub account.  
So I cloned it, plugged the new repo into the automation... and it worked! 🎉

We ran up to the line of presenters and managed to give our demo just in time.  
We got a round of applause and lots of congratulations from the other participants as we stepped off the stage.  
It was such a nice and rewarding feeling :)

## Sharing Our Work

After the hackathon, Mathurah posted about our project on Twitter, and it actually got a ton of reach!

![Launch](media/cursor_hackathon/launch.png)

All in all, a 10/10 hackathon experience.  
I love testing out new technologies and building with my friends.