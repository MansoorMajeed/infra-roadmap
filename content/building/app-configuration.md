---
id: app-configuration
title: Application Configuration
zone: building
edges:
  to:
    - id: it-works-on-my-laptop
      question: >-
        Config is separated from code now. But how do I get this running
        on an actual server instead of just my laptop?
      detail: >-
        My app reads config from environment variables, secrets are out of
        the source code, and I can switch between dev and production settings
        without changing any code. But it's still running on localhost. How
        do I actually deploy this thing?
difficulty: 1
tags:
  - configuration
  - environment-variables
  - twelve-factor
  - secrets
  - config-files
  - dotenv
category: concept
milestones:
  - Move hardcoded values (DB URLs, API keys) out of source code into environment variables
  - Understand the 12-factor app approach to configuration
  - Use a .env file for local development without committing it to git
  - Explain why config should change between environments but code should not
---

Your database password is in your source code. Your API key is on line 42 of `app.py`. The URL for your database is hardcoded to `localhost`. This works on your machine, but the moment you try to run this anywhere else — a server, a teammate's laptop, a CI pipeline — everything breaks because the config is wrong and it's baked into the code.

Application configuration is everything that changes between environments but shouldn't require a code change: database connection strings, API keys, feature flags, external service URLs, debug settings. The principle is simple: **config belongs in the environment, not in the code.**

<!-- DEEP_DIVE -->

## Why hardcoded config breaks things

When config is in your source code, you have a few bad options:

- **One codebase, one environment.** The code says `localhost:5432` so it only works on your laptop. To run it on a server you edit the code — and now your local version is broken.
- **Config files checked into git.** You have `config_dev.py` and `config_prod.py`. Someone commits a production database password to a public repo. You now have a security incident.
- **Branching for environments.** The `main` branch has production config, `dev` has dev config. Merging is a nightmare and someone will deploy dev config to production eventually.

All of these are symptoms of the same problem: config and code are tangled together.

## Environment variables

The standard solution is **environment variables**. Your app reads config from the environment at runtime:

```python
import os

DATABASE_URL = os.environ["DATABASE_URL"]
SECRET_KEY = os.environ["SECRET_KEY"]
DEBUG = os.environ.get("DEBUG", "false").lower() == "true"
```

On your laptop, you set `DATABASE_URL=postgresql://localhost:5432/myapp`. On the server, it's `DATABASE_URL=postgresql://prod-db:5432/myapp`. Same code, different config. The app doesn't know or care where it's running.

For local development, a `.env` file (loaded by a library like `python-dotenv` or `dotenv` in Node) keeps your environment variables in one place without setting them globally. **This file goes in `.gitignore` — never commit it.**

## The 12-factor approach

The [12-factor app](https://12factor.net/config) methodology (written by Heroku's founders) codifies this as a principle: strict separation of config from code. Config is anything that varies between deploys — credentials, resource handles, per-deploy values. Code is everything else.

The test: could you open-source your codebase right now without compromising any credentials? If yes, your config separation is correct. If no, secrets are leaking into your code.

## Feature flags

Feature flags are config that controls behavior: `ENABLE_NEW_CHECKOUT=true`. They let you deploy code that isn't active yet, enable features for specific users, or kill a misbehaving feature without a redeploy. At small scale, environment variables work fine for this. At larger scale, dedicated feature flag services (LaunchDarkly, Unleash) give you runtime toggling without restarts.

<!-- RESOURCES -->

- [The Twelve-Factor App — Config](https://12factor.net/config) -- type: guide, time: 10m
- [python-dotenv documentation](https://saurabh-kumar.com/python-dotenv/) -- type: tool, time: 10m
