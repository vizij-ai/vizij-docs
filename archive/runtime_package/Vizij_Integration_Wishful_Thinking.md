

# Integrating Vizij into an existing React  application

To integrate Vizij into your existing React application, you’ll need to go through several steps to get things set up after installation

1. Context / Provider \- Give your code access to the Vizij World (state)  
2. Face Canvas Setup  
3. Animate your face

1. # Context / Provider Setup

You’ll need to wrap the page or layout where your face will render with a context provider so that you can access the Vizij World / state from within that page. 

```ts
export function FacePage() {
  const myVizijStore = useMemo(() => createVizijStore(), []);
  const prebind = useCallback((path: string) => path, []);

  return (
    <VizijContext.Provider value={myVizijStore}>
      <AnimationProvider animations={[]} autostart={false} prebind={prebind}>
        <VizijPage />
      </AnimationProvider>
    </VizijContext.Provider>
  );
}
```

2. # Face Canvas Setup

Add your face assets that you exported from Vizij tools into a publicly accessible folder so you can import them.

```ts
import faceGlb from "./face.glb";
import rigGraph from "./rig.graph.json";
import poseRigGraph from "./pose-rig.graph.json";
import poseRigConfig from "./pose-rig.config.json";

export function VizijPage() {
	const setValue = useVizijStore((state) => state.setValue);

	useEffect(()=>{
		if (eventTrigger){
			// Immediately sets value
			// Find your RIG_UUID in the rig inspector tool
			setValue(RIG_UUID, rigData)
}
}, [eventTrigger, rigData]
}
return (
	<div>
		<WishfulVizij face={faceGlb} rigs={rigGraph, poseRigGraph, poseRigConfig}/>
	</div>
)
```

In the above example, we left it open ended for what event you want to update based on. Below are some examples you could drop in.

## Listen to ROS Topics

## Listen to WebSocket Events

3. # Animate The Face

```ts
import faceGlb from "./face.glb";
import rigGraph from "./rig.graph.json";
import poseRigGraph from "./pose-rig.graph.json";
import poseRigConfig from "./pose-rig.config.json";

export function VizijPage() {
	const animateValue = useVizijStore((state) => state.animateValue);

	useEffect(()=>{
		if (eventTrigger){
			// Animates value to be set over 2000 ms
			// Find your RIG_UUID in the rig inspector tool
			animateValue(RIG_UUID, rigData, 2000)
}
}, [eventTrigger, rigData]
}
return (
	<div>
		<WishfulVizij face={faceGlb} rigs={rigGraph, poseRigGraph, poseRigConfig}/>
	</div>
)
```

