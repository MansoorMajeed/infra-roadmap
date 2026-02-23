---
id: "docker-compose-dev"
title: "Docker Compose for Local Development"
zone: "containers"
edges:
  from:
    - id: "writing-a-dockerfile"
      question: "My app needs a database and a cache. How do I run the whole stack together?"
  to:
    - id: "building-images-in-ci"
      question: "Local setup works. How do I build images automatically in CI?"
      detail: "I'm running docker build manually on my laptop every time I make a change. That's not sustainable — I need this to happen automatically when I push code, not something I have to remember to do."
difficulty: 1
tags: ["docker", "docker-compose", "local-dev", "containers"]
category: "practice"
milestones:
  - "Write a docker-compose.yml that runs your app and its dependencies"
  - "Start and stop the full stack with docker compose up/down"
  - "Use volumes to persist data across container restarts"
  - "Use environment variables to configure services per environment"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
