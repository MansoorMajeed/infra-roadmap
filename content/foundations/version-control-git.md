---
id: "version-control-git"
title: "Version Control with Git"
zone: "foundations"
edges:
  from:
    - id: "text-editors-and-ides"
      question: "I can edit files. But how do I track changes and collaborate?"
      detail: "You're editing code and config files, but what happens when you break something and need to go back? Or when multiple people need to work on the same files? You need a system that tracks every change, lets you rewind mistakes, and enables collaboration without chaos. That system is Git — the foundation of every modern development and infrastructure workflow."
  to:
    - id: "scripting-bash-python"
      question: "I can track my code. Now let me write something more powerful."
      detail: "You have your editor, you have version control — now it's time to write scripts that actually do useful work. Bash scripts let you automate terminal workflows, while Python gives you the power to process data, interact with APIs, and build real tools. Together, they're the bread and butter of SRE automation — turning repetitive manual tasks into one-command solutions."
difficulty: 1
tags: ["git", "version-control", "github", "collaboration", "commits", "branches"]
category: "tool"
milestones:
  - "Initialize a repo, make commits, and view the log"
  - "Create a branch, make changes, and merge it back"
  - "Push code to GitHub"
---

Git is the version control system that tracks every change you make to your code, lets you rewind to any previous state, and makes it possible for teams of hundreds of engineers to work on the same codebase without stepping on each other's toes. It is not optional -- every professional software and infrastructure workflow depends on Git, and understanding it deeply will pay dividends every single day of your career.

<!-- DEEP_DIVE -->

At its core, Git is a tool that takes snapshots of your project. Every time you **commit**, Git records the exact state of every tracked file at that moment. You can think of it like a save system in a video game -- you can always go back to any previous save. Run `git init` in a directory and it becomes a Git repository. Create a file, run `git add myfile.py` to stage it (tell Git you want to include it in the next snapshot), and then `git commit -m "Add my first file"` to create the snapshot. Run `git log` and you will see your commit with a unique hash, a timestamp, and your message.

**Branches** are where Git gets powerful. A branch is just a separate line of development. Say you want to try a risky change without messing up your working code. Run `git checkout -b experiment` to create and switch to a new branch. Make your changes, commit them. If the experiment works, you merge it back into your main branch with `git checkout main` followed by `git merge experiment`. If it was a disaster, just delete the branch with `git branch -d experiment` and your main branch is untouched. This workflow is the backbone of how professional teams build software -- every feature, every bug fix, every infrastructure change gets its own branch.

The real power unlocks when you connect your local repository to a **remote** like GitHub, GitLab, or Bitbucket. Run `git remote add origin https://github.com/yourusername/yourrepo.git` to link them, then `git push -u origin main` to upload your code. Now your code lives in the cloud, backed up and accessible from anywhere. Other people can **clone** your repository, make changes on their own branches, and submit **pull requests** (PRs) -- proposals to merge their changes into the main branch. Code review happens on PRs, and this is where teams catch bugs, share knowledge, and maintain quality.

For SRE and DevOps, Git is not just for application code. Your infrastructure definitions (Terraform files, Ansible playbooks, Kubernetes manifests) all live in Git. This practice is called **Infrastructure as Code** (IaC), and it means your entire infrastructure is versioned, reviewable, and reproducible. If a bad config change breaks production, you can look at the Git log to see exactly what changed, who changed it, and when. Then you revert the commit and you are back to a working state. This is infinitely better than someone manually editing a config on a server with no record of what happened.

A few practical tips that will save you headaches. First, write meaningful commit messages -- "fix bug" tells you nothing six months later, but "Fix nginx timeout by increasing proxy_read_timeout to 300s" tells you everything. Second, commit often in small, logical chunks rather than one massive commit at the end of the day. Third, learn `git diff` (shows what changed), `git stash` (temporarily shelves your changes), and `git blame` (shows who last modified each line of a file). These three commands will become your best friends during debugging sessions.

One thing that trips up beginners: Git and GitHub are not the same thing. Git is the version control tool that runs locally on your machine. GitHub is a web platform that hosts Git repositories and adds collaboration features like pull requests, issues, and actions. You can use Git without GitHub, but in practice, almost everyone uses some kind of remote hosting platform.

<!-- RESOURCES -->

- [Git Official Documentation - Getting Started](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control) -- type: docs, time: 1h
- [Learn Git Branching - Interactive Tutorial](https://learngitbranching.js.org/) -- type: interactive, time: 2h
- [GitHub Skills - Introduction to GitHub](https://skills.github.com/) -- type: course, time: 1h
- [The Missing Semester - Version Control (MIT)](https://missing.csail.mit.edu/2020/version-control/) -- type: course, time: 1h
- [Oh Shit, Git!?! - Common Git Mistakes and Fixes](https://ohshitgit.com/) -- type: reference, time: 15m
