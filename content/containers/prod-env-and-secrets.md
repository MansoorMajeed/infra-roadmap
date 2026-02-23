---
id: prod-env-and-secrets
title: Environment Config and Secrets in Production
zone: containers
edges:
  to:
    - id: healthchecks-and-monitoring
      question: Config is sorted. How do I know if the containers are actually healthy?
      detail: >-
        Everything seems to be running, but "seems to" isn't good enough in
        production. I want to know if a container is actually serving traffic
        correctly, not just that the process is alive.
difficulty: 2
tags:
  - docker
  - production
  - secrets
  - environment
  - configuration
category: practice
milestones:
  - Understand why you must never bake secrets into Docker images
  - Use env_file in Compose to inject config from a file not committed to git
  - Understand the difference between build-time ARG and runtime ENV
  - Know the options for secrets in production (env vars, mounted files, secret managers)
  - Use a mounted secrets file as a step up from plain env vars
  - Know what to do when a secret rotates — how to update without downtime
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
