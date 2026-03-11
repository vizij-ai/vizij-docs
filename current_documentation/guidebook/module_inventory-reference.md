<!-- tags: type=reference; status=in_progress; topics=guidebook,inventory,documentation,matrix -->

> **Last updated:** 2026-03-11
> **Purpose:** map planned guidebook modules to bucket, depth, teaching objective, likely content forms, implementation anchors, and downstream outputs

# Guidebook Module Inventory

## 1. Status Legend

- `seeded`: created in the guidebook now
- `mapped`: source material identified, but guidebook module not written yet
- `planned`: target module agreed, source mapping still partial
- `written`: learner-facing module drafted in the guidebook now

## 2. Bucket Pages

| Bucket | Guidebook target | Teaching role | Common route role | Status |
| --- | --- | --- | --- | --- |
| Introduction | `introduction/README.md` | orient readers and route them into the right learning path | first stop in every route | `seeded` |
| Experience | `experience/README.md` | deliver the first embodied proof that Vizij is real | first hands-on stop | `seeded` |
| Control | `control/README.md` | explain how a visible face is manipulated and what the runtime is doing | bridge from seeing to understanding | `seeded` |
| Customize | `customize/README.md` | explain how readers make a face, asset, or behavior their own | optional middle stage for the customization route | `seeded` |
| Integrate | `integrate/README.md` | explain how a face becomes part of a player or application | required bridge to usable runtime surfaces | `seeded` |
| Deploy | `deploy/README.md` | frame deployment as the real end destination | final destination in both main routes | `seeded` |
| Support | `support/README.md` | provide reusable validation, recovery, and support guidance across the route | cross-cutting layer for every route stage | `seeded` |

## 3. Completed Wave-1 and Wave-2 Modules

| Module | Bucket | Depth | Status |
| --- | --- | --- | --- |
| [How To Use This Guidebook](introduction/how-to-use-this-guidebook.md) | Introduction | Surface | `written` |
| [Customization Concepts Primer](introduction/customization-concepts-primer.md) | Introduction | Fundamentals | `written` |
| [Hello Face Quickstart](experience/hello-face-quickstart.md) | Experience | Surface | `written` |
| [Paths and Standard Controls](control/paths-and-standard-controls.md) | Control | Fundamentals | `written` |
| [Control Surfaces and Configuration Layers](control/control-surfaces-and-configuration-layers.md) | Control | Fundamentals | `written` |
| [Minimal Web Player](integrate/minimal-web-player.md) | Integrate | Surface | `written` |
| [Easiest Standalone Deployment](deploy/easiest-standalone-deployment.md) | Deploy | Surface | `written` |
| [Existing Asset Sandbox](experience/existing-asset-sandbox.md) | Experience | Fundamentals | `written` |
| [Runtime Inputs and Semantics](control/runtime-inputs-and-semantics.md) | Control | Fundamentals | `written` |
| [Loading, Playback, and Embedding](integrate/loading-playback-and-embedding.md) | Integrate | Fundamentals | `written` |
| [Operator and Deployment Model](deploy/operator-and-deployment-model.md) | Deploy | Fundamentals | `written` |
| [Validation Checkpoints](support/validation-checkpoints.md) | Support | cross-cutting | `written` |
| [Troubleshooting Matrix](support/troubleshooting-matrix.md) | Support | cross-cutting | `written` |

## 4. Planned Bucket Modules

| Bucket | Depth | Module | Module type | Teaching objective | Likely useful content forms | Likely implementation anchors | Likely downstream projections | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Introduction | Surface | What Is Vizij? | concept page | explain what Vizij is, what it enables, and why a reader should care | framing, concept explainers, diagrams, related guidebook links | roadmap, architecture, public landing copy | docs hub, landing page, workshop orientation | `planned` |
| Introduction | Surface | [How To Use This Guidebook](introduction/how-to-use-this-guidebook.md) | decision guide | help readers choose a route and depth | framing, decision guide, comparison, workflow map | guidebook learning model | docs hub, getting-started pages | `written` |
| Introduction | Fundamentals | System Mental Model | concept page | explain how assets, runtime, control, customization, integration, and deployment relate | concept explainers, diagrams, glossary notes, implementation bridges | architecture docs, runtime docs | fundamentals docs, workshop bridge page | `planned` |
| Introduction | Fundamentals | [Customization Concepts Primer](introduction/customization-concepts-primer.md) | concept page | explain rigs, poses, animations, procedural programs, and exportable artifacts before the authoring branch | concept explainers, glossary notes, diagrams, implementation bridges | authoring docs, architecture primer, customize bucket docs | fundamentals docs, route bridge, workshop orientation | `written` |
| Introduction | Advanced | Architecture Bridge | reference bridge | connect the reader-facing teaching model to the real cross-repo implementation surfaces | implementation bridges, repo links, comparison, conceptual walkthrough | `vizij-docs/current_documentation/ARCHITECTURE.md`, repo-local docs | advanced docs, contributor orientation | `planned` |
| Experience | Surface | [Hello Face Quickstart](experience/hello-face-quickstart.md) | walkthrough | give the fastest convincing first interaction with an existing face | framing, sandbox links, screenshots, video clips, step-by-step tutorial, validation check | tutorial face app, runtime quickstart material | hello-face tutorial, workshop activity, demo route | `written` |
| Experience | Surface | Richer Interactive Example | demo page | show a richer first encounter without making it part of the main spine | framing, embedded demo, video clip, screenshots, next-step note | public demo surface, `tutorial-agent-face` when relevant | demos page, showcase, workshop teaser | `planned` |
| Experience | Fundamentals | [Existing Asset Sandbox](experience/existing-asset-sandbox.md) | concept page | explain what is prebuilt, what the reader is actually interacting with, and what the quick experience proves | concept explainers, screenshots, glossary notes, FAQ, implementation bridge | runtime quickstart, sample assets, tutorial docs | fundamentals docs, tutorial bridge | `written` |
| Experience | Advanced | Sample Asset Exploration | walkthrough | compare sample faces and show where the quick experience stops and deeper work begins | comparisons, screenshots, videos, guided lab, related guidebook links | sample assets, demo apps | advanced demos, workshop extension | `planned` |
| Control | Surface | First Control Interactions | walkthrough | teach obvious cause and effect through a small set of visible controls | screenshots, embedded demo, short video, step-by-step tutorial, validation check | hello-face examples, runtime interaction surfaces | tutorial, demo page, workshop activity | `planned` |
| Control | Fundamentals | [Paths and Standard Controls](control/paths-and-standard-controls.md) | concept page | teach the core control model and standard control vocabulary | concept explainers, diagrams, payload examples, glossary notes, implementation bridges | renderer and rigging reference, runtime path docs | docs reference, tutorial bridge | `written` |
| Control | Fundamentals | [Runtime Inputs and Semantics](control/runtime-inputs-and-semantics.md) | concept page | explain what inputs mean, what they write, and how visible behavior maps to runtime semantics | diagrams, payload examples, API examples, comparisons, implementation anchors | runtime docs, orchestrator and control surfaces | fundamentals docs, advanced tutorial bridge | `written` |
| Control | Fundamentals | [Control Surfaces and Configuration Layers](control/control-surfaces-and-configuration-layers.md) | concept page | explain the different control and configuration surfaces readers encounter and what each one is for | concept explainers, diagrams, comparisons, implementation bridges | runtime docs, authoring docs, bundle update logic, deployment control surfaces | fundamentals docs, route bridge, workshop concepts | `written` |
| Control | Advanced | Orchestration and Diagnostics | operational guide | teach richer control patterns, debugging, diagnostics, and more complex behavior shaping | conceptual walkthroughs, diagrams, payload examples, troubleshooting, failure-state examples | runtime diagnostics docs, richer demos | advanced docs, operator prep | `planned` |
| Customize | Surface | Tweak an Existing Face | walkthrough | give the lowest-friction customization success without forcing the full pipeline | screenshots, annotated screenshots, step-by-step tutorial, validation check, next-step note | authoring app, workshop material | starter customization tutorial, workshop activity | `planned` |
| Customize | Fundamentals | Import and Reference-Face Transfer | concept page | explain import flow, source assets, transfer, and what is or is not preserved | diagrams, screenshots, FAQ, workflow map, implementation bridge | authoring docs, import tracker, assets docs | fundamentals docs, authoring tutorial | `planned` |
| Customize | Fundamentals | Rigging | concept page | explain what rigging is in Vizij and how readers reason about it | concept explainers, diagrams, annotated screenshots, public tooling links | authoring docs, rigging reference, asset examples | authoring docs, workshop module | `planned` |
| Customize | Fundamentals | Poses | concept page | explain pose authoring and how visible changes are represented | screenshots, before/after pairs, step walkthroughs, implementation anchors | authoring docs, pose examples | authoring docs, workshop module | `planned` |
| Customize | Fundamentals | Animations | concept page | explain animation authoring and how animation fits the customization path | screenshots, video clips, workflow maps, implementation anchors | authoring docs, animation examples | authoring docs, advanced tutorial | `planned` |
| Customize | Fundamentals | Procedural Programs | concept page | explain authored procedural behavior and when it complements poses and animations | diagrams, code snippets, workflow maps, implementation bridges | authoring docs, graph/program docs | advanced authoring docs, workshop extension | `planned` |
| Customize | Fundamentals | Export | operational guide | explain what leaves authoring, what artifact is produced, and how it feeds later stages | config fragments, screenshots, checklists, validation checks | authoring docs, bundle/export docs | authoring docs, integration bridge | `planned` |
| Customize | Advanced | Deep Custom Pipeline | walkthrough | teach more from-scratch ownership across asset prep, rigging, authoring, and export | workflow maps, screenshots, videos, troubleshooting, implementation anchors | authoring docs, assets repo, deeper workshop docs | advanced customization tutorial | `planned` |
| Integrate | Surface | [Minimal Web Player](integrate/minimal-web-player.md) | walkthrough | get a face loaded into the smallest useful player surface quickly | step-by-step tutorial, screenshots, command examples, validation checks | player demo, integration examples | quickstart docs, workshop activity | `written` |
| Integrate | Fundamentals | [Loading, Playback, and Embedding](integrate/loading-playback-and-embedding.md) | concept page | explain the basic mechanics of integration and where the player fits | concept explainers, diagrams, code snippets, config fragments, implementation bridges | player docs, runtime docs, integration examples | fundamentals docs, integration tutorial | `written` |
| Integrate | Fundamentals | Application Integration Patterns | comparison | explain common simple embedding patterns and when to use each | comparisons, diagrams, code snippets, package links, related guidebook links | package docs, demo apps | docs reference, app-builder guide | `planned` |
| Integrate | Advanced | API-Backed Interactive Application | walkthrough | teach how a richer API-backed application pattern is actually assembled | code snippets, API examples, diagrams, screenshots, troubleshooting, repo links | `tutorial-agent-face`, API examples, public tooling links | advanced tutorial, showcase implementation doc | `planned` |
| Integrate | Advanced | Rich Interactive Applications | operational guide | teach broader advanced integration patterns beyond the minimal player | conceptual walkthroughs, comparisons, code snippets, implementation anchors | richer apps, package docs | advanced integration docs | `planned` |
| Deploy | Surface | [Easiest Standalone Deployment](deploy/easiest-standalone-deployment.md) | walkthrough | get an existing face deployed through the cleanest practical path | step-by-step tutorial, screenshots, checklists, validation checks | standalone app docs, deployment quickstarts | deploy tutorial, workshop activity | `written` |
| Deploy | Fundamentals | [Operator and Deployment Model](deploy/operator-and-deployment-model.md) | concept page | explain what the deployed system consists of and how operators interact with it | concept explainers, diagrams, screenshots, FAQ, implementation bridges | runtime summary, standalone docs, operator notes | deployment docs, facilitator bridge | `written` |
| Deploy | Fundamentals | Deployment Checks and Recovery | operational guide | explain what must be validated before calling a deployment successful and how to recover common failures | checklists, troubleshooting, failure-state examples, recovery guidance | support docs, standalone troubleshooting | deployment support docs, operator handoff | `planned` |
| Deploy | Advanced | Hardware, ROS, and Multi-Screen Topologies | comparison | teach deeper deployment paths and their tradeoffs | comparisons, diagrams, timelines, troubleshooting, implementation anchors | runtime deployment plans, ROS docs, multi-screen docs | advanced deployment docs | `planned` |

## 5. Cross-Cutting Reusable Modules

| Module | Module type | Teaching objective | Likely useful content forms | Likely implementation anchors | Likely downstream projections | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Runtime Quickstart | reference bridge | provide compact runtime setup and validation reference usable across experience and integrate pages | command examples, checklists, config fragments, implementation bridges | `reference/runtime-quickstart-reference.md`, runtime quickstart handouts | tutorials, participant packets, fundamentals sidebars | `seeded` |
| Renderer and Rigging Reference | reference bridge | provide a concise control and rigging bridge for control and customize modules | diagrams, glossary notes, screenshots, implementation bridges | `reference/renderer-and-rigging-reference.md` | docs sidebars, workshop handouts | `seeded` |
| Animation, Integration, and Deployment Reference | reference bridge | provide compact reference material that bridges later-stage workflow pages | code snippets, checklists, comparisons, implementation bridges | `reference/animation-integration-and-deployment-reference.md` | later-stage tutorials, facilitator notes | `seeded` |
| [Validation Checkpoints](support/validation-checkpoints.md) | support guide | define reusable success checks across tutorials and operational guides | validation checks, checklists, troubleshooting, related guidebook links | support docs, workshop activity checks | tutorials, workshops, operator docs | `written` |
| [Troubleshooting Matrix](support/troubleshooting-matrix.md) | support guide | collect common failure patterns and likely fixes across buckets | troubleshooting, failure-state examples, recovery guidance, implementation anchors | support docs, deployment notes | support pages, workshops, facilitator fallback | `written` |
| Glossary and Terminology Bridge | support guide | stabilize vocabulary across public docs, tutorials, and workshops | glossary notes, FAQs, related guidebook links | support docs, concepts material | docs glossaries, tooltips, handouts | `planned` |
| Media Intake and Usage Guide | operational guide | classify screenshots and videos and explain how evergreen media should be used | workflow map, checklists, public tooling links, related guidebook links | assets intake, backlog media | doc production, workshop prep, website media planning | `planned` |

## 6. Inventory Rules

1. Every planned module should belong to one primary bucket and one primary depth.
2. A module may use any mix of content forms required to teach the concept accurately.
3. Module type describes the reader-facing role of the page, not the implementation surface it eventually appears on.
4. Downstream outputs should be treated as projections of these modules, not separate source material that drifts on its own.
