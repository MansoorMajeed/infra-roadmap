---
id: browser-caching
title: Browser Caching
zone: scaling
edges:
  to:
    - id: cdn-and-edge
      question: >-
        Browser caching helps repeat visitors. What about users loading the site
        for the first time, from far away?
      detail: >-
        Repeat visitors are faster now, but someone opening the site for the
        first time from the other side of the world is still hitting my single
        server. That initial load is slow and I don't know how to fix it
        without moving the server closer to them somehow.
difficulty: 1
tags:
  - caching
  - cache-control
  - etag
  - http
  - browser
  - static-assets
  - performance
category: concept
milestones:
  - >-
    Understand what a Cache-Control header does and the difference between
    max-age and no-cache
  - Explain what an ETag is and how conditional requests work
  - >-
    Set appropriate cache headers for static assets (images, CSS, JS) vs dynamic
    responses
  - Understand cache busting and why you need it when assets change
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
