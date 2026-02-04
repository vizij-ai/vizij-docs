# Vizij Conceptual Walkthrough

<!-- tags: status=reference; topics=concepts,workflow,rigging,graphs,poses -->

This walkthrough builds the Vizij mental model step‑by‑step. The goal is to
show how a face evolves into a controllable runtime system by stacking layers:
face → animatables → rig → standard inputs → poses → pose graph(s) → runtime.

## 1. Start With a Face

The face is the visual asset and its hierarchy. It contains all the visual
parts and their animatable properties.

```mermaid
flowchart LR
  subgraph Asset["Asset Layer"]
    Face[Face Asset<br/>GLB + hierarchy]
  end
```

## 2. Discover Animatables

Animatables are the renderer‑level values that can be driven. They are the raw
control surface exposed by the face.

```mermaid
flowchart LR
  subgraph Asset["Asset Layer"]
    Face[Face Asset]
    Animatables[Animatables<br/>all controllable values]
  end
  Face --> Animatables
```

## 3. Build a Rig

A rig is a graph that maps inputs into typed‑path outputs, with the final layer
writing to animatables. Rigs can be layered.

```mermaid
flowchart LR
  subgraph Asset["Asset Layer"]
    Animatables[Animatables]
  end
  subgraph Control["Control Layer"]
    Rig[Rig Graph]
  end
  Animatables --> Rig
```

```mermaid
flowchart LR
  subgraph ToyRig["Toy Rig Example (Custom Inputs)"]
    InY[/custom/mouth/pos/y/]
    ClampY[Clamp]
    Join[Join XYZ]
    OutAnim[mouth_position animatable]
    InY -.-> ClampY
    ClampY -.-> Join
    InX[/custom/mouth/pos/x/] -.-> Join
    InZ[/custom/mouth/pos/z/] -.-> Join
    Join -.-> OutAnim
  end
```

## 4. Map Standard Inputs

Standard inputs are a portable control schema. Mapping them into the rig makes
the rig reusable across faces.

```mermaid
flowchart LR
  subgraph Asset["Asset Layer"]
    Animatables[Animatables]
  end
  Std[Standard Inputs<br/>portable schema]
  subgraph Control["Control Layer"]
    Rig[Rig Graph]
  end
  Std --> Rig
  Animatables --> Rig
```

```mermaid
flowchart LR
  subgraph ToyRigStd["Toy Standard Mapping Example"]
    StdY[/standard/mouth/pos/y/]
    RemapY[Remap]
    CustomY[/custom/mouth/pos/y/]
    StdY -.-> RemapY
    RemapY -.-> CustomY
  end
```

## 5. Define Poses

Poses are named target value sets. Each pose has a weight; weights blend toward
those targets relative to neutral inputs.

```mermaid
flowchart LR
  subgraph PoseLayer["Pose Layer"]
    Poses[Pose Definitions<br/>target values + weights]
  end
```

```mermaid
flowchart LR
  subgraph PoseDetail["Pose Targets + Neutral"]
    Neutral[Neutral Inputs]
    Happy[Happy Pose Targets]
    Sad[Sad Pose Targets]
    Weights[Pose Weights]
    Blend[Blend to Targets]
    Neutral --> Blend
    Happy --> Blend
    Sad --> Blend
    Weights -.-> Blend
  end
```

## 6. Blend Poses With Pose Graphs

Pose graphs combine pose weights and neutral values into concrete inputs that
feed the rig.

```mermaid
flowchart LR
  subgraph Control["Control Layer"]
    Emotions[Emotion Pose Graph]
    Visemes[Viseme Pose Graph]
    Rig[Rig Graph]
  end
  Emotions --> Rig
  Visemes --> Rig
```

## 7. Run in the Runtime

The runtime stages live inputs, executes graphs/animations via the orchestrator,
and applies outputs to the renderer.

```mermaid
flowchart LR
  subgraph Runtime["Runtime Layer"]
    Inputs[Live Inputs]
    subgraph Orchestrator["Orchestrator"]
      Rig[Rig Graphs]
      Anims[Animations]
    end
    Renderer[Renderer]
  end
  Inputs -.-> Orchestrator
  Orchestrator -.-> Renderer
```

## 8. The Full Stack (Expanded Structure)

```mermaid
flowchart LR
  subgraph Asset["Asset Layer"]
    Face[Face Asset]
    Animatables[Animatables]
  end

  Std[Standard Inputs]
  Poses[Pose Definitions]
  subgraph Runtime["Runtime Layer"]
    Inputs[Live Inputs]
    subgraph Orchestrator["Orchestrator"]
      Rig[Rig Graphs]
      PoseGraph[Pose Graphs]
      Anims[Animations]
    end
    Renderer[Renderer]
  end

  Face --> Animatables
  Animatables --> Rig
  Std --> Rig
  Poses --> PoseGraph

  Inputs -.-> Orchestrator
  Orchestrator -.-> Renderer
```

This diagram is intentionally layered: each block builds on the previous one,
and the runtime ties all blocks together into a single, executable system.
