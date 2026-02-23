---
id: "text-editors-and-ides"
title: "Text Editors & IDEs"
zone: "foundations"
edges:
  from:
    - id: "the-terminal"
      question: "I need to write and edit files. What tools do I use?"
      detail: "You can navigate the filesystem and run commands, but now you need to actually create and modify files — code, config files, scripts. Choosing the right editor shapes your daily workflow. You'll need at least one terminal-based editor (like vim or nano) because you'll inevitably SSH into a remote server where VS Code isn't available."
  to:
    - id: "version-control-git"
      question: "I can edit files. But how do I track changes and collaborate?"
      detail: "I just broke something that was working yesterday and I have no idea what I changed. I've been overwriting files with no history of what they looked like before. And if someone else touches the same files at the same time, everything will be a mess. How do people actually manage this?"
difficulty: 1
tags: ["vim", "nano", "vscode", "editors", "ide", "tools"]
category: "tool"
milestones:
  - "Edit a file using vim or nano"
  - "Set up VS Code with a useful extension"
  - "Edit a configuration file on a remote server"
---

Code is just text, and you need a tool to write it. The tool you choose -- whether it is a minimal terminal editor like vim or a full-featured IDE like VS Code -- shapes your daily workflow more than almost any other decision. Learning at least one terminal-based editor is non-negotiable for SRE work because you will inevitably need to edit a config file on a remote server where VS Code is not available.

<!-- DEEP_DIVE -->

Let's start with the terminal editors because they are the ones that will save you in a pinch. **nano** is the friendly one -- open a file with `nano myfile.txt`, make your changes, press `Ctrl+O` to save, and `Ctrl+X` to exit. The commands are listed right at the bottom of the screen. It is the editor you reach for when you just need to quickly change one line in a config file and move on with your life.

**vim** is the powerful one, and it has a famously steep learning curve. Vim operates in modes: when you open a file with `vim myfile.txt`, you start in **Normal mode** where key presses are commands, not text input. Press `i` to enter **Insert mode** where you can actually type. Press `Esc` to go back to Normal mode. Type `:wq` and press Enter to save and quit. Type `:q!` to quit without saving. That is genuinely enough to get started. The internet is full of jokes about people getting trapped in vim, but once you learn the basics, it becomes incredibly efficient. The motions (`w` to jump a word, `dd` to delete a line, `yy` to copy a line, `p` to paste) let you edit text at the speed of thought once they become muscle memory.

Now for the tool you will probably spend most of your time in: **VS Code**. It has won the editor wars for good reason -- it is free, fast enough, has an enormous extension ecosystem, and works with every language. Install it, then add a few extensions to make your life better: the Python extension for Python development, GitLens for powerful Git integration, and Remote - SSH for editing files on remote machines directly from your local VS Code. That last one is a game-changer -- it bridges the gap between "comfortable local editor" and "needing to edit files on a server."

Why does editor choice matter for SRE and DevOps work specifically? Because you will constantly switch between contexts. One minute you are writing a Python script locally in VS Code, the next you are SSH-ed into a production server editing an Nginx config with vim, and then you are reviewing a Terraform file in a pull request. Being comfortable in at least one graphical editor and one terminal editor means you are never stuck. You do not need to master vim's every feature -- just know enough to open, edit, save, and quit without panicking.

Configuration files deserve special mention. As an SRE, you will edit YAML files (Kubernetes manifests, CI/CD pipelines), JSON files (tool configs), TOML files, INI files, and more. These files are extremely sensitive to formatting -- a single wrong indent in a YAML file can break your entire deployment. This is where editor features like syntax highlighting and auto-indentation go from "nice to have" to "preventing outages." Configure your editor to show whitespace characters and use consistent indentation, and future-you will be grateful.

<!-- RESOURCES -->

- [OpenVim - Interactive Vim Tutorial](https://www.openvim.com/) -- type: tutorial, time: 30m
- [VS Code Getting Started - Official Docs](https://code.visualstudio.com/docs/getstarted/introvideos) -- type: tutorial, time: 1h
- [The Missing Semester - Editors (MIT)](https://missing.csail.mit.edu/2020/editors/) -- type: course, time: 1h
- [Vim Adventures - Learn Vim by Playing a Game](https://vim-adventures.com/) -- type: interactive, time: 2h
- [nano Editor Basics - Linuxize](https://linuxize.com/post/how-to-use-nano-text-editor/) -- type: tutorial, time: 15m
