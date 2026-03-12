<!-- tags: type=reference; status=in_progress; topics=website,documentation,writing,design,audit -->

> **Related documents:** [Website & Ecosystem summary](../summary.md) · [Documentation Strategy & Content - Plan & Tracking](documentation_strategy-plan.md) · [Public Teaching Gap Audit](public_teaching_gap_audit-reference.md) · [Public Page Teaching Sourcebook](public_page_content_brief-reference.md) · [Public Quality Upgrade Plan](public_quality_upgrade_plan-plan.md)
>
> **Last updated:** 2026-03-11
> **Scope:** `vizij-ai.github.io` public routes under `/demos`, `/docs`, and `/tutorials`

# Public Quality and Design Audit

## 1. Purpose

This is the third-pass audit of the Vizij public documentation surface.

The first audit asked whether the pages taught enough to be useful.

This pass asks a stricter question:

> Do these pages now behave like strong independent product documentation for intelligent users, with writing and visual design that help the reader understand, decide, and act without unnecessary explanation theater?

This audit is grounded in both the current Vizij implementation and an external standards corpus for:

1. technical documentation structure,
2. technical writing quality, and
3. visual communication in documentation.

## 2. Standards Corpus

The following sources were used as the audit baseline.

| Source | Why it matters here | Primary criteria borrowed |
| --- | --- | --- |
| [Diátaxis](https://diataxis.fr/) | Strongest framework for separating tutorial, how-to, reference, and explanation intents | One page, one job; avoid mixing explanation and procedure without clear framing |
| [GitHub Docs style guide and content model](https://docs.github.com/en/contributing/style-guide-and-content-model/style-guide) | Practical public-docs guidance for article types, scannability, and task-first structure | Clear headings, predictable article shapes, strong information scent |
| [GitHub guidance for using images](https://docs.github.com/en/contributing/writing-for-github-docs/using-images-in-github-docs) | Strong operational guidance for screenshots, diagrams, and visual support | Use visuals to support text, caption them, keep them current, do not let visuals carry the only explanation |
| [Google developer documentation style guide](https://developers.google.com/style) | Baseline quality bar for technical writing | Plain language, task clarity, procedural completeness, code and command legibility |
| [Microsoft Writing Style Guide](https://learn.microsoft.com/en-us/style-guide/) | Strong sentence-level guidance for direct, professional technical prose | Conversational but not fluffy, active voice, concise and useful wording |
| [GOV.UK writing for GOV.UK](https://www.gov.uk/guidance/content-design/writing-for-gov-uk) | Best-in-class plain-English discipline for high-stakes public content | Start with user need, front-load meaning, remove throat-clearing |
| [GOV.UK design principles](https://www.gov.uk/guidance/government-design-principles) | Useful design-system-level rules for clarity and iteration | Start with needs, do hard work to make it simple, design with data and evidence |
| [Carbon Design System writing style](https://carbondesignsystem.com/guidelines/content/writing-style/) | Helpful for UI-facing wording and component-level copy discipline | Sentence case, short labels, action-oriented interface language |

## 3. Audit Rubric

Each page is graded on four axes.

### 3.1 Content

Does the page deliver the knowledge, artifacts, commands, examples, validation, and failure boundaries needed for the job implied by the title?

### 3.2 Writing

Does the page read like independent documentation for capable users:

1. direct,
2. concrete,
3. scannable,
4. low on throat-clearing,
5. high on decision-relevant information?

### 3.3 Visual Design

Does the page use hierarchy, diagrams, screenshots, code blocks, comparison structures, and spacing intentionally to improve comprehension rather than decorate the page?

### 3.4 Overall

Can the page stand on its own for its intended job, or does the user still need to infer too much?

### 3.5 Grade Scale

| Grade | Meaning |
| --- | --- |
| A | Strong independent documentation; small improvements remain, but the page can carry its intended job |
| B | Good and useful, but still incomplete or uneven in one important dimension |
| C | Mixed quality; some useful material exists, but the page still asks the user to infer or hunt |
| D | The intent is visible, but the page is not independently reliable |
| F | The page is misleading, badly broken, or not doing the job it claims |

## 4. Audit Method

This pass used five evidence layers:

1. Current site content in `vizij-ai.github.io/src/site-content/vizij/guides.ts`, `hubs.ts`, and `teaching.ts`
2. Current renderers in `vizij-ai.github.io/src/components/guides/*`
3. Live browser review of representative routes after the latest implementation pass
4. Clean build verification for the current site
5. Cross-repo references in `vizij-web`, `vizij-rs`, and `vizij-docs`

Validation context:

1. `npx tsc --noEmit --pretty false` passed
2. `npm run build:site` passed
3. `npm run build:search` passed
4. `astro check` still OOMs in this repo even with a 16 GB heap, so that remains a tooling caveat rather than a page-quality finding

## 5. What Is Working Well

### 5.1 The site now has a recognizable public documentation spine

The docs, tutorials, and demos surfaces are no longer interchangeable.

That is a major improvement against Diátaxis-style intent separation.

### 5.2 The strongest pages now lead with artifacts, commands, and validation

The current `Getting Started`, `Architecture`, `Authoring`, and `Animations` routes now do a substantially better job of answering:

1. what the reader is trying to produce,
2. what they should run,
3. what they should see, and
4. how they know it worked.

### 5.3 The writing is more direct and less course-like than before

A large amount of meta-instruction and “what this page will teach” language has been removed or reduced. The current copy is closer to product documentation and further from classroom framing.

### 5.4 Visuals are beginning to carry explanatory weight where they should

Two changes matter most:

1. architecture now includes diagrams,
2. authoring now includes real screenshots of the maintained UI.

These are the right visual categories for those page types.

### 5.5 The animation story is materially better

The public animation path now starts from clip creation, playthrough, export, and reset behavior rather than stopping at the abstraction of “you can animate values.”

That is a major quality improvement in both content and intent.

## 6. What Is Still Not Good Enough

### 6.1 Visual communication quality is still concentrated in too few pages

The architecture page and authoring tutorial now use purpose-built visuals, but much of the rest of the site still depends on prose plus code blocks alone.

That leaves several pages under-expressive visually:

1. renderer data model,
2. rigging and control,
3. animation model,
4. deployment model,
5. minimal player,
6. agent face,
7. deployment tutorial.

### 6.2 Some page types are still not strict enough

Several routes still blend explanation, how-to, and reference in the same flow.

The writing is better, but the content model is not yet as sharp as it could be.

### 6.3 Demos still underperform as educational surfaces

The demos page is visually strong and behaviorally rich, but it still behaves more like a showcase plus short annotation than like a deeply legible “observe, inspect, reproduce” surface.

### 6.4 The visual language is coherent but not yet distinctive enough

The site is cleaner than before, but its documentation visuals are still mostly assembled from the same panel grammar:

1. overview cards,
2. callouts,
3. code cards,
4. screenshots or diagrams where added.

The result is orderly, but not yet operating at the “another order of magnitude” level the user asked for.

### 6.5 Some walkthroughs are still thinner than their titles imply

The weakest remaining gap is not correctness. It is density. A few pages still need one more layer of:

1. worked examples,
2. comparison tables,
3. failure-state visuals,
4. annotated screenshots or diagrams,
5. decision criteria.

## 7. Route-by-Route Grades

| Route | Content | Writing | Visual | Overall | What is done well | What is still weak |
| --- | --- | --- | --- | --- | --- | --- |
| `/demos/` | B | B | A- | B | Strong live behavior surface; teaching panels connect sections to deeper routes | Still more showcase than explainer; behavior reproduction path is not explicit enough |
| `/docs/` | B+ | B+ | A- | B+ | Good hub framing and route selection | Could separate page types even more explicitly and preview expected outputs better |
| `/docs/getting-started/` | A- | A- | B+ | A- | Clear first-run path, commands, and validation targets | Could use one compact visual journey map or setup decision table |
| `/docs/architecture/` | A | B+ | A- | A- | Best current explanation page; diagrams materially improve comprehension | Could use one clearer “when to open which repo” comparison block and stronger cross-linking to demos/tutorials |
| `/docs/renderer-data-model/` | B+ | B+ | B | B+ | Canonical path and value examples are now present | Needs a state-flow diagram and a more visual mental model of path -> staged value -> visible face |
| `/docs/rigging-and-control-model/` | B+ | B+ | B | B+ | Stronger control taxonomy and path-family explanation | Needs a visual control hierarchy and a more explicit authored-bundle example |
| `/docs/animation-model/` | A- | B+ | B | B+ | Correctly centers clip creation/playback/export and distinguishes clip vs tween | Needs a visual timeline or playback-state diagram to make motion semantics easier to absorb |
| `/docs/deployment-model/` | B+ | B+ | B- | B+ | Real commands and payloads now make the page operationally useful | Needs a browser-vs-standalone comparison structure and operator-flow visual aid |
| `/tutorials/` | B+ | B+ | A- | B+ | Clearer branching between first build, concept check, and behavior probe | Could do more to explain why this exact order exists and which pages are labs versus walkthroughs |
| `/tutorials/hello-face/` | A- | B+ | B+ | A- | Strong minimal runtime skeleton and first deterministic interaction | Could use one screenshot or render-state visual to make the first success state even more concrete |
| `/tutorials/renderer-data-model/` | B+ | B+ | B+ | B+ | Good lab-to-code bridge with canonical path family | Still somewhat narrow; needs one more explicit debugging flow and value-range visual |
| `/tutorials/authoring/` | A- | A- | A- | A- | Best current workflow page; screenshots, commands, and export-validation loop work together well | Could be even stronger with annotated screenshots and one bundled-GLB artifact checklist card |
| `/tutorials/rigging-and-control/` | B | B+ | B+ | B | Useful lab and control taxonomy | Still thinner than the title implies; needs a fuller authored example and clearer verification of portable vs face-specific behavior |
| `/tutorials/minimal-player/` | B+ | B+ | B | B+ | Good discipline around scope and “what not to add yet” | Needs a more visual app anatomy and maybe one screenshot of expected healthy runtime states |
| `/tutorials/animations/` | A- | A- | B+ | A- | Strong actual clip workflow, exported JSON, and reset logic | Would benefit from a screenshot or timeline visual from the player/editor to complement the code and lab |
| `/tutorials/agent-face/` | B | B | B- | B | Now documents env boundary and major hooks correctly | Needs an integration diagram, degraded-state story, and stronger stepwise flow across voice, gaze, visemes, and emotion |
| `/tutorials/deployment/` | B+ | B+ | B- | B+ | Good shift toward real operator procedure and first payload | Needs screenshots or diagrams for operator flow, plus a clearer split between build, launch, and control |

## 8. Highest-Leverage Findings by Surface Type

### 8.1 Hubs

The hub pages are good but not yet great.

They route well, but they still mostly classify content. The next jump is to make them actively decision-supportive:

1. if you are here, do this first,
2. if that fails, go here,
3. if your goal is different, branch here.

### 8.2 Explanation Pages

`/docs/architecture/` is the model.

The other explanation/reference pages need to borrow more from it:

1. diagrams,
2. comparison structures,
3. flow visuals,
4. decision aids,
5. canonical examples placed near the explanation they support.

### 8.3 Workflow Pages

`/tutorials/authoring/` and `/tutorials/animations/` are the strongest current workflow pages because they combine:

1. actual steps,
2. actual examples,
3. validation logic,
4. visuals that match the task.

The other workflow pages should be brought up to that bar.

### 8.4 Demos

The demos page is visually interesting and persuasive, but it should become more inspectable.

The right next move is not more prose. It is:

1. stronger inline “how this works” structures,
2. visible path or state overlays,
3. better reproduction links into the exact tutorial or docs page for each behavior.

## 9. Overall Assessment

The current Vizij site is no longer in the state captured by the first audit.

It now has:

1. a credible golden path,
2. materially better independent documentation tone,
3. stronger code grounding,
4. better validation and troubleshooting,
5. the beginnings of a purpose-built documentation visual language.

That said, the site is still in the middle tier of documentation quality, not the top tier.

The current state is:

> strong enough to use, strong enough to trust in many places, but not yet so strong that the design, writing, and content model themselves make the learning feel inevitable.

The next order-of-magnitude improvement will come less from adding more words and more from:

1. sharpening page-type contracts,
2. deepening the visual explanation system,
3. bringing weaker workflow pages up to the `Authoring` and `Animations` bar,
4. turning demos into inspectable technical surfaces rather than persuasive showcases.

## 10. Bottom Line

### Best current pages

1. `/docs/architecture/`
2. `/tutorials/authoring/`
3. `/tutorials/animations/`
4. `/docs/getting-started/`

### Most improved by the last implementation pass

1. `/docs/architecture/`
2. `/tutorials/authoring/`
3. `/tutorials/animations/`
4. `/docs/animation-model/`

### Pages with the most room left

1. `/demos/`
2. `/tutorials/rigging-and-control/`
3. `/tutorials/agent-face/`
4. `/docs/renderer-data-model/`
5. `/docs/deployment-model/`

The plan document that follows translates these findings into a concrete next-phase improvement program.
