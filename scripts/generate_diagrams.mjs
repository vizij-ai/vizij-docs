import fs from 'fs';
import path from 'path';

// Ensure the Google API Key is set in the environment
// e.g., export GOOGLE_API_KEY="your-api-key-here"
const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  console.error("❌ ERROR: Please set the GOOGLE_API_KEY environment variable.");
  console.error("Usage: GOOGLE_API_KEY='your_key' node generate_diagrams.mjs");
  process.exit(1);
}

// Using the Google AI Studio base URL
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta`;

async function getImagenEndpoint() {
  console.log("🔍 Fetching available models to find correct Imagen endpoint...");
  try {
    const response = await fetch(`${BASE_URL}/models?key=${API_KEY}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }
    
    // Look for models with 'imagen' in the name
    const imagenModels = data.models.filter(m => m.name.includes("imagen") || m.name.includes("image-generation"));
    
    if (imagenModels.length === 0) {
      throw new Error("No Imagen models found available for this API key.");
    }
    
    // Pick the most recent imagen model (usually the first one returned or the one containing 3.0)
    const model = imagenModels.find(m => m.name.includes("3.0")) || imagenModels[0];
    const supportedMethods = model.supportedGenerationMethods || [];
    
    // Determine the correct RPC method (usually predict or generateImages)
    const method = supportedMethods.includes("predict") ? "predict" : supportedMethods.includes("generateImages") ? "generateImages" : supportedMethods[0] || "predict";
    
    console.log(`✅ Found model: ${model.name}`);
    console.log(`✅ Using method: ${method}`);
    
    return `${BASE_URL}/${model.name}:${method}?key=${API_KEY}`;
  } catch (error) {
    console.error("❌ Failed to query models:", error);
    process.exit(1);
  }
}

// Define the core diagrams we need to generate across the guidebook
const DIAGRAMS = [
  {
    name: "operator-topology-diagram",
    intent: "Show how a human operator puppeteers a Vizij runtime face by controlling a web dashboard that communicates via a local WebSocket server.",
    details: "Context: The system relies on a central 'WebSocket Server'. A 'Human Operator' checks a 'Web Control Panel' (built-in) or a 'Custom Client'. Both the panel and client send data through the WebSocket server, which then streams updates to the 'Vizij Runtime' (the face application). Structure: Operator -> Panel/Client -> Server -> Runtime."
  },
  {
    name: "path-anatomy-diagram",
    intent: "Show the anatomy of a Vizij control path, breaking it down into face ID, category, channel, track, and attribute parts.",
    details: "Context: A path string looks like 'rig/{face}/{category}/{channel}/{track}/{attribute}'. The diagram should break this string visually into its parts: 'Category' (e.g. standard/poses), 'Channel' (e.g. left_eye/smile), 'Track' (e.g. pos/weight), 'Attribute' (e.g. x/y/z)."
  },
  {
    name: "runtime-semantics-diagram",
    intent: "Show the semantic chain from app or hook through staged input, orchestrator evaluation, renderer output, and finally visible face behavior.",
    details: "Context: This is a linear evaluation pipeline. 1. App/Hook (writes path) -> 2. Staged Input (un-evaluated) -> 3. Orchestrator (step advance) -> 4. Controllers (merge values) -> 5. Renderer Output (ready to draw) -> 6. Visible Face (success)."
  },
  {
    name: "troubleshooting-escalation-flow",
    intent: "Show a small branching flowchart for troubleshooting decisions: retry, simplify the route, switch to conceptual recovery, or escalate into deeper debugging.",
    details: "Context: When a failure occurs, the operator makes a decision. Branch 1: 'Retry' (simple glitch). Branch 2: 'Simplify the route' (remove complex custom logic). Branch 3: 'Conceptual recovery' (re-read fundamentals). Branch 4: 'Escalate to deep debugging' (operator tools). The flow should show escalating severity."
  },
  {
    name: "vizij-builder-spine",
    intent: "Show the 4-stage builder journey from left to right: Experience (Hello Face), Customize (Authoring Tool), Integrate (Player Shell), and Deploy (Standalone App).",
    details: "Context: This is a maintained, linear learning route. Left to right: 'Experience' (fast first proof) -> 'Customize' (rig/pose/animate) -> 'Integrate' (React components) -> 'Deploy' (operator endpoint / standalone)."
  },
  {
    name: "system-mental-model",
    intent: "Show the relationships between four main system components: authored face assets, runtime shell, control contracts, and integration/deployment surfaces.",
    details: "Context: 'Authored Face Asset' (metadata/GLD) feeds into the 'Runtime Shell' (coordination). The Runtime Shell is driven by 'Control Contracts' (paths/inputs) and is wrapped by 'Application / Deployment Surfaces' (the UI the user or operator actually sees)."
  },
  {
    name: "customization-pipeline-map",
    intent: "Show the advanced authoring route from source asset through rigging, authored behavior, validation, and export-ready outputs.",
    details: "Context: A strict 5-stage pipeline: 1. Supported Base / Imported Asset -> 2. Controllable Structure (rigging) -> 3. Authored Semantic States & Motion (poses/animations) -> 4. Export Validation -> 5. Bundled Artifact (handoff to Integrate)."
  },
  {
    name: "integration-shell-anatomy",
    intent: "Show VizijAssetBundle, VizijRuntimeProvider, VizijRuntimeFace, and app-specific hooks or panels as one nested, repeatable player shell structure.",
    details: "Context: Shows the React embedding hierarchy. The core data is 'VizijAssetBundle', which is passed to the shell 'VizijRuntimeProvider'. The Provider wraps the 'VizijRuntimeFace' (the 3D renderer) and also connects to 'App-owned Hooks/UI Controls' which steer the face."
  }
];

// The three established 2D Line-Art aesthetic rules
const STYLES = {
  "light": "Aesthetic: Light mode, clean white background. Nodes are drawn as simple rounded rectangles with thin, crisp outlines in pastel teal and warm orange. Connections are simple, elegant 2D lines. Style is exceptionally clean, flat line-art, highly readable, focusing only on the necessary connections without 3D effects or heavy shading.",
  "dark": "Aesthetic: Dark mode, dark charcoal gray background. Nodes are drawn as thin, un-filled rounded rectangle outlines using muted teal, orange, and golden yellow colors. Icons are simple thick line-art. Connections are clean, thin lines. Style is flat wireframe, similar to a modern developer dashboard, extremely sparse and clean.",
  "organic": "Aesthetic: Playful Organic Wireframe. Dark charcoal background. Nodes are drawn as vibrant, slightly organic (hand-drawn whiteboard style) un-filled shapes using bright neon pink, lime green, and cyan outlines. Connections are slightly wavy or dashed thin lines, adding a creative, brainstorm-like feel. Style is pure flat line-art, highly readable but distinctly creative and less rigid than a standard corporate diagram."
};

// Target directory inside the docs workspace
const OUTPUT_DIR = path.resolve('../current_documentation/guidebook/assets/generated_diagrams');

async function generateDiagram(endpoint, diagramName, styleName, promptText) {
  console.log(`Generating [${diagramName}] in [${styleName}] style...`);
  
  const payload = {
    instances: [{ prompt: promptText }],
    parameters: {
      sampleCount: 1,
      aspectRatio: "16:9" // Diagrams are typically best in widescreen formats
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error for ${diagramName}_${styleName}: ${response.status} ${response.statusText}`);
      console.error(errorText);
      return;
    }

    const data = await response.json();
    const base64Image = data.predictions?.[0]?.bytesBase64Encoded || data.predictions?.[0]?.bytesBase64;
    
    if (base64Image) {
      const buffer = Buffer.from(base64Image, 'base64');
      const filename = `${diagramName}_${styleName}.png`;
      const filepath = path.join(OUTPUT_DIR, filename);
      fs.writeFileSync(filepath, buffer);
      console.log(`✅ Saved ${filepath}`);
    } else {
      console.error(`⚠️ No image data returned for ${diagramName}_${styleName}. Raw response:`, JSON.stringify(data).slice(0, 500));
    }
  } catch (error) {
    console.error(`❌ Network/Processing Error for ${diagramName}_${styleName}:`, error);
  }
}

async function run() {
  console.log("=========================================");
  console.log("🖼️  Vizij Guidebook Diagram Generator");
  console.log("=========================================\n");

  const endpoint = await getImagenEndpoint();

  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log(`Creating output directory: ${OUTPUT_DIR}`);
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const diagram of DIAGRAMS) {
    console.log(`\n--- Starting set: ${diagram.name} ---`);
    for (const [styleName, stylePrompt] of Object.entries(STYLES)) {
      const fullPrompt = `A minimalist 2D line-art technical diagram. Communication Intent: ${diagram.intent} Details for context (not a strict checklist, but to ensure correct structural relationships): ${diagram.details} ${stylePrompt}`;
      
      await generateDiagram(endpoint, diagram.name, styleName, fullPrompt);
      
      // Pause to respect API rate limits (AI Studio often limits burst requests)
      await new Promise(r => setTimeout(r, 4500));
    }
  }
  
  console.log("\n✅ Generation loop complete!");
}

run();
