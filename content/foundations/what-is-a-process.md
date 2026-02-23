---
id: what-is-a-process
title: What Is a Process?
zone: foundations
edges:
  to:
    - id: threads-and-concurrency
      question: A process runs code. But what if it needs to do many things at once?
      detail: >-
        My app handles one request and then starts the next one. But a real web
        server must be handling thousands at once — it can't just make everyone
        wait in line. How does a single process do many things simultaneously?
        Is it running multiple copies of itself, or something else entirely?
    - id: signals-and-ipc
      question: Processes are running. How do they talk to each other?
      detail: >-
        I press Ctrl+C and something stops. I run kill and something dies. But
        how does one process actually tell another to do something? And what's
        the difference between a process just stopping and it being told to
        stop? I feel like I'm missing how processes actually communicate with
        each other.
    - id: processes-and-memory
      question: A process is running. How does it use memory?
      detail: >-
        I can see a process running in ps — but I have no idea what's actually
        happening in memory. Processes clearly need RAM, but I don't understand
        how they get it, what happens when they need more, or why some of them
        seem to just keep eating memory forever.
difficulty: 1
tags:
  - process
  - fork
  - exec
  - pid
  - process-tree
  - proc-filesystem
  - ps
  - strace
category: concept
milestones:
  - Explain what fork and exec do
  - Use ps and pstree to inspect the process tree
  - Explore /proc to read live process information
  - Use strace to watch a process make system calls
---

When you type `ls` in your terminal and press Enter, a surprisingly complex chain of events unfolds. Your shell does not just "run ls." It creates an entirely new process — a copy of itself — and then replaces that copy with the `ls` program. That new process gets its own memory, its own process ID, and a place in a tree of processes that stretches all the way back to the very first process that started when your system booted. Understanding this is understanding how Linux actually works.

<!-- DEEP_DIVE -->

A **process** is a running instance of a program. The program itself is just a file on disk — `/usr/bin/ls`, `/usr/bin/python3`, `/usr/sbin/nginx`. When you execute that file, the kernel creates a process: it allocates memory, assigns a **PID** (Process ID), sets up the process's environment, and starts executing the program's instructions. The program is the recipe; the process is the cake being baked.

**How a process is born: fork and exec.** On Linux, new processes are created through a two-step mechanism that is elegant but initially confusing. First, the existing process (your shell) calls `fork()`, which creates an exact copy of itself — same code, same memory, same everything, but with a new PID. Now there are two identical processes: the parent (your shell) and the child (the copy). Then the child calls `exec()`, which replaces its entire memory and code with a new program (like `ls`). The child process is now running `ls`, not a copy of your shell.

This fork-exec model is everywhere in Linux. When your shell runs a command, it forks and execs. When a web server spawns a worker process, it forks. When `systemd` starts a service, it forks and execs. You can observe this yourself — run `strace -f bash -c "ls"` and you will see the `clone()` system call (the modern version of fork) followed by `execve()`.

**The process tree.** Every process has a parent, and that parent has a parent, all the way up to PID 1 — the **init process** (usually `systemd` on modern Linux). This creates a tree structure. Run `pstree` to see it. Your terminal emulator started a shell, that shell started your command, and so on. This parent-child relationship matters because when a parent process dies, its children become **orphans** and get adopted by PID 1. And when a child process exits but its parent has not yet acknowledged the exit, it becomes a **zombie** — a process that is technically dead but still has an entry in the process table. A few zombies are harmless; thousands of them mean something is broken.

**Inspecting processes.** The `ps` command is your primary tool. `ps aux` shows every process on the system with its PID, user, CPU usage, memory usage, and the command that started it. `ps -ef` shows similar information with the parent PID (PPID), which lets you trace the parent-child chain. `pstree -p` gives you a visual tree with PIDs. For a live, updating view, use `top` or `htop`.

**The /proc filesystem.** Linux exposes process information through a virtual filesystem at `/proc`. Every running process has a directory at `/proc/<PID>/`. Inside you will find:

- `/proc/<PID>/status` — process state, memory usage, owner
- `/proc/<PID>/cmdline` — the full command that started the process
- `/proc/<PID>/fd/` — all open file descriptors (files, sockets, pipes the process has open)
- `/proc/<PID>/environ` — the environment variables the process was started with

This is not just trivia — when you are debugging a production issue and need to know what a running process is actually doing, `/proc` gives you live data without stopping the process. Tools like `ps` and `top` are actually just reading from `/proc` under the hood.

**strace: watching a process in real time.** `strace` attaches to a process and shows you every system call it makes — every file it opens, every network connection it creates, every byte it reads or writes. Run `strace ls` and you will see dozens of system calls: `openat()` opening directories, `getdents()` reading directory entries, `write()` printing output. When a program is failing mysteriously — hanging, crashing, producing wrong output — `strace` often reveals exactly why. It is one of the most powerful debugging tools in an SRE's arsenal. `strace -p <PID>` attaches to an already-running process.

<!-- RESOURCES -->

- [The /proc Filesystem - Linux Documentation Project](https://tldp.org/LDP/Linux-Filesystem-Hierarchy/html/proc.html) -- type: reference, time: 30m
- [strace - The Definitive Guide (Julia Evans)](https://jvns.ca/blog/2015/04/14/strace-zine/) -- type: article, time: 20m
- [How Linux Creates Processes (fork and exec)](https://www.youtube.com/watch?v=PZrQ4eGm-hM) -- type: video, time: 15m
- [Process Management in Linux - GeeksforGeeks](https://www.geeksforgeeks.org/process-management-in-linux/) -- type: tutorial, time: 25m
- [pstree and Process Hierarchy - Red Hat](https://www.redhat.com/sysadmin/linux-process-management) -- type: article, time: 15m
