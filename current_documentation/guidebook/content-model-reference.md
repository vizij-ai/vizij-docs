<!-- tags: type=reference; status=written; topics=guidebook,content-model,teaching-primitives -->

> **Last updated:** 2026-03-11
> **Purpose:** define the canonical teaching primitives for the Vizij guidebook independent of any one publishing surface

# Guidebook Content Model Reference

## 1. Core Rule

The guidebook is authored in terms of teaching primitives, not site components.

Each module should use whatever mix of framing, explainers, visuals, executable content, interactive content, operational content, and reference bridges is required to teach the concept accurately.

The right question is not "does this page have one diagram?" The right question is "what evidence and explanation does this concept need in order to be taught well?"

## 2. Page Composition Rules

Every module should define:

1. the reader outcome,
2. the intended audience or prior context,
3. what successful completion or understanding looks like,
4. the next useful step,
5. where implementation truth lives when the reader needs to go deeper.

Modules may include as much or as little media as the concept requires. Some concepts may be taught well with pure prose and code. Others may need multiple screenshots, diagrams, walkthroughs, or videos.

## 3. Canonical Content Families

### Framing

| Content type | Teaches well | Appropriate when | Poor fit when | Relationship inside a page | Concepts that often benefit |
| --- | --- | --- | --- | --- | --- |
| Outcome note | what the reader will be able to do or understand | the start of almost any module | the module has no clear reader outcome yet | opens the page and frames the rest | all buckets |
| Audience note | who the page is for and what it assumes | the page serves a specific reader slice | the audience is truly universal and obvious | sits near the top and narrows scope | introduction, advanced modules |
| Prerequisite snapshot | what the reader should already know or have available | success depends on prior setup or context | the page is intentionally zero-friction | appears before steps or deeper explanation | tutorials, deployment, customization |
| Artifact note | what working thing the reader should expect to touch or produce | the page centers on a concrete asset, player, app, or deployment | the page is purely conceptual | ties the concept to a tangible object | experience, integrate, deploy |
| Validation check | how the reader knows they succeeded | the page has an operational or experiential goal | success is purely conceptual and cannot be checked directly | follows steps or a concept milestone | tutorials, demos, deployments |
| Next-step note | where the reader should go next | the page is part of a broader route | the page is fully standalone | closes the page and keeps the route moving | all buckets |
| Implementation bridge | where engineering truth lives | the guidebook page abstracts implementation detail | the page already is the implementation truth | points outward to repo-local or canonical implementation docs | fundamentals and advanced modules |

### Explainers

| Content type | Teaches well | Appropriate when | Poor fit when | Relationship inside a page | Concepts that often benefit |
| --- | --- | --- | --- | --- | --- |
| Concept explainer | definitions, mental models, and why something matters | the reader needs a stable conceptual model | the reader only needs a quick click path | usually forms the backbone of the page | introduction, control, customize |
| Glossary note | precise terms and local vocabulary | terms are overloaded or non-obvious | vocabulary is already settled and simple | appears inline or in support callouts | fundamentals |
| FAQ | common reader confusions and edge questions | a topic produces repeated predictable questions | the topic is linear and simple | sits after the main explanation or in support blocks | experience, deploy, support |
| Comparison | how two things differ and when to choose them | readers need to distinguish similar options | there is only one meaningful option | pairs naturally with diagrams or decision guides | integrate, deploy, customize |
| Decision guide | how to pick a path, tool, or level of depth | a page is helping the reader choose | the page is only explaining one fixed path | usually appears early and routes outward | introduction, integrate, deploy |
| Conceptual walkthrough | a narrated explanation of a system or process | the reader benefits from guided reasoning more than raw reference | the topic is better taught as a strict procedure | often bridges prose, visuals, and examples | control, fundamentals, advanced topics |

### Visuals

| Content type | Teaches well | Appropriate when | Poor fit when | Relationship inside a page | Concepts that often benefit |
| --- | --- | --- | --- | --- | --- |
| Diagram | structure, flow, relationship, or sequence | the reader needs a mental map | the concept is obvious in prose or UI alone | supports explainers and comparisons | introduction, control, deploy |
| Screenshot | what a reader should see in a real surface | the UI state matters | the state changes too quickly or the screenshot adds no information | pairs well with steps and validation | experience, customize, deploy |
| Annotated screenshot | what matters inside a screen and why | the UI has multiple important hotspots or states | annotations would clutter more than clarify | should be explained in adjacent prose | customize, control, integrate |
| Screenshot sequence | multi-step visual change over time | the reader must track a transition or workflow | a single image or video would communicate better | supports walkthroughs and validation | customize, deploy |
| Before/after pair | effect of a change or configuration | the outcome of customization or control matters | there is no meaningful visible delta | pairs well with comparisons and validation | customize, control |
| Timeline | temporal progression or staged flow | the reader needs sequence with time emphasis | a standard step list is clearer | often complements deployment or orchestration explanations | deploy, advanced control |
| Video clip | motion, timing, and embodied behavior | stills fail to show the actual phenomenon | the concept is static or the clip would be gratuitous | should be captioned and tied to a clear teaching point | experience, control, customize |

### Executable Content

| Content type | Teaches well | Appropriate when | Poor fit when | Relationship inside a page | Concepts that often benefit |
| --- | --- | --- | --- | --- | --- |
| Command example | exact terminal actions and quick reproducibility | setup or validation happens in a shell | the reader is not expected to use a shell at all | pairs with prerequisites and validation | integrate, deploy, support |
| Code snippet | implementation shape or API usage | a concept is best grounded in code | the snippet would be too large or distracting | should be small enough to teach, not dump | control, integrate, advanced customize |
| Payload example | runtime messages, data shapes, or control payloads | the interface is data-driven | the data adds no clarity | should sit next to the concept it demonstrates | control, integrate |
| API example | callable surface and expected behavior | the reader needs to understand a public programmatic interface | the module is purely conceptual or UI-only | often pairs with snippets or walkthroughs | integrate, advanced control |
| Config fragment | the minimum meaningful configuration | setup depends on a file or declarative block | full-file context is required to make sense of it | pairs with explanation of effect and placement | customize, deploy, integrate |

### Interactive Content

| Content type | Teaches well | Appropriate when | Poor fit when | Relationship inside a page | Concepts that often benefit |
| --- | --- | --- | --- | --- | --- |
| Embedded demo | embodied understanding through direct manipulation | immediate interaction is central to the teaching goal | the experience is too heavy or unstable to embed well | should be framed with what to try and what to notice | experience, control |
| Sandbox link | fast hands-on entry without heavy explanation | a reader should try before they study | the linked surface is fragile or not maintained | should sit near the top of the route | experience, tutorials |
| Guided lab | deeper interactive learning with a defined arc | the reader should learn by doing a sequence of tasks | the concept is too small for a lab | pairs with validation and troubleshooting | control, customize, workshops |
| Interactive example | bounded richer interaction in a module | the concept needs controlled experimentation | the example distracts from the main lesson | should reinforce the page, not replace it | integrate, advanced experience |

### Operational Content

| Content type | Teaches well | Appropriate when | Poor fit when | Relationship inside a page | Concepts that often benefit |
| --- | --- | --- | --- | --- | --- |
| Step-by-step tutorial | how to complete a concrete task | there is a real workflow with ordered steps | the topic is better taught conceptually first | should include validation and next steps | experience, customize, integrate, deploy |
| Checklist | critical steps or validation gates | the reader needs a compact operational summary | the topic requires narrative explanation to make sense | complements, but does not replace, the tutorial | deploy, workshops, support |
| Workflow map | the shape of a multi-stage process | the reader needs to understand the whole path before details | the workflow is too small to map | supports decision guides and tutorials | customize, deploy |
| Troubleshooting | common failures and likely fixes | a task often goes wrong in predictable ways | the task is trivial and failure-free | usually follows the main procedure | support, integrate, deploy |
| Failure-state example | what wrong looks like | errors are hard to recognize from prose alone | failure is obvious or unimportant | pairs with troubleshooting or comparisons | customize, deploy, control |
| Recovery guidance | how to get back to a good state | the path includes risky or fragile steps | recovery depends entirely on external judgment | should sit near troubleshooting and validation | customize, deploy, support |

### Reference Bridges

| Content type | Teaches well | Appropriate when | Poor fit when | Relationship inside a page | Concepts that often benefit |
| --- | --- | --- | --- | --- | --- |
| Repo link | where implementation truth lives | a reader needs source code or repo-local docs next | the module should remain self-contained for the intended audience | should point to the exact owning surface | fundamentals, advanced |
| Package link | reusable dependency or published package surface | the reader needs package-level reference or install info | the package is incidental noise | pairs with API examples and config fragments | integrate, deploy |
| Public tooling link | maintained external tool or app surface | the reader should interact with a maintained tool directly | the link would offload core explanation | supports workflow pages and quickstarts | experience, customize |
| Related guidebook link | the next adjacent concept in the teaching journey | the module is part of a route through the matrix | there is no meaningful next step | closes loops across buckets and depths | all buckets |
| Implementation anchor | the specific document, app, crate, package, or path that owns the engineering truth | the page intentionally abstracts an implementation | the page itself is already the implementation truth | should be concrete and scoped, not generic | fundamentals, advanced |

## 4. Depth Levels and Content Choice

`Surface`, `Fundamentals`, and `Advanced` are defined by teaching objective, not by content quotas.

### Surface

Use content that gets the reader oriented quickly and makes success tangible. This often favors concise explainers, clear screenshots, demo access, short videos, and minimal walkthroughs, but it may also use code or diagrams when those are the clearest way to reduce confusion.

### Fundamentals

Use content that establishes stable mental models, terminology, structure, and operational basics. This often benefits from concept explainers, diagrams, annotated visuals, code or payload examples, and implementation bridges, but the actual mix should be chosen by what the concept needs.

### Advanced

Use content that supports extension, ownership, customization, architecture-sensitive reasoning, and richer implementation patterns. This often benefits from deeper walkthroughs, comparisons, diagnostics, richer examples, and outward links into implementation truth, but it can use the same content types as fundamentals when that is the clearest teaching method.

## 5. Publishing Implication

The guidebook content model is the canonical teaching model.

Publishing surfaces such as the website, tutorials, demos, workshops, and event pages should project this model downstream. If a publishing surface cannot yet represent a needed teaching primitive well, that limitation belongs to the publishing surface, not to the guidebook.
