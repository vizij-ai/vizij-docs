# Proposal: Speech + Viseme + Conversation Enablement
<!-- tags: family=project; type=proposal; project_status=proposal; topics=runtime,speech,viseme,conversation,audio -->
> **Last updated:** 2026-03-31

> **Related documents:** Plan (not yet written) · Reference (not yet written) · [Runtime Summary](../summary.md)

## Context

The near-term AV need is narrower and more concrete than a generic full audio/video platform. The current public path already depends on conversation and voice-facing runtime behavior in places like `tutorial-agent-face` and `vizij-showcase`, and the main gap is making speech playback, viseme driving, and conversation-linked runtime inputs feel like a clean, deployable part of Vizij rather than ad-hoc demo logic.

Broader Rust-centric audio/video feature extraction may still matter later, but it should not be the primary framing for the current phase.

## Goals

- **Speech Provider Abstraction**: Define a provider-based interface for speech playback and viseme event ingestion so demos and apps are not hard-coupled to one vendor or one app.
- **Viseme Runtime Integration**: Drive viseme channels through the orchestrator/runtime path using stable standard-input or rig-channel conventions.
- **Conversation Enablement**: Support live conversation and speech-rich demos as real maintained surfaces rather than special-case prototypes.
- **Deployable Behavior**: Keep the speech/viseme line aligned with the browser and standalone deployment story where feasible.

## Proposed Strategy

- **Provider-first near-term architecture**
  - Keep the near-term implementation centered on provider-based runtime integration in the web/runtime layer.
  - Reuse `@vizij/runtime-react` input-driver patterns and orchestrator staging rather than introducing a broad new runtime subsystem first.
- **Speech / viseme routing**
  - Map speech/viseme events into rig inputs through orchestrator input staging.
  - Keep mappings explicit and testable for maintained demo and deployment surfaces.
- **Conversation surfaces**
  - Treat `tutorial-agent-face` and similar conversation-linked apps as the proving ground for this line.
- **Broader AV later**
  - Keep larger Rust audio/video feature extraction as a later-horizon expansion once the current speech/viseme path is settled.

## Phased Approach (Current)

1. **Speech provider abstraction**
   - Define the provider API for speech playback and viseme events.
   - Keep app-level UI and runtime components decoupled from specific providers.
2. **Viseme routing and timing**
   - Route viseme events into the orchestrator/runtime path with clear timing and diagnostics.
   - Validate behavior in maintained tutorial/demo surfaces.
3. **Conversation-facing enablement**
   - Support live conversation flows and deployment-friendly demos without forcing the whole roadmap through a broad AV-core rewrite.
4. **Later-horizon AV expansion**
   - Revisit broader audio/video feature extraction, video-derived inputs, and Rust-heavy AV architecture after the current public-system phase.

## Risks & Unknowns

- **Sync quality**: Speech playback and viseme timing must be good enough for public-facing demos and deployment stories.
- **Provider variability**: Different backends may expose different timing and event fidelity.
- **Scope drift**: It is easy for this line to collapse back into an overly broad “full Rust AV platform” project before the near-term speech/viseme needs are solved.

## Success Metrics

- **Deployable speech/viseme flow**: Maintained Vizij demos can drive convincing speech-linked face behavior through the orchestrator/runtime path.
- **Clean integration**: Speech and viseme routing fit the runtime/provider model rather than living as app-local glue only.
- **Roadmap discipline**: The AV line stays framed around speech/viseme/conversation enablement now, while leaving room for broader later-horizon AV work.
