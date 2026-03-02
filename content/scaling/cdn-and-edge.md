---
id: cdn-and-edge
title: CDNs and Edge Caching
zone: scaling
edges:
  to: []
difficulty: 1
tags:
  - cdn
  - cloudfront
  - edge
  - caching
  - latency
  - static-assets
  - performance
  - aws
category: concept
milestones:
  - Set up CloudFront in front of an S3 bucket serving static assets
  - Understand what a cache-control header does and how to set appropriate TTLs
  - Configure CloudFront to forward requests to your origin for dynamic content
  - Understand the difference between a CDN cache hit and a cache miss
---

A CDN (Content Delivery Network) is a globally distributed network of cache servers. Instead of serving all your assets from one origin server in us-east-1, a CDN copies your content to dozens of edge locations worldwide. A user in Singapore gets your images and CSS from a server in Singapore, not from Virginia. The result: faster first loads for global users and dramatically less traffic hitting your origin.

<!-- DEEP_DIVE -->

## How CDNs work

When a user requests a cacheable resource through a CDN, the request goes to the nearest edge location (point of presence). If the edge has a cached copy, it serves it directly without touching your origin server. If it doesn't (a cache miss), the edge fetches the resource from your origin, caches it, and serves it. Every subsequent request from any user near that edge location gets the cached copy.

Your DNS points to the CDN. Users never directly resolve your origin server's IP. The CDN is a global caching layer with automatic geographic routing built in.

## CloudFront on AWS

CloudFront is AWS's CDN. Setting it up involves:

1. Create a **distribution** in the CloudFront console
2. Set an **origin**: either an S3 bucket (for static assets) or your ALB/EC2 (for dynamic content)
3. Configure **cache behaviors**: which URL paths to cache, how long (TTL), and which headers to pass through to the origin
4. Update your DNS (or your asset URLs) to point to the CloudFront distribution domain (e.g., `d1234abcd.cloudfront.net`)

For static assets, point CloudFront at an S3 bucket. Upload your CSS, JS, and images to S3; CloudFront distributes them globally. No EC2 instance needed for static file serving.

For dynamic content, you can put CloudFront in front of your ALB. CloudFront will cache responses with appropriate `Cache-Control` headers and pass through uncacheable requests to the ALB. This also lets CloudFront absorb DDoS traffic before it reaches your instances.

## Cache behavior configuration

The most important per-behavior settings:

- **TTL**: minimum, maximum, and default TTL for cached responses. CloudFront respects `Cache-Control: max-age` from the origin up to your configured maximum.
- **Cache key**: what combination of URL, headers, query strings, and cookies determines if two requests are for the "same" resource. Narrower cache keys = higher hit rates.
- **Compress**: CloudFront can compress responses automatically (gzip, Brotli). Enable this — it reduces transfer size by 60-80% for text content.
- **Viewer protocol policy**: HTTP or HTTPS only. Set HTTPS only or redirect HTTP → HTTPS.

## Cache invalidation

When you deploy new static assets, CDN edge caches still have the old versions. Two ways to handle this:

1. **Content-hashed filenames** (preferred): `app.a3f9b1c.js` — the URL changes when content changes, so old caches naturally expire while the CDN caches the new URL separately.

2. **Explicit invalidation**: call the CloudFront API to invalidate specific paths (`/static/*`) or all paths (`/*`). CloudFront propagates the invalidation to all edges within a few minutes. Use sparingly — there's a cost per invalidation path after the first 1000/month.

## Beyond static assets

Modern CDNs do more than serve files:
- **SSL termination**: CloudFront handles TLS globally, near the user, using certificates from AWS Certificate Manager
- **DDoS protection**: CloudFront (with AWS Shield) absorbs volumetric attacks before they reach your origin
- **Edge functions**: Lambda@Edge and CloudFront Functions let you run code at edge locations — for A/B testing, URL rewrites, auth token validation
- **Caching dynamic responses**: product pages, category listings — anything with appropriate Cache-Control headers

<!-- RESOURCES -->

- [AWS CloudFront Getting Started](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.html) -- type: docs, time: 30m
- [CDN Concepts - Cloudflare Learning](https://www.cloudflare.com/learning/cdn/what-is-a-cdn/) -- type: article, time: 10m
- [CloudFront with S3 Tutorial](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStartedCreateDistribution.html) -- type: tutorial, time: 30m
