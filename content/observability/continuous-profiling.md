---
id: continuous-profiling
title: Continuous Profiling
zone: observability
edges:
  to:
    - id: observability-cardinality
      question: >-
        I found the performance problem and fixed it. But my observability bill
        is still growing every month. What's driving that?
      detail: >-
        Great — I tracked down the slow function. But now I'm noticing that the
        infrastructure cost for metrics and traces is growing faster than my
        traffic is. Something about how I've set things up is generating way
        more data than I actually need, and I don't know where to look.
difficulty: 3
tags:
  - profiling
  - continuous-profiling
  - pprof
  - pyroscope
  - flame-graphs
  - observability
  - performance
category: practice
milestones:
  - Understand what a CPU flame graph shows and how to read it
  - Set up continuous profiling for a service using Pyroscope or pprof
  - Identify a hot function from a flame graph and fix it
  - Know when to reach for profiling vs. tracing vs. metrics to diagnose slowness
---

Metrics tell you that your service is using 80% CPU. Traces tell you that the `processPayment` function is slow. Neither tells you which specific line of code inside `processPayment` is burning all that CPU. That's the gap profiling fills — it samples your running program thousands of times per second, recording exactly what each thread was executing at each sample, and aggregates that into a picture of where your code spends its time.

Traditional profiling means running a profiler against a local copy of your code for a specific benchmark. That's useful for known performance problems, but it misses the cases that matter most: the ones that only appear under real production load, with real data, at 2am when traffic is at its peak. Continuous profiling keeps a low-overhead profiler running all the time in production, stores the profiles over time, and lets you compare them across deployments. You can ask: "Did this deploy make the CPU usage worse?" and get an actual code-level answer.

The visualization that makes all of this legible is the flame graph. Once you can read a flame graph, a lot of performance investigations that used to take days take an hour.

<!-- DEEP_DIVE -->

## How profiling works

A CPU profiler works by interrupting your program at regular intervals (typically thousands of times per second) and recording the call stack at that moment. After enough samples, a clear picture emerges: if `parseJSON` appears in 30% of your samples, it's consuming roughly 30% of your CPU time.

This sampling approach is lightweight enough to run in production — typical overhead is 1–3% CPU, which is acceptable for the value it provides. It's different from instrumented profiling, which adds code around every function call and can have 20–50% overhead.

## Reading a flame graph

A flame graph is the standard way to visualize profile data. Before you can use it, you need to understand what it's showing:

- **The x-axis is not time** — it's the proportion of CPU samples. Functions that appear in more samples are wider. Width = CPU time.
- **The y-axis is the call stack** — the bottom is the entry point (main function, thread start, event loop), and stacks grow upward. A bar sitting on top of another bar means "this function was called by the one below it."
- **The top of each stack is where time is actually being spent** — a wide bar at the top that has nothing above it is a leaf function consuming CPU.

Here's how to read one:

```
┌──────────────────────────────────────────────────────────────────────┐
│ http.Server.Serve (80% of samples)                                   │
├──────────────────────────────────────────┬───────────────────────────┤
│ handleRequest (70%)                      │ TLS handshake (10%)        │
├────────────────────┬─────────────────────┤                           │
│ parseRequest (5%)  │ processOrder (65%)  │                           │
│                    ├───────┬─────────────┤                           │
│                    │ DB    │ validateCart│                           │
│                    │ query │ (45%)       │                           │
│                    │ (20%) ├─────────────┤                           │
│                    │       │ priceCalc   │                           │
│                    │       │ (45%)  ◄────┼── THIS is your problem    │
└────────────────────┴───────┴─────────────┴───────────────────────────┘
```

In this example, `priceCalc` is at the top of the widest stack and takes 45% of CPU time. That's your hot function. The DB query at 20% is the next candidate. The TLS handshake at 10% is probably not worth touching unless you can terminate TLS at the load balancer.

The key technique: find the widest bar that isn't a language runtime or framework call. That's where you should focus.

## Tools by language

**Go — pprof (built-in)**

Go has profiling built into the standard library. Add the pprof HTTP handler and you can pull profiles on demand:

```go
import _ "net/http/pprof"

// In your main function:
go func() {
    log.Println(http.ListenAndServe("localhost:6060", nil))
}()
```

Collect a 30-second CPU profile:

```bash
go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30
```

View the flame graph in your browser:

```bash
go tool pprof -http=:8080 profile.pb.gz
```

**Python — py-spy**

py-spy attaches to a running Python process without modifying your code:

```bash
pip install py-spy

# Profile a running process for 30 seconds
py-spy record -o profile.svg --pid 12345 --duration 30

# Or a subprocess
py-spy record -o profile.svg -- python myapp.py
```

**JVM — async-profiler**

```bash
# Download async-profiler
curl -L https://github.com/async-profiler/async-profiler/releases/latest/download/async-profiler-linux-x64.tar.gz | tar xz

# Profile a running JVM process
./asprof -d 30 -f profile.html <pid>
```

## Continuous profiling with Pyroscope

For continuous profiling (always-on, stored historically), Pyroscope is the main open-source option. You run the Pyroscope server, and integrate the Pyroscope SDK into your application:

```python
import pyroscope

pyroscope.configure(
    application_name = "my-service",
    server_address   = "http://pyroscope:4040",
    tags             = {
        "region": "us-east-1",
        "version": os.environ.get("APP_VERSION", "unknown"),
    }
)
```

The SDK profiles your application every 10 seconds and ships the data to Pyroscope. In the Pyroscope UI you can:
- View a flame graph for any time range
- Compare flame graphs across two time windows (e.g., before vs. after a deploy)
- Filter profiles by tag (e.g., compare profile between v1.2 and v1.3)

The "diff flame graph" feature is particularly useful after deploys. New red regions are code paths that got slower. Green regions got faster.

## When to reach for profiling

Profiling is the last resort, not the first. Use it when:

- Metrics show CPU or memory usage is high, but traces don't explain why
- A trace shows a span is slow, but there are no obvious external calls inside it (the work is happening inside your code)
- You've deployed a change and CPU usage went up, but nothing obvious changed
- You suspect a library you're using is doing something inefficient

You don't need profiling when:
- A trace shows a database query is slow — optimize the query
- An external API is slow — that's network and the external service, not your code
- You can see from metrics that a specific endpoint is slow — traces give you enough detail

The rough debugging hierarchy: **metrics → traces → logs → profiles**. Most problems are solved before you get to profiling.

<!-- RESOURCES -->

- [Pyroscope: Getting Started](https://grafana.com/docs/pyroscope/latest/get-started/) -- type: tutorial, time: 20m
- [The Flame Graph — Brendan Gregg](https://www.brendangregg.com/flamegraphs.html) -- type: article, time: 15m
- [Go pprof documentation](https://pkg.go.dev/net/http/pprof) -- type: article, time: 10m
- [py-spy: Sampling profiler for Python](https://github.com/benfred/py-spy) -- type: article, time: 10m
- [Continuous Profiling in Production — Grafana blog](https://grafana.com/blog/2022/06/07/ask-us-anything-how-to-get-started-with-continuous-profiling/) -- type: article, time: 12m
- [async-profiler for JVM](https://github.com/async-profiler/async-profiler) -- type: article, time: 10m
