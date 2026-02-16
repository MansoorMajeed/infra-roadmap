---
id: "signals-and-ipc"
title: "Signals & Inter-Process Communication"
zone: "foundations"
edges:
  from:
    - id: "what-is-a-process"
      question: "Processes are running. How do they talk to each other?"
      detail: "Processes do not exist in isolation. They need to communicate — a parent process needs to know when a child exits, a service manager needs to tell a service to reload its config, and your terminal needs to send a 'stop' signal when you press Ctrl+C. Signals and inter-process communication are the mechanisms the OS provides for processes to coordinate, and understanding them is how you gracefully manage services in production."
  to:
    - id: "systemd-and-services"
      question: "I know how processes communicate. Who manages all the services?"
      detail: "You understand signals — how to tell a process to stop, reload, or terminate. But on a real server, dozens of services need to start in the right order at boot, restart if they crash, and shut down gracefully. Something needs to orchestrate all of this. That something is the init system, and on modern Linux, it is systemd. It uses the same signals you just learned about, but wraps them in a service management framework."
difficulty: 1
tags: ["signals", "ipc", "sigterm", "sigkill", "sighup", "pipes", "sockets", "kill"]
category: "concept"
milestones:
  - "Explain the difference between SIGTERM and SIGKILL"
  - "Send signals to a process using kill and understand what happens"
  - "Explain what happens when you press Ctrl+C in a terminal"
---

You press Ctrl+C and a running program stops. But how? Your terminal did not just yank the program out of existence — it sent a **signal**, a small message from the OS to the process saying "please stop." Signals are one of the oldest and most fundamental ways processes communicate on Linux. They are how you gracefully shut down services, reload configurations without downtime, and handle the unexpected. And as an SRE, you will send and reason about signals constantly.

<!-- DEEP_DIVE -->

A **signal** is a software interrupt delivered to a process. The OS sends it, and the process can either handle it (run custom code in response), ignore it, or let the default behavior happen (which is usually to terminate). Signals are identified by numbers, but you will always use their names. Here are the ones you need to know:

- **SIGTERM (15)** — "Please terminate gracefully." This is the default signal sent by the `kill` command. Well-written programs catch SIGTERM and use it to clean up: close database connections, finish writing files, flush logs, then exit. This is the polite way to stop a process.
- **SIGKILL (9)** — "Die. Now." Cannot be caught, cannot be ignored, cannot be handled. The kernel immediately terminates the process. Use this only as a last resort because the process gets no chance to clean up — open files might be corrupted, connections might be left hanging, temporary files might not be deleted. `kill -9 <PID>` is the command.
- **SIGINT (2)** — "Interrupt." This is what Ctrl+C sends. Similar to SIGTERM but conventionally used for interactive interruption. Programs can catch it to clean up or ask "are you sure?"
- **SIGHUP (1)** — "Hangup." Originally meant the terminal disconnected. Today, many daemons (like Nginx and Apache) catch SIGHUP to mean "reload your configuration file without restarting." This is incredibly useful — `kill -HUP <PID>` reloads the config without dropping any active connections.
- **SIGSTOP / SIGCONT** — Pause and resume a process. SIGSTOP cannot be caught (the process freezes immediately). SIGCONT unfreezes it. Ctrl+Z in a terminal sends SIGTSTP (the catchable version of SIGSTOP). This is what happens when you "background" a process.
- **SIGCHLD** — Sent to a parent when a child process exits. This is how the parent knows to clean up the child's entry in the process table. If the parent never handles SIGCHLD, the dead child becomes a zombie.

**The `kill` command** is misnamed — it does not always kill. It sends signals. `kill <PID>` sends SIGTERM. `kill -9 <PID>` sends SIGKILL. `kill -HUP <PID>` sends SIGHUP. `killall nginx` sends SIGTERM to all processes named nginx. `pkill -f "java.*myapp"` sends SIGTERM to processes matching a pattern — very useful when you need to find and signal a process by its full command line.

**Why graceful shutdown matters.** Imagine a web server handling requests. You need to deploy a new version, so you need to stop the old one. If you SIGKILL it, every in-flight request gets dropped — users see errors. If you SIGTERM it, a well-written server stops accepting new connections, finishes handling the ones in progress, then exits cleanly. This is called **graceful shutdown**, and it is the difference between zero-downtime deployments and angry users. Kubernetes sends SIGTERM to pods during rolling updates, waits a configurable grace period, and only sends SIGKILL if the process has not exited by then. Understanding this lifecycle is essential for running reliable services.

**Beyond signals: other IPC mechanisms.** Signals are limited — they are just notifications, they cannot carry data. For richer communication, Linux provides:

- **Pipes** — `|` in the shell. The output of one process becomes the input of another. `cat log.txt | grep error` creates two processes connected by a pipe.
- **Unix domain sockets** — like network sockets, but for processes on the same machine. Much faster than TCP. Docker communicates with its daemon through `/var/run/docker.sock`.
- **Shared memory** — two processes map the same chunk of memory. Fastest IPC method, but requires careful synchronization.

For SRE work, signals are by far the most important IPC mechanism to master. You will use them daily to manage services, debug stuck processes, and implement graceful deployments.

<!-- RESOURCES -->

- [Linux Signals Explained - freeCodeCamp](https://www.freecodecamp.org/news/linux-signals-fundamentals/) -- type: tutorial, time: 20m
- [Signal Handling in Linux - Red Hat](https://www.redhat.com/sysadmin/linux-signal-handling) -- type: article, time: 20m
- [Graceful Shutdown Patterns](https://cloud.google.com/blog/products/containers-kubernetes/kubernetes-best-practices-termination-grace-period) -- type: article, time: 15m
- [Inter-Process Communication in Linux - GeeksforGeeks](https://www.geeksforgeeks.org/inter-process-communication-ipc/) -- type: tutorial, time: 30m
- [The kill Command - Linux man page](https://man7.org/linux/man-pages/man1/kill.1.html) -- type: reference, time: 10m
