---
id: "manual-deploy-is-painful"
title: "Manual Deploys Are Painful"
zone: "delivery"
edges:
  from:
    - id: "deploying-your-code"
      zone: "running"
      question: "I've been deploying manually. There has to be a better way."
      detail: "You SSH in, git pull, pip install, systemctl restart — every single time. Six steps, every deploy. Miss one at 2 AM and the site is down. There is a better way."
  to:
    - id: "what-is-ci-cd"
      question: "What is CI/CD and how does it fix this?"
      detail: "I want to get to a point where I push code and it just ends up running somewhere — tests passing, deployed, without me doing anything manually. I've heard 'CI/CD' thrown around but I don't understand what it actually is or how it works."
difficulty: 1
tags: ["ci-cd", "deployment", "automation", "devops"]
category: "concept"
milestones:
  - "List every manual step in your current deploy process"
  - "Identify which steps could fail silently"
  - "Understand why manual deployments don't scale"
---

Every deploy is a ritual. SSH into the server, pull the latest code, install dependencies, run migrations, restart the service, check the logs, hope nothing broke. Miss one step — or run them out of order — and you've just taken down production.

This is fine once. It's unsustainable at any meaningful velocity, and it's a solved problem.

<!-- DEEP_DIVE -->

## The ritual

A typical manual deploy looks like this:

```bash
ssh user@yourserver.com
cd /opt/myapp
git pull origin main
pip install -r requirements.txt
python manage.py migrate
sudo systemctl restart myapp
sudo journalctl -u myapp -n 50
```

Seven commands. Every single time. In the right order. Without typos.

## Why this breaks down

**Human error is inevitable.** Step 4 works 99% of the time. The 1% it fails is always at 2 AM after a Friday release. You skip it because you're tired. Now you're debugging a dependency mismatch at midnight.

**No audit trail.** Who deployed what, when? When something breaks, you're guessing whether the last deploy caused it. With automation, every deploy is a timestamped, logged event tied to a specific commit.

**Can't scale.** Two engineers deploying manually means two people SSHing into the same server and potentially stepping on each other. Five engineers means chaos.

**Tests get skipped.** Running the test suite before a manual deploy is technically optional. Under pressure, it gets skipped. Bugs reach production that a 30-second automated check would have caught.

**Snowflake servers.** Every manual step you apply to a server makes it slightly different from every other server. Over time you get a snowflake: a server only you understand, that can't be reproduced if it dies.

## The hidden cost

The real damage isn't the time each deploy takes — it's the deploys you don't do. When deploying is painful, engineers batch changes into large releases instead of shipping small improvements continuously. Large releases mean more risk, more blast radius when something goes wrong, and longer feedback loops between writing code and seeing it work in production.

Teams with automated deployments ship many times a day. Teams with manual deployments ship once a week and call it bold.

<!-- RESOURCES -->

- [Google SRE Book: Release Engineering](https://sre.google/sre-book/release-engineering/) -- type: reference, time: 20min
