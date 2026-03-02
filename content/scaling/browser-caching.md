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

Every user visiting your site downloads your CSS, JavaScript, and images. Without browser caching, they download all of it again on every visit — even if nothing has changed since yesterday. Browser caching uses HTTP headers to tell the browser "you already have this, keep it and use it next time." Done right, repeat visitors load pages almost instantly with zero server requests for static assets.

<!-- DEEP_DIVE -->

## The Cache-Control header

`Cache-Control` is the primary header for controlling how long browsers cache responses.

```
Cache-Control: max-age=31536000, immutable
```

`max-age=31536000` means the browser can reuse this response for up to 31,536,000 seconds (one year) without even checking the server. `immutable` (supported by most modern browsers) is an additional hint that the content will never change — skip revalidation entirely.

For static assets with content-hashed filenames (like `app.a3f9b1c.js`), a one-year max-age is safe because the filename changes whenever the content changes.

For dynamic HTML responses:

```
Cache-Control: no-cache
```

`no-cache` does not mean "don't cache" — it means "cache it, but always revalidate with the server before using the cached copy." This lets the server return a `304 Not Modified` with no body if the content hasn't changed, saving bandwidth while ensuring freshness.

## ETags and conditional requests

An ETag is a fingerprint of a response (usually a hash of the content). The server includes it in the response:

```
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

On the next request, the browser sends:

```
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

If the content hasn't changed, the server returns `304 Not Modified` (no body, just headers). The browser uses its cached copy. This is a conditional request — the browser checks whether it needs to re-download before downloading.

This is cheaper than re-downloading content but still requires a round-trip to the server. For truly static assets with long max-age, the browser doesn't even make the request.

## Cache busting

Long cache TTLs create a problem: if you update a file, browsers that have it cached won't fetch the new version until the TTL expires (potentially a year away). The solution is **cache busting**: include a content hash in the filename.

```html
<script src="/static/app.a3f9b1c.js"></script>
```

When you update the file, the hash changes, the filename changes, and browsers treat it as a new resource and fetch it fresh. The old filename-based cache entry just expires naturally.

All modern frontend build tools (Vite, Webpack, esbuild) do this automatically.

## What to cache and for how long

| Resource type | `Cache-Control` | Rationale |
|---|---|---|
| Content-hashed JS/CSS/images | `max-age=31536000, immutable` | Filename changes when content changes |
| Non-hashed static assets (logo.png) | `max-age=86400` | Cache for a day, accept some lag |
| API responses | `no-cache` or `no-store` | Usually user-specific or frequently changing |
| HTML pages | `no-cache` | Always revalidate; want fresh deploys |
| Fonts | `max-age=31536000, immutable` | Rarely change, content-addressed |

## Setting headers

In Nginx:
```nginx
location ~* \.(js|css|png|jpg|gif|ico|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

In Python (Flask):
```python
@app.after_request
def set_cache_headers(response):
    if request.path.startswith('/static/'):
        response.headers['Cache-Control'] = 'public, max-age=31536000'
    return response
```

<!-- RESOURCES -->

- [HTTP Caching - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching) -- type: article, time: 20m
- [Cache-Control for Civilians (Harry Roberts)](https://csswizardry.com/2019/03/cache-control-for-civilians/) -- type: article, time: 15m
- [web.dev - Serve static assets with an efficient cache policy](https://web.dev/uses-long-cache-ttl/) -- type: article, time: 10m
