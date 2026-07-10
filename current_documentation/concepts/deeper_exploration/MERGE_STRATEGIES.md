# Multi-Writer Paths and Graph Composition

<!-- tags: family=reference; type=reference; topics=composition,merge,conflicts -->

> **Last updated:** 2026-07-10

## Purpose

Several producers can target the same typed path: a rig graph and a pose
graph, two program graphs, or a graph and a live input writer. This page
describes how the runtime resolves that today and how multi-writer paths
should be designed.

## How Writes Compose

The runtime composes every registered graph (rig, pose, playing programs)
into the **one behavior graph** of its Arora device. Within that composed
graph:

- **Routing is path identity.** A producer writes a store path; any consumer
  with an `input` node on the same path reads it on the next tick. Nothing
  else routes values between sub-graphs.
- **Output collisions are last-writer-wins.** When two `output` nodes target
  the same path, evaluation order decides, and the runtime logs a warning
  naming both producers. Collisions are treated as a rig-design smell rather
  than a configuration to tune.
- **Intentional mixing is a graph node.** When two sources should genuinely
  combine (sum, average, weighted blend), that combination is expressed as an
  explicit node in the graph — an add/blend node whose inputs are the two
  producers — so the mixing rule is visible in the authored graph rather than
  hidden in runtime configuration. Automatic insertion of a combiner during
  composition is planned for bundles that need it (VIZ-58).

## Designing Multi-Writer Paths

- Prefer **one owner per path**; give intermediate producers their own paths
  and mix them explicitly downstream.
- When layering is intended (e.g., offsets on a base pose), author the
  layering node in the graph. The blend rule is part of the rig design, not a
  runtime setting.
- Watch the collision warnings in the console; they indicate either a missing
  combiner node or an unintended overlap.

## Live Inputs

Writes from outside the graph (UI controls, animation clip playback, network
sync) go through the same store. They compose with graph outputs by the same
rule: the store holds one value per path, and the last write before a tick is
what the graph reads.
