---
id: docker-compose-dev
title: Docker Compose for Local Development
zone: containers
edges:
  to:
    - id: building-images-in-ci
      question: Local setup works. How do I build images automatically in CI?
      detail: >-
        I'm running docker build manually on my laptop every time I make a
        change. That's not sustainable — I need this to happen automatically
        when I push code, not something I have to remember to do.
    - id: container-networking
      question: My services talk to each other in Compose, but I don't understand how. What's actually happening?
      detail: >-
        I just wrote `db` in my app's connection string and it worked. But I
        have no idea why. What if I need to connect containers that aren't in
        the same Compose file? Or debug a networking issue between services?
    - id: debugging-compose
      question: Something's wrong with my Compose setup and I can't figure out what.
      detail: >-
        One service keeps restarting, another can't reach the database even though
        they're in the same Compose file. I'm not sure how to read the logs across
        multiple services or tell whether it's a config issue or a networking issue.
difficulty: 1
tags:
  - docker
  - docker-compose
  - local-dev
  - containers
category: practice
milestones:
  - Write a docker-compose.yml that runs your app and its dependencies
  - Start and stop the full stack with docker compose up/down
  - Use volumes to persist data across container restarts
  - Use environment variables to configure services per environment
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
