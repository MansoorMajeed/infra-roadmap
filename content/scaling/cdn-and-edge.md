---
id: "cdn-and-edge"
title: "CDNs and Edge Caching"
zone: "scaling"
edges:
  from:
    - id: "browser-caching"
      question: "Browser caching helps returning visitors. But first-time users still download assets from a server far away. How do I fix that?"
      detail: "Cache headers tell browsers to keep files they already have. But a first-time visitor in Singapore still downloads your CSS and images from a server in us-east-1 — 200ms of latency before anything renders. A CDN caches those assets at edge locations worldwide and serves them from the nearest one."
  to: []
difficulty: 1
tags: ["cdn", "cloudfront", "edge", "caching", "latency", "static-assets", "performance", "aws"]
category: "concept"
milestones:
  - "Set up CloudFront in front of an S3 bucket serving static assets"
  - "Understand what a cache-control header does and how to set appropriate TTLs"
  - "Configure CloudFront to forward requests to your origin for dynamic content"
  - "Understand the difference between a CDN cache hit and a cache miss"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
