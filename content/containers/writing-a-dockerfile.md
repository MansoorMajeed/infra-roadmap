---
id: writing-a-dockerfile
title: Writing a Dockerfile
zone: containers
edges:
  to:
    - id: docker-compose-dev
      question: >-
        I can build an image. My app needs a database too — how do I run them
        together?
      detail: >-
        I've got my app containerized, but it needs Postgres running alongside
        it. Right now I'm starting them separately by hand every time. There has
        to be a way to declare the whole stack and spin everything up together.
    - id: image-optimization
      question: My image works but it's 1.2GB. How do I make it smaller?
      detail: >-
        It takes forever to push and pull. I'm not sure what's in there or why
        it's so big. And every time I change one line of code the whole thing
        rebuilds from scratch — there must be a smarter way to do this.
    - id: debugging-dockerfile-builds
      question: My docker build is failing and I have no idea why.
      detail: >-
        The error message points at a RUN command but I can't tell what actually
        went wrong inside it. And sometimes it's not a failure — the image builds
        fine but the app inside doesn't behave the way I expect.
difficulty: 2
tags:
  - docker
  - dockerfile
  - containers
  - build
category: practice
milestones:
  - Write a Dockerfile for your application
  - Build the image locally with docker build
  - Run the container with docker run and verify it works
  - Use a multi-stage build to keep the final image small
  - Understand which files to exclude with .dockerignore
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
