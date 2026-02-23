---
id: "threads-and-concurrency"
title: "Threads & Concurrency"
zone: "foundations"
edges:
  from:
    - id: "what-is-a-process"
      question: "A process runs code. But what if it needs to do many things at once?"
      detail: "A process is a single running program, but modern applications need to handle thousands of requests simultaneously. A web server cannot process one request at a time. This is where threads come in — lightweight units of execution within a process that share memory and can run in parallel. Understanding threads versus processes, and the trade-offs between them, is essential for debugging performance issues and understanding how production services actually work."
  to:
    - id: "programming-fundamentals"
      question: "I understand how programs run. Now how do I write them?"
      detail: "I understand the machinery — processes, threads, how the OS manages them. But understanding how something runs isn't the same as being able to write it. I want to go from 'I know what a program is' to 'I can actually write one.' Where do I start?"
difficulty: 1
tags: ["threads", "concurrency", "parallelism", "multi-threading", "race-condition", "context-switch"]
category: "concept"
milestones:
  - "Explain the difference between a process and a thread"
  - "Use ps -eLf or top -H to view threads of a running process"
  - "Explain why a single-threaded web server cannot handle many users"
---

A process is great for running one thing. But what happens when a web server needs to handle ten thousand connections at the same time? Creating ten thousand separate processes would be absurdly expensive — each one gets its own memory space, its own resources. This is why **threads** exist. A thread is a lightweight unit of execution that lives inside a process, shares its memory, and can run alongside other threads. Most production software you will manage as an SRE is multi-threaded, and understanding this is how you make sense of CPU usage, thread pool exhaustion, and deadlocks.

<!-- DEEP_DIVE -->

**Processes vs threads — the fundamental difference.** A process has its own memory space. When you fork a process, the child gets a copy of the parent's memory — they are isolated from each other. A thread, by contrast, lives inside a process and **shares** the same memory space with all other threads in that process. This makes threads much cheaper to create (no memory copying) and much faster to switch between (less state to save and restore). The trade-off is that shared memory makes threads dangerous — if two threads modify the same variable at the same time, you get a **race condition**, and the results are unpredictable.

To visualize it: a process is like a house — it has its own address, its own walls, its own furniture. A thread is like a person living in that house. Multiple people (threads) share the same kitchen, the same bathroom, the same living room (shared memory). This is efficient, but if two people try to use the stove at the same time without coordinating, things go wrong.

**How multi-threading works in practice.** When you run `nginx` or `java -jar myapp.jar`, the main process starts and then creates multiple threads. A Java web application might have a **thread pool** of 200 threads — each incoming HTTP request gets assigned to a thread, which handles the request and then returns to the pool. If all 200 threads are busy, new requests queue up and eventually time out. This is **thread pool exhaustion**, and it is one of the most common causes of "the application is not responding" incidents you will deal with as an SRE.

You can see threads with the `ps -eLf` command, which shows every thread as its own line with a **TID** (Thread ID) alongside the PID. Or use `top` and press `H` to toggle thread view — you will see individual threads and their CPU usage. When you see a Java process using 400% CPU on a 4-core machine, it is not magic — it is four threads each using 100% of a core.

**Context switching.** The CPU can only execute one thread per core at a time. When the OS needs to switch from one thread to another — because the current thread is waiting for I/O, or its time slice is up — it performs a **context switch**: saving the current thread's state (registers, program counter) and loading the next thread's state. Context switches are fast (microseconds) but not free. If your system is doing millions of context switches per second, it spends more time switching than actually doing work. You can monitor this with `vmstat` — the `cs` column shows context switches per second.

**Concurrency vs parallelism.** These terms are often confused. **Concurrency** means multiple tasks are in progress at the same time — they might be interleaved on a single CPU core, not truly simultaneous. **Parallelism** means multiple tasks are literally executing at the same instant, on different CPU cores. A single-core machine can be concurrent (switching rapidly between threads) but not parallel. A multi-core machine can be both. As an SRE, this distinction matters when you are sizing machines — adding more CPU cores helps with parallelism, but if your application has a single-threaded bottleneck (like Python's Global Interpreter Lock), extra cores will not help.

**Why this matters for SRE.** Most production incidents related to CPU and performance come down to thread and process behavior. A connection pool running out of threads means your database proxy stops accepting queries. A Go service spawning millions of goroutines (lightweight threads) overwhelms the scheduler. A Node.js application, which is famously single-threaded, blocks its event loop with a CPU-heavy operation and stops responding to all requests. When you understand the threading model of the applications you manage, you can predict failure modes, set appropriate limits, and diagnose issues in minutes instead of hours.

<!-- RESOURCES -->

- [Threads vs Processes - Julia Evans](https://jvns.ca/blog/2016/06/30/why-do-we-use-the-linux-kernels-tcp-stack/) -- type: article, time: 15m
- [Linux Threads Explained - Red Hat](https://www.redhat.com/sysadmin/threads-linux) -- type: article, time: 20m
- [Concurrency Is Not Parallelism (Rob Pike talk)](https://www.youtube.com/watch?v=oV9rvDllKEg) -- type: video, time: 30m
- [Operating Systems: Three Easy Pieces - Concurrency](https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf) -- type: book, time: 1h
- [Understanding Context Switching - Brendan Gregg](https://www.brendangregg.com/blog/2017-05-09/cpu-utilization-is-wrong.html) -- type: article, time: 15m
