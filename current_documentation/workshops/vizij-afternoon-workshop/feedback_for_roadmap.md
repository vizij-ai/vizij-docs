# Vizij Roadmap @ HRI 2026

## What was relevant for your research?

- gaze behavior was engaging, and blending expressions was cool.
- Children could play with the face-based device with emotions. And through that make the character happy / unhappy depending on the children's behavior to teach them.
  - Seems relevant to use emotions and navigate between them
- As an emotional third-party for support discussions, the emotion poses are interesting\!
  - They plan to figure out in-between emotional poses.
  - Transition is not really linear, it’s more a staircase. Maybe go through a waypoint pose? Otherwise just do that
- Multilingual lipsync is going to be useful
- How to programmatically change values at runtime?
  - There’s a websocket API and a ROS one
- Have been using the current standard emotions already with an LLM and it was fine.
- For speech therapy, we actually need to show detailed movements, with teeth and tongue.
  - Also, teaching about AI

## What are you looking for?

- Is there a ROS plug-in?
  - For instance having an action server
  - It’s ok if it’s a topic we publish to
    - Like we have: we have a topic per value / rig / pose
- Where can you find assets?
  - In the workspace we have few of them
  - We have to make them from Blender…
- Action Units support\!
- Something much easier
- Mii face maker is much easier than Vizij / Blender to create a face
- Generalizing to different faces? What are the requirements?
  - Nothing for now?
  - We talked a lot about action units. Face authors could comply with these drivers so that faces are interoperable.
  - How about visemes? Seems right.
    - But users won’t go
  - PAD model? Valence / arousal
  - /skills/set\_expressions is actually a good candidate from ROS4HRI. It supports valence / arousal, emotion symbols.
    - ROS4HRI could support action units too. The message type exists for the perception nodes.
  - Mapping standards one to another one could boost interoperability
    - For instance ARKit standard
- It’s tedious to define every visemes for instance.
  - What if there was a pre-written prompt to help generate the drivers?
- Easy mode please\!\!\! Like PEERBOTS \=D
- UX isn’t right, perhaps. But do not remove the advanced features.
  - Toggle views.
  - Highlight what you’re supposed to click next, like the “Add…”
  - Child inspection way back to its parents to be standard (back arrow) would be sooo better
  - Keyboard shortcuts pleaaaase, and customizable…
- Some semantic-oriented view?
  - Our demo actually had the LLM produce emotions to express getting through
  - So maybe having a proper higher-level abstraction based on a more semantically meaningful model
- Maybe focus more in terms of features? Beware of trying to cover too many use cases.

## How should we work together

- For ROS, let’s meet on the Discord and iterate. Please discussed
- See the slide on Data Transformations: on each part there are different specialists. That’s the power of the community to put them together.

## Miscellaneous

- ARKit is cool to start generating animations from human face
- Gizmos to poses and rigs
- We’d love to get all the visemes
  - Note that with cartoon characters, getting the visemes wrong is not actually a problem\!
- We were overwhelmed by the workspace.