---
id: "browser-caching"
title: "Browser Caching"
zone: "scaling"
edges:
  from:
    - id: "database-replication"
      question: "The database scales for reads. But my servers are still sending the same images, CSS, and JS files on every single request. Is there a way to stop that?"
      detail: "Every time a user loads a product page, their browser fetches your logo, your CSS, your JavaScript bundle — again. These files haven't changed. You're burning server bandwidth and making users wait for files they already have. HTTP has a built-in mechanism to fix this: cache headers."
  to:
    - id: "cdn-and-edge"
      question: "Browser caching helps repeat visitors. What about users loading the site for the first time, from far away?"
      detail: "Cache headers eliminate redundant downloads for returning users. But a first-time visitor in Singapore still has to download your assets from a server in us-east-1. A CDN fixes this by serving those assets from an edge location near the user."
difficulty: 1
tags: ["caching", "cache-control", "etag", "http", "browser", "static-assets", "performance"]
category: "concept"
milestones:
  - "Understand what a Cache-Control header does and the difference between max-age and no-cache"
  - "Explain what an ETag is and how conditional requests work"
  - "Set appropriate cache headers for static assets (images, CSS, JS) vs dynamic responses"
  - "Understand cache busting and why you need it when assets change"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
