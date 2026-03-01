---
id: operating-system-basics
title: Operating System Basics
zone: foundations
edges:
  to:
    - id: linux-and-distros
      question: I know what an OS does. Which one matters for SRE?
      detail: >-
        I get what an OS does in abstract terms. But in practice, which one am I
        actually going to be using? I know most servers don't run Windows, but beyond
        that I'm fuzzy — is Linux one thing? Are there different versions? What
        am I actually going to encounter when I SSH into a server?
    - id: files-and-filesystems
      question: The OS manages files. How does that work?
      detail: >-
        I keep running into paths like /etc/nginx/nginx.conf and /var/log/syslog
        but I don't really understand how any of this is organized. Why are there
        so many folders? What does it even mean that "everything is a file"? When
        I try to read a log or edit a config I feel like I'm just guessing at
        where things live.
difficulty: 1
tags:
  - operating-system
  - linux
  - kernel
  - user-space
category: concept
milestones:
  - Explain what a kernel does
  - Understand why most servers run Linux
---

Your CPU can run code, but something needs to decide *which* code runs, *when* it runs, and *how* it shares resources like memory and disk with everything else happening on the machine. That something is the operating system. It is the layer between your programs and the bare metal hardware, and understanding it is absolutely essential for anyone working in SRE or DevOps.

<!-- DEEP_DIVE -->

An operating system has one core job: manage hardware resources and provide a stable, consistent interface for programs to use them. Without an OS, every program would need to know how to talk directly to your specific hard drive, your specific network card, your specific display. The OS abstracts all of that away. Your program says "write this to a file" and the OS figures out the specific disk commands to make it happen, regardless of whether you are using an SSD, an NVMe drive, or a network-attached storage device.

The heart of the OS is the **kernel**. The kernel runs with special privileges -- it has direct access to hardware and memory. It handles the most critical jobs: scheduling which processes get CPU time, managing physical memory, handling device drivers, and enforcing security boundaries between programs. When people say "Linux," they technically mean the Linux kernel. Everything else -- the shell, the file manager, the desktop environment -- is "user space" software that runs on top of the kernel.

**User space** is where your applications live. Programs in user space cannot directly touch hardware; they have to ask the kernel through **system calls** (syscalls). When your Python script opens a file, it triggers the `open()` system call. When it sends data over the network, it uses the `send()` syscall. This separation is crucial for security and stability -- a buggy application cannot crash the entire system because it never has direct hardware access. The kernel acts as a bouncer, validating every request.

Now, why Linux? In the SRE/DevOps world, Linux dominates server infrastructure. The overwhelming majority of servers on the internet run Linux -- from tiny containers to massive cloud instances. The reasons are practical: Linux is free and open source, it is incredibly stable, it is highly configurable, and it runs efficiently without a graphical interface (which servers do not need). AWS, Google Cloud, and Azure all default to Linux. Kubernetes runs on Linux. Docker containers are built on Linux kernel features. If you are going into SRE, Linux is not optional -- it is your primary working environment.

You do not need to switch your personal computer to Linux right away (though it helps). macOS is Unix-based and shares many concepts with Linux, so most terminal commands work the same way. Windows users can use WSL (Windows Subsystem for Linux) to get a full Linux environment. The important thing is to start getting comfortable with the concepts: processes, file permissions, system services, and the command line. These are the building blocks for everything that follows.

<!-- RESOURCES -->

- [Operating Systems: Three Easy Pieces (free online textbook)](https://pages.cs.wisc.edu/~remzi/OSTEP/) -- type: book, time: varies
- [Linux Journey - Getting Started](https://linuxjourney.com/) -- type: tutorial, time: 2h
- [How Linux Works by Brian Ward (book)](https://nostarch.com/howlinuxworks3) -- type: book, time: 10h
- [The Linux Kernel Documentation](https://www.kernel.org/doc/html/latest/) -- type: reference, time: varies
- [WSL Installation Guide (for Windows users)](https://learn.microsoft.com/en-us/windows/wsl/install) -- type: tutorial, time: 30m
