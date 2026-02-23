---
id: programming-fundamentals
title: Programming Fundamentals
zone: foundations
edges:
  to:
    - id: scripting-bash-python
      question: I know the theory. Let me apply it to automate real tasks.
      detail: >-
        I understand the concepts — loops, functions, data structures — but I've
        only written toy programs. I want to actually automate the things I do
        in the terminal, or write something that does real work without me
        having to babysit it. What would I actually write, and in what language?
    - id: what-is-a-web-service
      zone: building
      question: I can write code. How do I build something people can use?
      detail: >-
        I can write scripts that run on my machine. But the software I actually
        want to build — something a user can open in a browser, something that
        serves data over an API — is a completely different thing. I don't even
        know what's involved in making something that lives on the network and
        responds to requests.
difficulty: 1
tags:
  - programming
  - variables
  - loops
  - functions
  - data-structures
  - logic
category: concept
milestones:
  - 'Write a program that uses variables, loops, and functions'
  - 'Implement a simple data structure (list, dictionary/map)'
  - Solve a basic coding challenge
---

Programming is not about memorizing syntax -- it is about learning to break problems into small, logical steps that a computer can follow. Once you internalize the core concepts of variables, loops, conditionals, and functions, you can pick up any programming language in a matter of days because they all share these same building blocks.

<!-- DEEP_DIVE -->

Let's start with **variables** -- they are just named containers for data. In Python, `name = "Alice"` stores the text "Alice" in a variable called `name`. `count = 42` stores the number 42. `is_active = True` stores a boolean (true/false) value. Every program you ever write will use variables to hold onto information while it works with it. The key insight is that variables can change -- that is why they are called variables. You can write `count = count + 1` and now `count` is 43. This ability to store, retrieve, and update data is the foundation of all computation.

**Conditionals** let your program make decisions. `if count > 100: print("That's a lot!")` only runs the print statement when the condition is true. Add `elif` for additional conditions and `else` for the default case. **Loops** let your program repeat actions. `for i in range(10): print(i)` prints the numbers 0 through 9. `while count < 100: count = count + 1` keeps incrementing until the condition is no longer true. Conditionals and loops together give your code the ability to handle complex logic -- check this, repeat that, do something different when a certain condition is met.

**Functions** are where you start thinking like a real programmer. A function is a reusable block of code that takes inputs, does something, and (optionally) returns an output. In Python: `def greet(name): return f"Hello, {name}!"`. Now you can call `greet("Alice")` and get back "Hello, Alice!" anywhere in your program. Functions let you organize your code, avoid repetition, and build abstractions. Instead of writing the same ten lines of code in five places, you write a function once and call it five times. When you need to fix a bug, you fix it in one place.

**Data structures** are how you organize information. A **list** (or array) stores items in order: `servers = ["web-01", "web-02", "db-01"]`. You can loop through it, add items, remove items, and access them by position (`servers[0]` gives you "web-01"). A **dictionary** (or map/hash) stores key-value pairs: `server_status = {"web-01": "healthy", "web-02": "degraded", "db-01": "healthy"}`. Now you can look up any server's status instantly with `server_status["web-01"]`. These two data structures alone will handle the vast majority of your day-to-day programming needs. As an SRE, you will constantly work with lists of servers, dictionaries of configuration values, and similar structures.

Here is an exercise that ties everything together. Write a program that reads a list of server names and their CPU usage (you can hardcode the data), then prints a warning for any server above 80% usage. This requires variables (to store data), a data structure (dictionary for server-to-usage mapping), a loop (to check each server), a conditional (to compare against the threshold), and a function (to encapsulate the check logic). It is a tiny program, but it mirrors exactly the kind of monitoring logic you will write professionally.

The most important skill at this stage is not writing perfect code -- it is developing your **problem-solving instinct**. When faced with a task, practice breaking it into smaller pieces. "Monitor server health" becomes: get the list of servers, check each one's metrics, compare to thresholds, and alert if something is wrong. Each of those pieces becomes a function, and suddenly a complex problem is just a collection of simple ones.

<!-- RESOURCES -->

- [Automate the Boring Stuff with Python - Al Sweigart](https://automatetheboringstuff.com/) -- type: book, time: 10h
- [Python Official Tutorial](https://docs.python.org/3/tutorial/) -- type: docs, time: 4h
- [freeCodeCamp - Scientific Computing with Python](https://www.freecodecamp.org/learn/scientific-computing-with-python/) -- type: course, time: 20h
- [Exercism - Python Track](https://exercism.org/tracks/python) -- type: interactive, time: varies
- [Think Python - How to Think Like a Computer Scientist](https://greenteapress.com/thinkpython2/html/index.html) -- type: book, time: 8h
