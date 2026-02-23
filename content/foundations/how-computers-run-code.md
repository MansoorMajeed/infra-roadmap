---
id: "how-computers-run-code"
title: "How Computers Run Code"
zone: "foundations"
edges:
  from:
    - id: "hello-world"
      question: "I wrote code and it ran... but how?"
      detail: "You typed some text, hit run, and words appeared on screen. But what actually happened between pressing 'run' and seeing output? Your code went through a journey — from human-readable text to something a CPU can execute. Understanding that journey explains why different languages exist and why some programs are fast while others are slow."
  to:
    - id: "operating-system-basics"
      question: "Code runs on hardware. But what manages all that?"
      detail: "My code runs, but I also have a browser, a music player, and a dozen other things running at the same time. How does the computer handle all of that simultaneously? And how does my program get access to the disk or network without directly touching the hardware? Something must be coordinating all of this — what is it?"
difficulty: 1
tags: ["cpu", "compilation", "interpretation", "machine-code", "hardware"]
category: "concept"
milestones:
  - "Explain the difference between compiled and interpreted languages"
  - "Understand what the CPU actually does with your code"
---

When you ran that Hello World program, something remarkable happened behind the scenes. Your human-readable code got transformed into a stream of ones and zeros that a tiny chip in your computer -- the CPU -- could understand and execute. Understanding this transformation is the key to understanding why some programs are fast, why some crash, and why different programming languages exist in the first place.

<!-- DEEP_DIVE -->

At the very bottom of the stack, your CPU only understands one thing: machine code. These are simple numeric instructions like "load this number into a register," "add these two registers together," or "jump to this memory address." That is it. Your CPU cannot read Python or JavaScript. It does not know what a "string" or a "function" is. It just crunches numbers at billions of operations per second.

So how does `print("Hello, World!")` become something the CPU can execute? There are two main approaches: compilation and interpretation. A **compiled** language (like C, Go, or Rust) uses a program called a compiler to translate your entire source code into machine code *before* you run it. The output is a binary file -- an executable -- that the CPU can run directly. This is why compiled programs tend to be fast: the translation work is done ahead of time. An **interpreted** language (like Python or Ruby) uses a program called an interpreter that reads your code line by line and executes it on the fly. There is no separate compilation step, which makes development faster and more interactive, but execution is generally slower because the translation happens at runtime.

In practice, the line between compiled and interpreted is blurry. Java compiles to "bytecode" that runs on the Java Virtual Machine (JVM), which then interprets or JIT-compiles it to machine code. Python compiles your `.py` files to `.pyc` bytecode behind the scenes. JavaScript engines like V8 (used in Chrome and Node.js) use sophisticated just-in-time (JIT) compilation to get near-native speed. The key takeaway is not the exact mechanism -- it is that there is always a translation step from human-readable code to something the hardware can execute.

Why does this matter for SRE work? Because understanding the compilation and runtime model of a language tells you a lot about how it behaves in production. A Go service compiles to a single static binary -- easy to deploy, no runtime dependencies. A Python service needs a Python interpreter installed, plus all its library dependencies. A Java service needs a JVM and has a warm-up period before the JIT kicks in. These are not just academic distinctions; they directly affect how you build, deploy, and troubleshoot services.

It is also worth understanding the concept of **high-level vs. low-level** languages. A low-level language like C or assembly gives you direct control over memory and hardware but requires you to manage every detail yourself. A high-level language like Python abstracts all of that away -- you don't worry about memory allocation, you just write `x = "hello"` and the language handles the rest. Most SRE work lives in the high-level world (Python, Go, Bash), but understanding what is happening underneath helps you debug the hard problems -- memory leaks, performance issues, and the mysterious crashes that only happen in production.

<!-- RESOURCES -->

- [Crash Course Computer Science - The CPU (YouTube)](https://www.youtube.com/watch?v=FZGugFqdr60) -- type: video, time: 10m
- [Khan Academy - How Computers Work](https://www.khanacademy.org/computing/code-org/computers-and-the-internet) -- type: course, time: 2h
- [Compiled vs Interpreted Languages - freeCodeCamp](https://www.freecodecamp.org/news/compiled-versus-interpreted-languages/) -- type: article, time: 15m
- [Ben Eater - Building an 8-bit Computer (YouTube)](https://www.youtube.com/playlist?list=PLowKtXNTBypGqImE405J2565dvjafglHU) -- type: video, time: varies
