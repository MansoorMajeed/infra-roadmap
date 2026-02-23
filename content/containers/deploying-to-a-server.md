---
id: deploying-to-a-server
title: Running Containers on a Real Server
zone: containers
edges:
  to:
    - id: prod-env-and-secrets
      question: The app is running. How do I handle config and secrets properly in production?
      detail: >-
        I've got the container running on the server but I've been hardcoding
        values and I know that's wrong. Database passwords, API keys — I need
        a proper way to inject these without putting them in the image or
        committing them to git.
difficulty: 2
tags:
  - docker
  - production
  - deployment
  - docker-compose
  - containers
category: practice
milestones:
  - SSH into a server and pull a versioned image from a registry
  - Run the app with docker compose up -d using a production compose file
  - Set restart policies (unless-stopped) so the app survives reboots
  - Verify the deployment with docker ps and docker logs
  - Understand the difference between a local docker-compose.yml and a production override file
  - Know when single-server Compose is enough and when it isn't
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
