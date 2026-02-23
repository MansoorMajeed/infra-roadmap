---
id: "version-control-git"
title: "Version Control & Git"
zone: "building"
edges:
  from:
    - id: "dynamic-web-app"
      question: "I keep overwriting my own code. How do I track changes?"
      detail: "As your application grows, you will inevitably break something that used to work. Without version control, you are flying blind — you cannot undo mistakes, compare what changed, or collaborate without stepping on each other's toes. Git solves all of these problems, and every professional software team on the planet uses it."
  to:
    - id: "it-works-on-my-laptop"
      question: "I can manage my code properly now. How do I actually get it running for others?"
      detail: "My code is on GitHub but that doesn't mean anyone can actually use it — it's still just source code sitting in a repo. I want people to be able to open a browser and see a running app. How do I get from here to there?"
difficulty: 1
tags: ["git", "version-control", "github", "gitlab", "collaboration"]
category: "concept"
milestones:
  - "Initialize a Git repo, make commits, and view history"
  - "Create branches, make changes, and merge them"
  - "Push code to GitHub or GitLab and collaborate with others"
---

You have been building your app, and it is getting bigger. You made a change yesterday that broke something, and now you cannot remember what you changed or how to undo it. You are copying folders named `app_v2_final_FINAL` and praying. There has to be a better way — and there is. It is called Git.

<!-- DEEP_DIVE -->

**Git** is a version control system. It tracks every change you make to your code, who made it, and when. Think of it as an unlimited undo button with annotations. Every meaningful change is saved as a **commit** — a snapshot of your entire project at that moment.

```bash
# Start tracking a project
git init

# See what changed
git status

# Stage and commit changes
git add app.py
git commit -m "Add user registration endpoint"

# See the full history
git log --oneline
```

Every commit gets a unique hash (like `a3f82c1`). You can jump back to any commit, compare two commits, or see exactly what changed between them. When something breaks, `git diff` shows you what changed and `git checkout` lets you go back.

**Branches** are where Git gets powerful. A branch is a parallel version of your code. You can create a branch, experiment freely, and if it works, merge it back. If it does not work, delete the branch. Your main code is never touched:

```bash
# Create and switch to a new branch
git checkout -b add-shopping-cart

# Work on your feature... make commits...

# Switch back to main and merge
git checkout main
git merge add-shopping-cart
```

This is how teams work. Each person works on their own branch. Nobody steps on anyone else's work. When a feature is ready, it gets merged into the main branch.

**GitHub** (and GitLab, Bitbucket) is where your Git repository lives online. It is not the same as Git itself — Git is the tool, GitHub is a hosting service. Pushing your code to GitHub gives you:

- A backup of your entire project history
- A place for others to see and contribute to your code
- **Pull requests** — a way to propose changes and have them reviewed before merging
- **Issues** — a way to track bugs and feature requests

```bash
# Connect your local repo to GitHub
git remote add origin https://github.com/you/your-app.git

# Push your code
git push -u origin main
```

**Why does this matter for SRE/DevOps?** Everything in modern operations is code — infrastructure definitions, deployment scripts, monitoring configs, CI/CD pipelines. If it is not in Git, it does not exist. Version control is the foundation of:

- **Infrastructure as Code** — your server setup is versioned just like application code
- **CI/CD pipelines** — automated builds and deployments trigger on Git events
- **Incident response** — `git log` tells you exactly what changed and when, which is critical for debugging production issues
- **Collaboration** — multiple engineers can work on the same system without chaos

The `.gitignore` file tells Git which files to skip — things like compiled binaries, dependency folders (`node_modules/`, `venv/`), and secrets (`.env` files with API keys). Never commit secrets to Git. Once something is in Git history, it is very hard to fully remove.

<!-- RESOURCES -->

- [Pro Git Book (free)](https://git-scm.com/book/en/v2) -- type: book, time: varies
- [GitHub Skills](https://skills.github.com/) -- type: interactive, time: 2h
- [Oh My Git! - Game](https://ohmygit.org/) -- type: interactive, time: 1h
- [Git Branching Tutorial](https://learngitbranching.js.org/) -- type: interactive, time: 1h
