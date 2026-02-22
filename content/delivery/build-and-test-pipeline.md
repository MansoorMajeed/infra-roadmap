---
id: "build-and-test-pipeline"
title: "Build and Test in Your Pipeline"
zone: "delivery"
edges:
  from:
    - id: "github-actions"
      question: "I have a basic pipeline. What stages should it have?"
      detail: "A real pipeline isn't just 'run the app' — it has distinct stages: install dependencies, run the test suite, build the artifact. Each stage should fail fast and tell you exactly what broke."
    - id: "pipeline-secrets"
      question: "Secrets are handled. Now how do I build a proper test and build pipeline?"
      detail: "With credentials sorted, you can now focus on the actual pipeline structure: run tests on every push, fail the pipeline if tests fail, and only build and deploy when everything passes."
  to:
    - id: "containerization"
      zone: "containers"
      question: "Tests pass on every commit. How do I package the app to actually ship it?"
    - id: "iac-intro"
      question: "My pipeline is solid. The servers it deploys to were set up by hand — can I codify that too?"
difficulty: 1
tags: ["ci-cd", "testing", "pipelines", "automation", "github-actions"]
category: "practice"
milestones:
  - "Run your test suite automatically on every push"
  - "Fail the pipeline if any test fails"
  - "Cache dependencies so the pipeline doesn't reinstall everything from scratch"
  - "Understand what a pipeline artifact is"
---

A real CI pipeline has stages: install dependencies, run tests, build the artifact. Each stage must fail fast — if tests fail, nothing after them runs. You never ship untested code.

The goal is a pipeline that takes three minutes and gives you a clear green or red signal on every push.

<!-- DEEP_DIVE -->

## A complete test + build workflow

Here's a Python project as an example, but the shape is the same for any language:

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

      - name: Cache dependencies
        uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('requirements.txt') }}

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run tests
        run: pytest --tb=short

      - name: Lint
        run: ruff check .
```

The pipeline installs dependencies, runs the test suite, and lints the code. If any step returns a non-zero exit code, the job fails and stops.

## Caching dependencies

CI runners start fresh on every run. Without caching, `pip install` (or `npm install`, `bundle install`, etc.) downloads the entire dependency graph from scratch every time. On a large project, that's minutes.

`actions/cache` caches the package directory and restores it when the cache key matches. The key includes a hash of your lockfile — if `requirements.txt` changes, the cache is invalidated and dependencies are re-installed. If it hasn't changed, the cache is restored in seconds.

This alone can cut pipeline time by 50–80% for dependency-heavy projects.

## Fail fast, fail loud

Pipelines should fail at the earliest possible point. Don't run integration tests if unit tests fail. Don't build a Docker image if linting fails.

Structure your steps so the fastest checks run first:

1. Lint (seconds) — catches syntax errors and style issues immediately
2. Unit tests (fast) — catch logic errors without external dependencies
3. Integration tests (slower) — require databases, network, etc.
4. Build artifact — only runs if everything above passes

## Matrix builds

If your code needs to run on multiple Python versions, Node versions, or operating systems:

```yaml
strategy:
  matrix:
    python-version: ["3.11", "3.12", "3.13"]

steps:
  - uses: actions/setup-python@v5
    with:
      python-version: ${{ matrix.python-version }}
```

GitHub runs a separate job for each matrix entry in parallel. If it fails on 3.12 but not 3.11, you know immediately.

## Pipeline artifacts

An artifact is a file produced by the pipeline that you want to keep — a compiled binary, a test coverage report, a built wheel. Upload them with `actions/upload-artifact`:

```yaml
- name: Upload coverage report
  uses: actions/upload-artifact@v4
  with:
    name: coverage-report
    path: htmlcov/
```

Artifacts persist for 90 days by default and are downloadable from the Actions UI. For deployment pipelines, the built Docker image in a registry is the artifact — you don't need `upload-artifact` for images specifically.

<!-- RESOURCES -->

- [GitHub Actions: Caching Dependencies](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows) -- type: reference, time: 10min
- [GitHub Actions: Using a Matrix](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs) -- type: reference, time: 10min
