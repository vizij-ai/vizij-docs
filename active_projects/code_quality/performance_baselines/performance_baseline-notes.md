# Profiling the Vizij Rust Core and WASM Integration

Profiling a layered system like Vizij requires a staged approach. We want to measure performance at multiple integration levels – from raw Rust logic, to WebAssembly (WASM) execution outside the browser, and finally within the full browser environment. Below is a best-practice strategy to build a profiling pipeline for Vizij’s animation engine, node graph evaluation, and orchestrator, with tool recommendations and methodology at each stage.

## Early results: immediate optimization targets
- Graph runtime: flat cold vs amortized costs even on small graphs imply we re-do setup per tick; cache a compiled execution plan (topo order, port indices) and reuse value buffers to avoid per-step allocations/hash lookups. Replace string/TypedPath lookups with pre-indexed slots and small-vector storage; avoid cloning GraphSpec/Value each tick. Profile hotspots (topology, dispatch, hashing) with perf/pprof to confirm.
- Large graph scaling: 50-block kitchen ~10 ms and 500-block ~0.7 s suggest non-linear overhead; investigate quadratic behavior from hash maps or repeated path parsing. Switch to preallocated Vec-backed structures and ahash/fxhash with stable seeds; pre-resolve edge bindings at load time.
- Animation: cold >> amortized indicates setup dominates; precompute interpolation tables and path bindings, reuse scratch buffers, and keep track/key storage contiguous. Amortized times grow linearly with track count—ensure per-track allocations are eliminated and consider SIMD for scalar/vec interpolation.
- Orchestrator: amortized 20b blend ~0.58 ms and merged two-graph case ~1.4 ms; likely costs are blackboard staging and animation->graph copies. Precompute blackboard slot ids for subscribed paths, reuse write buffers, and batch animation writes directly into graph inputs to cut hashing/copy overhead. Confirm split of time across animation update vs graph eval vs blackboard merge with perf/pprof.
- Cross-cutting: add optional arena/scratch allocators for transient buffers; keep per-benchmark warm runs to separate cold-start effects; retain sample sizes that balance statistical confidence with run time.

## Stage 1: Profiling Raw Rust “Step” Performance

The first step is to benchmark the core Rust algorithms in isolation, measuring the cost of a single step (e.g. one animation frame update, one full node graph evaluation, or one orchestrator tick) in a native environment. This gives a baseline for how fast the logic runs without any WASM or JS overhead.

Use Rust Benchmarks: Leverage Rust’s benchmarking frameworks to measure execution time of critical functions. A popular choice is Criterion.rs, a statistics-driven microbenchmarking library. Criterion lets you write benchmarks that run the “step” function repeatedly and provides high-confidence timing results (with statistical analysis to account for noise). For example, you might write a benchmark that calls the graph evaluation function 10,000 times and measures the average time per call. Criterion’s output includes averages, variances, and even generates charts, helping ensure your measurements are reliable.

Instrument Timing in Code: In addition to formal benchmarks, you can instrument the Rust code to measure durations of key operations. Using std::time::Instant to time sections of code in debug builds is straightforward, though a more structured approach is to use the tracing crate. With tracing, you can add spans around operations (e.g. mark the start/end of an animation tick or a graph evaluation) and collect timing data. The #[instrument] attribute from tracing can automatically create spans for functions, and with an appropriate subscriber you can record how long each span takes. There are even tracing layers (like tracing-profile) that specifically record timing information in the span trace. This helps profile nested operations without too much manual timing code.

Focus on Whole-Step Measurements: It’s usually most effective to measure the macro-level performance – i.e. the entire operation of evaluating a graph or advancing the animation by one tick – rather than obsessing over every micro-operation. A micro-benchmark targets a small function or single node in isolation, whereas a macro-benchmark measures a larger subsystem or whole frame update. In this context, measuring each node’s cost individually (micro-level) is often not necessary initially; instead, profile the overall cost of a full graph evaluation or animation frame (macro-level) to see total impact. Macro benchmarks reveal the performance of the system under realistic conditions. If a particular node type is suspected to be a hotspot, you can still drill down later with a focused micro-benchmark on that node’s function, but start with end-to-end timing of major steps.

Benchmark Orchestrator Steps Separately: The orchestrator coordinates graph and animation updates. You should create a benchmark for the orchestrator’s “step” function as well, to measure how long an orchestration cycle takes in Rust. This can be done with dummy workloads (for instance, an orchestrator tick that processes an empty graph and no animations, to measure baseline overhead) and with real workloads (a graph of N nodes and M animations). Comparing these will let you see the orchestrator’s own overhead apart from the work it triggers.

Tooling for Rust Performance: In Rust, you have a rich set of tools to profile and analyze performance:

Criterion.rs for benchmarks: As mentioned, Criterion provides robust measurement and even supports generating flamegraphs when combined with profiling libraries. It’s ideal for measuring the runtime of “step” functions under various inputs. Criterion’s statistical approach ensures confidence that performance changes are real and not just noise.

tracing + tracing_subscriber: By instrumenting the code with tracing spans, you can record timing information for nested operations. For example, mark a span around each node evaluation or each subsystem update. A subscriber can log these or output a timeline. There are crates like tracing-profile or tracing-flame that can consume these spans and produce traces or flamegraphs of the execution.

pprof profiler crate: You can integrate the pprof crate to perform in-process sampling profiling. This can periodically sample the program’s call stack while running a workload and then generate a report or flamegraph. For instance, running a heavy graph computation for a few seconds under pprof can produce a flamegraph SVG highlighting which functions used the most CPU. In fact, pprof can be tied into Criterion as a custom profiler to automatically profile a benchmark run and output a flamegraph. This is extremely useful for identifying hotspots in the Rust code (e.g. if a specific math operation or iteration is dominating time). The flamegraph visualization helps pinpoint bottleneck functions (see example flamegraph below).

Example of a flamegraph output generated by profiling a Rust program’s execution. Wider blocks indicate functions consuming more CPU time, helping identify hotspots.

System profilers: Don’t forget OS-level profilers. On Linux, perf can sample a running Rust program (native) to produce flamegraphs or call graphs; on macOS, Instruments can do the same. These are useful if you want to double-check the results from in-process profilers. (If using these, compile the Rust code with debug symbols or at least with frame pointers for more readable results.)

Using the above tools, measure the baseline performance of Vizij’s core logic. For example, determine that “evaluating a node graph of X nodes takes Y milliseconds in native Rust” or “advancing a simple animation track is Z microseconds”. This will be the yardstick to compare against WASM and browser-layer results.

### Macro-Level vs. Micro-Level Measurements

When profiling, a common question is whether to measure individual components (fine-grained) or overall operations (coarse-grained). In the Vizij context: do we time each node’s execution cost, or just time the entire graph evaluation? Generally, start with macro-level profiling for a realistic performance picture:

Measure Whole Graphs/Animations: In complex systems, the overhead of orchestration, memory management, and interactions often only manifests when you run the entire operation. Profiling an entire graph evaluation (with many nodes) or a full animation playback loop captures aggregate costs including scheduling, data movement, etc. This gives an accurate view of whether the system can meet, say, frame-time budgets when doing real work.

When to Profile Individual Nodes: Drilling down to individual node costs can be useful if the macro profile indicates a bottleneck that might be isolated. For example, if a flamegraph or trace shows a particular node’s function consumes 40% of the time, you could write a micro-benchmark for that node’s logic specifically. But doing this for every node upfront is usually overkill. Use macro-level results to guide where micro-level focus is needed. It’s often sufficient to measure average or worst-case per-node cost indirectly (total time / number of nodes processed, for instance). If all nodes run similar logic, macro-level benchmarks already reflect their collective cost.

Avoid Distorting Performance: Inserting timing for every single node execution (e.g. using a high-resolution timer in each node) can itself add overhead and skew results. It’s better to use sampling profilers or strategically instrument a subset of frames/nodes to get fine-grained data without slowing everything. The goal is to identify if any node type or operation is disproportionately slow. If not, keep the focus on overall throughput (e.g. how many nodes/animations can we handle per frame).

In summary, prioritize macro-benchmarks (system-level performance) to ensure the whole engine meets performance targets, and use micro-benchmarks selectively for pinpointing specific slow routines. This approach balances detail with practical relevance.

## Stage 2: Profiling the WebAssembly Module in Isolation (Node.js)

Once the Rust core performance is characterized, the next layer is to evaluate the overhead of running the same logic in WebAssembly. By testing the compiled WASM outside the browser, we can measure the pure WASM execution cost (and any JS<->WASM interop overhead) without UI and browser noise. Node.js is a convenient environment for this:

Run WASM in Node: Vizij’s Rust core likely compiles to a .wasm with an accompanying JS loader (e.g. via wasm-bindgen). You can use Node.js to load and execute this module. For example, if you have a vizij_animation.wasm, you can do:

```
const fs = require('fs');
const bytes = fs.readFileSync('vizij_animation.wasm');
WebAssembly.instantiate(bytes).then(mod => {
    const { init_engine, update_frame, ... } = mod.instance.exports;
    // call exported functions here
});
```


Using Node’s WebAssembly API, you read the .wasm file and instantiate it, obtaining the exported functions. (If Vizij provides an NPM package like @vizij/animation-wasm, you can simply import that, and it likely handles loading under the hood, providing a JS wrapper for the WASM functions.)

Isolated WASM Benchmarking: In Node, call the WASM functions in a tight loop or use a small harness to measure performance. You can use console.time() in Node or the Performance API (require('perf_hooks').performance) to time how long a series of calls take. For instance, time 1000 iterations of the graph update function via WASM and compute average milliseconds per iteration. Because this is outside a browser, it removes variability from rendering or user interaction. It purely measures WASM execution speed plus the overhead of calling it from JavaScript.

Consider JIT Warm-up: Note that V8 (the engine in Node and Chrome) will JIT-compile the WebAssembly module on first use. Ensure you account for that by possibly discarding initial timings or explicitly waiting until the module is instantiated and warmed up. After that, WASM functions typically run at near-native speed, but there is still a cost to crossing the JS/WASM boundary for each call.

Use Node Profiling Tools if needed: Node can also produce CPU profiles. You could run the Node script with --cpu-prof or use Chrome DevTools to attach to the Node process for profiling. However, if the logic is pure computation, simply measuring time for a known number of iterations often suffices to get throughput. For a more detailed analysis, Node’s built-in profiler will show if time is spent in WASM functions vs. JavaScript glue code.

By comparing the Node/WASM timings to the native Rust timings, you’ll learn the WASM tax – how much slower the code runs under WebAssembly and how much overhead the JS-to-WASM calls introduce. For example, you might find that a graph evaluation that took 2ms in native Rust takes 3ms in Node/WASM. That 50% overhead might come from the inherent performance difference of WASM or from call overhead if you’re making many fine-grained calls. This insight can guide optimizations (such as batch-processing more work per call to amortize call overhead).

## Stage 3: Profiling In-Browser Integration

Finally, profile the system running in the actual browser environment. This measures any additional overhead from integration with the JS application, the rendering loop, and any framework (React) interactions (though React and rendering will be separately profiled, it's important to see the total picture of the core logic in context).

Use Browser Developer Tools: All major browsers have performance profilers built in. You can run the Vizij application or a test harness page and record a performance profile during some animation or graph-heavy activity. The profiler will show a timeline of CPU usage and can attribute time to functions (including WASM functions). Make sure to compile the WASM with debug symbols (include the WebAssembly name section) so that Rust function names appear in profiles instead of generic indices. This way, the DevTools profiler will display readable Rust function names in flame graphs or call charts, helping you identify which part of the Rust code is consuming time.

Measure Frame Times: If the goal is to maintain a frame budget (e.g. 60 FPS means ~16.7ms per frame for all work), examine the timeline to see how long each Vizij update cycle takes. You can place manual markers by using console.time("Vizij step") / console.timeEnd("Vizij step") in the JS glue code around the call that steps the animation/graph. These markers will show up in the DevTools timeline, giving a clear indication of how long each update took. This helps attribute any frame drops or jank to the core logic vs other factors. Alternatively, use the Performance API: mark times before and after the WASM call and record the difference.

Identify Integration Overhead: The browser profile will reveal if there are significant costs beyond the raw WASM execution. For instance, transferring large amounts of data between JS and WASM can incur overhead (marshaling costs or garbage collection if a lot of JS objects are created). If the orchestrator or engine calls back into JS (for callbacks or events), those show up too. Look for ** JavaScript-side overhead** such as the time spent preparing inputs for WASM or processing outputs. Also, measure if the overall workflow scales linearly with load. In a lightweight scenario, the core update might be, say, 1ms, but with many nodes/animations, is it still linear (e.g. 10x workload = ~10ms) or does overhead grow faster (indicating inefficiencies)?

Check for Browser-Specific Bottlenecks: Sometimes the same WASM in Node and in the browser might perform differently due to differences in the JS engines or thread limitations. For example, browsers might have to do more security checks or might not JIT as aggressively for WASM. Use the browser’s profiler to ensure there aren’t surprises like the WASM saturating the main thread and blocking other work, or hidden costs (like DOM interactions if any, though presumably the core logic is decoupled from DOM). If the Vizij core runs in a WebWorker, you’d profile that worker thread specifically.

By the end of Stage 3, you should have a full picture: e.g. “The Rust core logic takes 2ms natively, ~3ms in WASM, and in the browser we see ~4ms per frame including JS overhead”. Now the question is how to use this data to improve performance and where to focus.

# Generating Test Graphs and Animations for Scalability

A crucial part of performance evaluation is testing how the system behaves as the complexity grows. You should programmatically generate test cases of varying sizes and complexities for graphs and animations:

Parametric Graph Generation: Create a utility (either in Rust or as input data) that can generate a node graph with a specified number of nodes and connections. For example, you might generate a linear chain of N nodes, a balanced tree, or a random directed acyclic graph. Ensure the graph is valid for your engine (no illegal cycles unless supported, etc.). By running the evaluation on graphs of size 10, 100, 1000, etc., you can observe how the performance scales. Ideally, if your graph evaluation algorithm is O(N), a 10× larger graph might take ~10× time. If you find it takes disproportionately more, that indicates non-linear overhead (perhaps graph traversal is doing redundant work, or cache effects, etc.). Generating graphs programmatically ensures consistent structure while scaling size, which is great for stress-testing.

Complex Animation Scenarios: Similarly, generate animation data of varying complexity. For instance, create an animation with a large number of tracks or keyframes, or many simultaneous animations playing on different targets. You could simulate 100 objects each with their own animation, or one object with a very complex animation timeline. Measure the update step cost for these scenarios. This tests the animation engine’s scalability: does updating 100 animations take ~100× time of 1 animation? If not, investigate if there's shared overhead that could be optimized.

Automate Benchmark Runs: Integrate these generated cases into your benchmarking pipeline. You could have a suite of Criterion benchmarks or simple Rust tests that construct graphs/animations of various sizes and then call the update function, measuring the time. This will produce a table or graph of size vs time. The goal is to catch non-linear slowdowns. For example, maybe going from 100 to 200 nodes doubles the time (good, linear), but going to 500 nodes might more than 5× the time due to some internal algorithmic complexity – that’s a red flag to investigate.

Identify Nonlinear Overhead: Use the data to identify thresholds where performance degrades. Perhaps the animation engine is fast up to 50 tracks but slows beyond that – maybe due to internal reallocation or caching issues when arrays grow. By knowing these patterns, developers can optimize those parts or set practical limits. It also informs what “negligible cost” means (if 1 node is 0.001ms, 1000 nodes might be 1ms – still fine; but if it’s 10ms, that’s significant).

Fixtures and Realistic Scenarios: In addition to synthetic cases, profile with some realistic complex scenarios (if available). E.g., if there is a known heavy scene or typical usage pattern for Vizij, use that as a test. Real-world patterns (maybe graphs where many nodes feed a few outputs, or animations with certain easing functions) might reveal different performance characteristics than random data.

By generating and testing across a spectrum, you ensure the system will scale and also get a sense of where the bottlenecks might come in the future as usage grows.

# Isolating Orchestrator Overhead

The orchestrator in Vizij likely ties together the animation engine and node graph updates (and possibly other systems), coordinating them each “tick” or step. It’s important to measure the orchestrator’s own overhead separate from the work it drives:

Benchmark with No-Op Work: Run the orchestrator’s update loop in a scenario where the actual animation/graph work is minimal or stubbed out. For instance, use a trivial graph (or none) and no animations, and measure the time the orchestrator takes to complete a cycle. This essentially measures scheduling, state management, and any inter-thread or loop overhead in the orchestrator itself. If this “empty orchestrator tick” takes, say, 0.1ms, that’s the baseline cost of just running the orchestrator logic.

Compare with Full Workload: Next, run the orchestrator with a heavy workload (large graph + many animations) and measure the total time. Within that, if you can measure the graph and animation parts separately (via instrumentation or known benchmarks), you can infer how much extra time is spent in the orchestrator coordinating everything. For example, if the total tick is 10ms and you know from separate profiling that the graph + animations themselves took 9ms, then ~1ms is orchestrator overhead.

Identify Orchestrator Bottlenecks: If orchestrator overhead grows with the number of tasks (e.g. if you have 10 animations vs 100 animations and the orchestrator’s own loop scales poorly), that’s worth addressing. Common issues might be O(N) scanning of tasks, a lot of event dispatch overhead, or locking/contention if threads are involved. Profiling the orchestrator might involve instrumenting its code with spans (e.g. one span for “update all animations”, one for “update all graphs”, one for “dispatch events”, etc.) to see where it spends time.

Use Targeted Profiling: You can also attach a profiler while running a scenario with many orchestrated components to see if the orchestrator functions (perhaps state checking, or timeline management, etc.) appear high in the profile. If the orchestrator is largely just calling into the other systems sequentially, its overhead should be small. But if it’s doing significant work (sorting tasks, running scripts, etc.), that should show up and can be optimized or offloaded.

Overall, by isolating the orchestrator, you ensure that any overhead in coordinating systems doesn’t sneakily become a bottleneck. If it’s negligible (which ideally it should be if it mostly delegates to Rust code), then developers can comfortably focus on optimizing the core algorithms instead.

# Knowing When to Focus on Rust vs. JS/WASM Layers

After collecting data from all these stages, the critical thinking is: where is the bottleneck? The goal is to spend optimization effort where it matters most for real-world usage:

Identify the Bottleneck: If your browser profiling shows that most of the frame time is spent in the Rust/WASM execution, then further optimizing the Rust code could yield improvements in app responsiveness. In this case, using native profilers or tweaking algorithms would be worthwhile. However, if the Rust code (even in WASM) runs very fast and the majority of time is actually spent elsewhere (JavaScript overhead, data marshalling, rendering, React reconciliation, etc.), then the Rust cost can be considered negligible in context. As the official Rust/WASM guide notes, you should ensure the bottleneck is actually in the WebAssembly code before sinking time into low-level optimization – otherwise you risk “optimizing code that isn't hot”.

Rust Cost Negligible Scenario: For example, suppose each Vizij core update takes 1ms in the browser, but due to layout and rendering, the overall frame time is 16ms. Further reducing that 1ms to 0.5ms (a big effort in Rust optimization) would hardly affect the 16ms frame. In such a case, it’s appropriate to declare the Rust performance “good enough” and focus on higher-level optimizations. These could include reducing the number of calls between JS and WASM (if call overhead is high), optimizing how data is passed (avoiding unnecessary copies), or improving the surrounding JS logic or scheduling.

When to Re-focus on JS/WASM Integration: Pay attention to boundary costs. If the profiling reveals that calling a WASM function incurs, say, 0.1ms overhead and you’re calling it 500 times per frame, that’s 50ms just in call overhead – a JS/WASM integration issue. In such a case, changing the approach (e.g. batch those calls into a single invocation that processes 500 items in Rust) would be more fruitful than micro-optimizing the Rust function’s arithmetic. Likewise, if a lot of time is spent converting data structures (like serializing a JS object to pass into WASM on each call), try to redesign the API to minimize data transformation.

Monitor as You Optimize: It’s often iterative – you might optimize the Rust core based on initial findings (Stage 1), then find the bottleneck shifts to the JS layer. At that point, work on the JS/WASM interface or higher-level logic. As you improve those, the pendulum might swing back, revealing that now the Rust computation is a limiting factor for the next level of performance (especially if you drastically cut overhead elsewhere). Thus, profiling is not one-and-done; you revisit it after each set of changes.

In essence, treat the Rust core performance as negligible when it no longer significantly affects end-to-end performance. The threshold for “negligible” depends on your app’s requirements (for a 60 FPS app, anything consistently under ~1–2ms per frame might be fine, leaving headroom for other work). Use the data: if the Rust execution is, say, 5% of the frame time and 95% is elsewhere, shifting focus is justified. If the Rust is 50%, then it’s still a major contributor.

# Building the Layered Profiling Harness

Bringing it all together, developers should create a staged harness that automates much of the above:

Native Benchmarks (Rust): A suite of benchmarks (using Criterion or similar) for key operations: e.g. bench_update_graph_small, bench_update_graph_large, bench_anim_few_tracks, bench_anim_many_tracks, bench_orchestrator_empty, bench_orchestrator_loaded, etc. This gives quick feedback on algorithmic performance and scalability within Rust. Incorporate profiling tools like pprof with Criterion to generate flamegraphs for deeper insight into hotspots during these benchmarks.

WASM Tests (Node.js): A Node script (or set of scripts) that uses the built WASM and runs equivalent scenarios. It could read some test scenario descriptions (like a graph spec JSON) and execute the update loop a large number of times, measuring the time. This script can output metrics (e.g. console.log how long 10,000 iterations took) for comparison. Ensure the WASM is built in release mode (optimizations on) for realistic results, and consider having an option to include debug symbols for profiling visibility.

Browser Test Harness: Perhaps a special page or mode in the Vizij app that can load a test scenario (like a generated large graph or a stress test animation) and run it in a tight loop or as fast as possible, while capturing performance data. You might build a simple UI that, say, spawns N animation players or nodes and then measures the update loop duration using performance.now(). This can be combined with using the browser’s dev tools to record a profile during the run. You could even automate this with a headless browser (using Puppeteer) that triggers the test and collects the performance entries.

Data Collection and Analysis: Aggregate the results from these stages. For instance, you might produce a table comparing a particular scenario in native vs WASM vs browser. This will highlight the overhead added at each layer. Document these so that as code changes, you can re-run the harness to catch regressions or improvements.

Iterate: After making improvements (say you optimize the graph algorithm), re-run the benchmarks and see the effect. The harness makes it easier to continuously measure the performance at each layer, ensuring that a change in Rust actually translates to better frame times in the browser, or diagnosing if perhaps an optimization in Rust had negligible effect due to a dominant overhead elsewhere.

By following this comprehensive approach – profiling at multiple layers, using the right tools for each, and focusing on macro vs micro aspects appropriately – the Vizij team can gain a deep understanding of their system’s performance. This staged strategy ensures that effort is spent where it counts: first making sure the Rust core is efficient, then verifying that WASM isn’t adding unexpected slowdowns, and finally tuning the integration and higher-level code for smooth performance. It also provides confidence in declaring certain costs “negligible” when the data shows they are a minor fraction of the whole, allowing developers to focus on the real bottlenecks at any given time.
