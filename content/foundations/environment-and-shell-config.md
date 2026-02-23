---
id: "environment-and-shell-config"
title: "Environment Variables & Shell Config"
zone: "foundations"
edges:
  from:
    - id: "pipes-and-redirection"
      question: "I can chain commands. How do I customize my shell environment?"
      detail: "You know how to compose commands with pipes and redirection. But your shell has its own configuration — environment variables that control how programs behave, config files that run every time you open a terminal, and a PATH variable that determines which programs you can run by name. Understanding your shell environment is how you go from 'it works when I type it' to 'it works everywhere, every time.'"
  to:
    - id: "scripting-bash-python"
      question: "My environment is set up. Now let me automate things."
      detail: "I keep repeating the same sequences of commands — finding the right flags, piping the right outputs, doing the same thing over and over. There must be a way to capture these workflows and run them with a single command. What does it take to actually write a script instead of just typing commands one by one?"
difficulty: 1
tags: ["environment-variables", "PATH", "bashrc", "profile", "export", "shell-config", "dotfiles"]
category: "concept"
milestones:
  - "Explain what PATH is and how the shell finds commands"
  - "Set and export environment variables"
  - "Understand the difference between .bashrc and .profile"
---

You type `python3` and it runs. But how does your shell know where `python3` lives? You set `DATABASE_URL` in your terminal and your application connects to the right database. But how does the application read that value? The answer is **environment variables** — key-value pairs that the OS passes to every process, controlling everything from which programs are available to how applications behave. And the shell configuration files that set these variables are the reason "it works on my machine" is such a common problem.

<!-- DEEP_DIVE -->

**Environment variables** are key-value pairs that exist in every process's environment. When a process is created (via fork/exec), it inherits a copy of its parent's environment. Run `env` to see all your current environment variables — there will be dozens. The most important ones:

- **PATH** — a colon-separated list of directories where the shell looks for commands. When you type `ls`, the shell searches each directory in PATH (like `/usr/local/bin`, `/usr/bin`, `/bin`) until it finds an executable named `ls`. If a command is "not found," it is almost always a PATH issue. `echo $PATH` shows your current PATH. `which python3` tells you exactly which `python3` the shell would run.
- **HOME** — your home directory (`/home/username` on Linux, `/Users/username` on macOS). The `~` shortcut in paths refers to this.
- **USER** — your username.
- **SHELL** — the path to your default shell (`/bin/bash`, `/bin/zsh`).
- **EDITOR** — the default text editor for commands that need one (like `git commit` without `-m`).
- **LANG / LC_ALL** — locale settings that control language, date formats, and character encoding.

Applications use environment variables extensively for configuration. A database connection string in `DATABASE_URL`, an API key in `API_KEY`, a feature flag in `DEBUG=true` — this pattern is everywhere in modern infrastructure. The Twelve-Factor App methodology explicitly recommends environment variables for configuration because they are language-agnostic and easy to change between environments (dev, staging, production) without modifying code.

**Setting environment variables.** `MY_VAR=hello` sets a variable in the current shell only — child processes will not see it. `export MY_VAR=hello` exports it so that all child processes inherit it. This distinction trips people up constantly. If you set `JAVA_HOME=/usr/lib/jvm/java-17` without `export`, your Java application will not see it because it runs as a child process of the shell.

**Shell configuration files.** These files run automatically when you start a shell, and they are where you put environment variables, aliases, and customizations that you want every time:

- **`~/.bashrc`** — runs every time you open a new interactive Bash shell. This is where most people put their customizations: aliases (`alias ll='ls -la'`), PATH modifications, prompt customization.
- **`~/.bash_profile`** or **`~/.profile`** — runs once when you log in (a "login shell"). SSH sessions are login shells. Opening a new terminal tab on your laptop might or might not be a login shell depending on your terminal emulator.
- **`~/.zshrc`** — the equivalent of `.bashrc` for Zsh (the default shell on macOS).

The login-vs-interactive distinction causes real problems. You add `export PATH=$PATH:/opt/myapp/bin` to `.bashrc`, and it works in your terminal. But a cron job runs in a non-interactive, non-login shell, so it does not source `.bashrc`, and your command is "not found." Understanding which config file runs when saves you from these maddening bugs.

**Common SRE scenarios where this matters:**

- A deployment script fails because the `PATH` on the server does not include the directory where your tool is installed.
- An application cannot connect to the database because the `DATABASE_URL` environment variable is set in the user's shell but not in the systemd service file (systemd services do not inherit your shell environment).
- CI/CD pipelines behave differently from local development because the environment variables are different.
- You SSH into a server and your aliases are gone because the server has a vanilla `.bashrc`.

A practical exercise: check your `PATH` with `echo $PATH`, then use `which` to find where common commands live. Add a directory to your PATH in `.bashrc`, open a new terminal, and verify it works. Then set an environment variable without `export` and try to access it from a child process (`bash -c 'echo $MY_VAR'`) — notice it is empty. Then export it and try again.

<!-- RESOURCES -->

- [Environment Variables in Linux - DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-read-and-set-environmental-and-shell-variables-on-linux) -- type: tutorial, time: 25m
- [Bash Startup Files Explained - GNU Manual](https://www.gnu.org/software/bash/manual/html_node/Bash-Startup-Files.html) -- type: reference, time: 15m
- [The Twelve-Factor App - Config](https://12factor.net/config) -- type: article, time: 10m
- [Understanding PATH - Linux Handbook](https://linuxhandbook.com/path-variable/) -- type: tutorial, time: 15m
- [Dotfiles Guide - GitHub](https://dotfiles.github.io/) -- type: reference, time: 30m
