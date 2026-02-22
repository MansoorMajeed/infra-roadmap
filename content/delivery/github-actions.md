---
id: "github-actions"
title: "Your First Pipeline with GitHub Actions"
zone: "delivery"
edges:
  from:
    - id: "what-is-ci-cd"
      question: "CI/CD makes sense. How do I set one up?"
      detail: "GitHub Actions is the easiest on-ramp: it's built into GitHub, free for public repos, and triggered automatically on every push. You define your pipeline in a YAML file and GitHub runs it for you."
  to:
    - id: "build-and-test-pipeline"
      question: "I have a pipeline running. How do I make it properly test and build my code?"
      detail: "A basic 'hello world' pipeline is a start, but a real pipeline has structured stages: install dependencies, run tests, build the artifact, then deploy. Let's build that."
    - id: "pipeline-secrets"
      question: "My pipeline needs to deploy to a server — it needs credentials. Where do I put secrets?"
      detail: "Your pipeline needs to SSH into servers, push to a registry, or call APIs. Those credentials can't live in your YAML file. GitHub Actions has a built-in secrets store, and there are patterns for using them safely."
difficulty: 1
tags: ["github-actions", "ci-cd", "yaml", "pipelines", "automation"]
category: "tool"
milestones:
  - "Create a .github/workflows/ directory and write your first workflow YAML"
  - "Trigger a pipeline on push to main"
  - "Read the pipeline output in the GitHub Actions UI"
  - "Understand what a job, step, and runner are"
---

GitHub Actions is a CI/CD platform built directly into GitHub. You describe your pipeline in a YAML file, commit it to your repo under `.github/workflows/`, and GitHub runs it automatically on every push — on their infrastructure, for free on public repos.

No separate CI service to sign up for, no webhooks to configure. Push code, pipeline runs, results appear in the Actions tab.

<!-- DEEP_DIVE -->

## The anatomy of a workflow

A workflow file lives at `.github/workflows/<name>.yml`. Every workflow has three parts: when to run (triggers), what machines to run on (runners), and what to do (jobs and steps).

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run tests
        run: pytest
```

- **`on`** — what triggers the workflow. `push` to main and any pull request.
- **`jobs`** — one or more parallel jobs. Each job gets a fresh runner.
- **`runs-on`** — the runner type. `ubuntu-latest` is the standard choice.
- **`steps`** — the sequence of commands within a job. Each step either uses a pre-built action (`uses:`) or runs a shell command (`run:`).

## Actions vs run steps

A **step** using `uses:` runs a pre-built Action from the marketplace. `actions/checkout@v4` clones your repo — you'd need it on almost every job. `actions/setup-python@v5` installs Python. Actions are reusable building blocks.

A **step** using `run:` executes shell commands directly. Anything you'd run in a terminal works here.

## Triggers

```yaml
on:
  push:
    branches: [main]        # only on pushes to main
  pull_request:             # on any PR (any branch)
  workflow_dispatch:        # adds a manual "Run workflow" button in the UI
  schedule:
    - cron: "0 6 * * *"     # daily at 6 AM UTC
```

`workflow_dispatch` is useful for manually triggering a pipeline (e.g. a deploy job you don't want running automatically).

## Reading the output

After a workflow runs, go to the **Actions** tab in your GitHub repo. You'll see a list of workflow runs, each tied to a commit. Click one to see the jobs. Click a job to see every step's output, including failure messages and exit codes.

When a step fails, the job stops, turns red, and GitHub sends you an email.

## Multiple jobs

Jobs run in parallel by default. Use `needs:` to chain them:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps: [...]

  deploy:
    runs-on: ubuntu-latest
    needs: test        # only runs if test passes
    steps: [...]
```

This is the foundation of a real pipeline: test first, deploy only if tests pass.

<!-- RESOURCES -->

- [GitHub Actions Documentation](https://docs.github.com/en/actions) -- type: reference, time: 20min
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions) -- type: reference, time: 10min
