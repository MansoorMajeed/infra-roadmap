---
id: "processes-and-memory"
title: "Processes & Memory"
zone: "foundations"
edges:
  from:
    - id: "what-is-a-process"
      question: "A process is running. How does it use memory?"
      detail: "You know what a process is and how it is created. But every process needs memory to work — space for its code, its variables, its stack, and its heap. The OS gives each process its own virtual address space, manages physical RAM, and steps in when memory runs out. Understanding memory management is how you diagnose memory leaks, OOM kills, and why your Java app needs 4 GB of RAM to do seemingly nothing."
    - id: "files-and-filesystems"
      question: "Files exist on disk. But what about things running in memory?"
      detail: "You understand how data is stored on disk, but when a program actually runs, it lives in memory (RAM) — a much faster but temporary space. The OS constantly shuffles data between disk and memory, creates processes, and allocates resources. Understanding this relationship between disk and memory, and how the OS manages running programs, is key to troubleshooting performance issues."
  to:
    - id: "programming-fundamentals"
      question: "I understand how the computer runs things. Now how do I write real programs?"
      detail: "You know how the OS manages processes, memory, and files. Now it's time to actually write programs that leverage all of this. Programming fundamentals — variables, loops, functions, data structures — are the building blocks of every script, tool, and service you'll build as an SRE. This isn't about becoming a software engineer; it's about being dangerous enough with code to automate your work and solve problems."
difficulty: 1
tags: ["processes", "memory", "ram", "pid", "linux", "system-resources"]
category: "concept"
milestones:
  - "Use ps and top to inspect running processes"
  - "Explain the difference between RAM and disk storage"
  - "Kill a process from the terminal"
---

Every program you run on a computer becomes a **process** -- a living, breathing instance of that program with its own slice of memory, a unique ID, and a lifecycle that the operating system carefully manages. Understanding processes and memory is what separates someone who uses a computer from someone who can troubleshoot why it is slow, unresponsive, or eating all your RAM at 3 AM during an incident.

<!-- DEEP_DIVE -->

When you launch a program -- say you type `python my_script.py` -- the operating system does not just "run the file." It creates a process. That process gets a unique identifier called a **PID** (Process ID), its own chunk of memory to work in, and a spot in the OS scheduler's queue. You can see all running processes with the `ps` command. Try `ps aux` and you will get a wall of output showing every process on the system, who started it, how much CPU and memory it is using, and its PID. The `top` command (or the much friendlier `htop`, if you install it) gives you a live, updating view -- think of it as the task manager for the terminal.

Memory comes in two flavors that you need to understand: **RAM** (Random Access Memory) and **disk storage**. RAM is fast but temporary -- when your process runs, its variables, data structures, and active state all live in RAM. Disk storage is slow but permanent -- your files, your database, your photos all sit on disk. When your computer runs out of RAM, it starts using a section of the disk called **swap space** as overflow, and everything slows to a crawl. This is why a machine with 4 GB of RAM running thirty Chrome tabs feels like it is wading through mud.

Every process also has a **state**. It can be running (actively using the CPU), sleeping (waiting for something, like disk I/O or network data), stopped (paused), or zombie (finished but not yet cleaned up by its parent). When you run `top` and see a process using 99% CPU, that is a process stuck in the running state hogging resources. As an SRE, spotting this pattern is bread and butter -- you will do it constantly when debugging production issues.

Killing processes is a fundamental skill. The `kill` command sends a signal to a process. `kill 12345` sends SIGTERM (a polite "please shut down") to PID 12345. If the process ignores that, `kill -9 12345` sends SIGKILL (the OS forcibly terminates it, no questions asked). You can also use `killall python` to kill all processes with a given name. A word of caution: `kill -9` should be your last resort because it does not give the process a chance to clean up after itself -- open files might not get saved, database connections might not close properly.

Here is a practical exercise that ties it all together. Open two terminal windows. In the first, run `sleep 300` (this creates a process that does nothing for 300 seconds). In the second terminal, run `ps aux | grep sleep` to find it. Note the PID. Then run `kill <PID>` and watch the first terminal -- the sleep command will terminate. Now do it again, but this time use `top` or `htop` to find the process and kill it from there (press `k` in `top`, type the PID, and hit Enter). These are the exact same skills you will use when a runaway Java process is eating 32 GB of RAM in production.

Understanding the relationship between processes and memory is also the foundation for understanding containers, resource limits, and orchestration systems like Kubernetes. When you set a memory limit on a container and the process inside exceeds it, the OS kills that process with an OOM (Out of Memory) signal. Knowing why that happens, and how to investigate it, starts right here.

<!-- RESOURCES -->

- [Linux Process Management - DigitalOcean](https://www.digitalocean.com/community/tutorials/process-management-in-linux) -- type: tutorial, time: 30m
- [htop Explained - peteris.rocks](https://peteris.rocks/blog/htop/) -- type: article, time: 20m
- [How Linux Uses RAM - Linuxatemyram.com](https://www.linuxatemyram.com/) -- type: article, time: 10m
- [The Missing Semester - Shell Tools (MIT)](https://missing.csail.mit.edu/2020/command-line/) -- type: course, time: 1h
- [Linux Signals Fundamentals - freeCodeCamp](https://www.freecodecamp.org/news/linux-signals-fundamentals/) -- type: tutorial, time: 20m
