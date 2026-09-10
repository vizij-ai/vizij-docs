<!-- tags: family=guidebook; type=guidebook-bucket; editorial_status=completed; publication_status=planned; topics=guidebook,deploy,standalone,hardware -->

> **Last updated:** 2026-09-10
> **Purpose:** frame deployment as the real destination of the guidebook journey

# Deploy

`Deploy` is the final bucket.

This bucket treats deployment as the real destination of the guidebook, whether the reader is taking the fast existing-face route or the deeper customization route.

## Process Position

| Axis | Position |
| --- | --- |
| Bucket chain | Previous: [Integrate](../integrate/README.md)<br>Current: [Deploy](README.md)<br>Next: End of guidebook route |
| Depth ladder in this bucket | Surface: [Easiest Standalone Deployment](easiest-standalone-deployment.md)<br>Fundamentals: [Operator and Deployment Model](operator-and-deployment-model.md), [Deployment Checks and Recovery](deployment-checks-and-recovery.md)<br>Advanced: [Hardware, ROS, and Multi-Screen Topologies](hardware-ros-and-multi-screen-topologies.md), [Swap the Speech Provider](swap-the-speech-provider.md), [Bring Your Own Visemes](bring-your-own-visemes.md) |
| Reference bridges | [Animation, Integration, and Deployment Reference](../reference/animation-integration-and-deployment-reference.md)<br>[Validation Checkpoints](../support/validation-checkpoints.md)<br>[Troubleshooting Matrix](../support/troubleshooting-matrix.md) |
| Route relationship | Final bucket in both maintained routes; usually closes with validation, operator, or topology follow-up rather than another bucket jump. |

## Bucket Overview

This bucket should help a reader:

1. get to the cleanest first real deployment,
2. understand what the deployed system consists of,
3. validate whether the deployment is actually successful,
4. reason about deeper operational and topology choices when needed.

## Depth Ladder

### Surface

**Teaching objective:** deliver the easiest believable first deployment path.

**Misunderstandings to prevent:**

1. thinking deployment is an optional afterthought,
2. confusing a demo or local integration with a real deployed result,
3. assuming the first deployment path must already cover every hardware or topology case.

**Often useful content:**

1. step-by-step tutorials,
2. screenshots,
3. checklists,
4. validation checks,
5. next-step notes.

### Fundamentals

**Teaching objective:** explain the operator model, packaging expectations, control surfaces, validation, and recovery basics that make deployment reliable.

**Misunderstandings to prevent:**

1. not knowing what needs to be present for a deployment to count,
2. confusing runtime interaction with deployment operation,
3. skipping validation and recovery planning.

**Often useful content:**

1. concept explainers,
2. diagrams,
3. screenshots,
4. FAQs,
5. checklists,
6. troubleshooting and recovery guidance.

### Advanced

**Teaching objective:** support deeper deployment paths involving hardware, ROS, multi-screen setups, and more complex topology decisions.

**Misunderstandings to prevent:**

1. assuming advanced deployment is just the surface path with more steps,
2. not seeing the tradeoffs between topology choices,
3. missing the role of operator and recovery complexity in deeper deployments.

**Often useful content:**

1. comparisons,
2. diagrams,
3. timelines or workflow maps,
4. troubleshooting,
5. failure-state examples,
6. implementation anchors.

## Bucket Modules

| Module | Depth | Module type | Teaching focus |
| --- | --- | --- | --- |
| [Easiest Standalone Deployment](easiest-standalone-deployment.md) | Surface | walkthrough | deliver the first real deployment path |
| [Operator and Deployment Model](operator-and-deployment-model.md) | Fundamentals | concept page | explain what the deployed system consists of |
| [Deployment Checks and Recovery](deployment-checks-and-recovery.md) | Fundamentals | operational guide | explain success criteria and recovery basics |
| [Hardware, ROS, and Multi-Screen Topologies](hardware-ros-and-multi-screen-topologies.md) | Advanced | comparison | teach deeper deployment patterns and tradeoffs |
| [Swap the Speech Provider](swap-the-speech-provider.md) | Advanced | operational guide | choose or write the text-to-speech behind a deployed face's `say` |
| [Bring Your Own Visemes](bring-your-own-visemes.md) | Advanced | comparison | feed the mouth from a lipsync source outside the device |

## Recommended Teaching Approaches

1. Treat validation as part of deployment, not a separate appendix.
2. Use checklists and troubleshooting when operational reliability is the point.
3. Keep the first deployment path focused and believable before branching into advanced topology choices.
4. Tie deeper deployment pages back to the same artifacts and integration surfaces readers saw earlier.

## Cross-Links

1. [Guidebook Learning Model](../learning-model.md)
2. [Guidebook Content Model Reference](../content-model-reference.md)
3. [Guidebook Module Inventory](../module_inventory-reference.md)
4. [Integrate](../integrate/README.md)
5. [Guidebook Support](../support/README.md)
6. [Animation, Integration, and Deployment Reference](../reference/animation-integration-and-deployment-reference.md)
7. [Guidebook Assets](../assets/README.md)
