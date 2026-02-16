---
id: "http-protocol"
title: "HTTP: How Browsers Talk to Servers"
zone: "networking"
edges:
  from:
    - id: "web-servers"
      question: "My web server is running. But how does the browser actually know how to talk to it?"
      detail: "You have Nginx serving your app on the local network. Your phone can reach it. But what exactly is the browser sending, and what is the server sending back? There is a protocol on top of TCP that defines the language — HTTP. Understanding HTTP methods, status codes, headers, and the request-response cycle is fundamental to everything on the web."
  to:
    - id: "ip-addresses-and-subnets"
      question: "HTTP works great on my local network. But how do IP addresses actually work beyond my WiFi?"
      detail: "You can make HTTP requests to your server using its local IP. But IP addresses are more than just numbers your router hands out. How are they structured? What is a subnet? How does a packet know which network to go to? Understanding IP addressing is how you go from 'it works on my WiFi' to understanding how the internet routes traffic globally."
difficulty: 1
tags: ["http", "https", "protocol", "status-codes", "methods", "curl", "application-layer"]
category: "concept"
milestones:
  - "Understand the HTTP request-response cycle with methods and status codes"
  - "Use curl to make GET, POST, PUT, and DELETE requests"
  - "Read and understand HTTP headers in browser dev tools"
---

Your web server is running and your phone can load the page. But what is actually happening? The browser is not just "connecting" — it is speaking a very specific language called HTTP. It sends a structured request, the server sends a structured response, and both sides know exactly what to expect because they follow the same protocol.

<!-- DEEP_DIVE -->

**HTTP** (Hypertext Transfer Protocol) is an **application layer** protocol. It sits on top of TCP — TCP handles the reliable delivery of bytes, and HTTP defines what those bytes mean. When you type a URL into your browser, here is what happens:

1. The browser opens a TCP connection to the server (port 80 for HTTP, 443 for HTTPS)
2. The browser sends an **HTTP request**
3. The server processes the request and sends back an **HTTP response**
4. The browser renders the response

An HTTP request looks like this:

```
GET /products HTTP/1.1
Host: 192.168.1.42:5000
Accept: text/html
User-Agent: Mozilla/5.0
```

The first line is the **request line**: the method (`GET`), the path (`/products`), and the HTTP version. The following lines are **headers** — metadata about the request. Then optionally a **body** (for POST/PUT requests).

**HTTP Methods** define what you want to do:

| Method | Purpose | Has Body? | Example |
|--------|---------|-----------|---------|
| **GET** | Retrieve data | No | Load a webpage, fetch an API response |
| **POST** | Send data to create something | Yes | Submit a form, create a user |
| **PUT** | Replace an existing resource | Yes | Update a user profile entirely |
| **PATCH** | Partially update a resource | Yes | Change just the email address |
| **DELETE** | Remove a resource | Usually no | Delete an account |
| **HEAD** | Same as GET but response has no body | No | Check if a resource exists |

**HTTP Status Codes** are the server's response — a three-digit number that tells the client what happened:

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 42

{"id": 1, "name": "Widget", "price": 10}
```

The major categories:
- **2xx — Success:** `200 OK` (here is your data), `201 Created` (new resource made), `204 No Content` (done, nothing to return)
- **3xx — Redirect:** `301 Moved Permanently` (use this new URL forever), `302 Found` (temporarily use this other URL), `304 Not Modified` (use your cached version)
- **4xx — Client error:** `400 Bad Request` (your request is malformed), `401 Unauthorized` (who are you?), `403 Forbidden` (I know who you are, but no), `404 Not Found` (that does not exist), `429 Too Many Requests` (slow down)
- **5xx — Server error:** `500 Internal Server Error` (something broke), `502 Bad Gateway` (the upstream server failed), `503 Service Unavailable` (server is overloaded or down), `504 Gateway Timeout` (upstream took too long)

**curl** is the command-line tool for making HTTP requests. It is the Swiss Army knife of networking and every SRE uses it daily:

```bash
# Simple GET request
curl http://192.168.1.42:5000/products

# See the full request and response headers
curl -v http://192.168.1.42:5000/products

# POST with JSON body
curl -X POST http://192.168.1.42:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com"}'

# Just get the status code
curl -o /dev/null -s -w "%{http_code}" http://192.168.1.42:5000/health

# PUT request
curl -X PUT http://192.168.1.42:5000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Smith", "email": "alice@example.com"}'

# DELETE request
curl -X DELETE http://192.168.1.42:5000/api/users/1

# Follow redirects
curl -L http://example.com
```

The `-v` (verbose) flag is your best friend when debugging. It shows you exactly what is being sent and received — every header, every status code, the full conversation between client and server.

**The application layer** is the top of the networking stack. The model looks like this:

| Layer | Protocol | What it does |
|-------|----------|--------------|
| Application | HTTP, DNS, SMTP | Defines the meaning of the communication |
| Transport | TCP, UDP | Reliable (or fast) delivery of data |
| Network | IP | Addressing and routing between networks |
| Link | Ethernet, WiFi | Physical transmission between devices |

HTTP does not care how TCP delivers the bytes. TCP does not care what the bytes mean. Each layer does one job and trusts the layer below it. This is why you can run HTTP over WiFi, Ethernet, cellular, or satellite — HTTP speaks TCP, and TCP works on anything.

**Headers** carry important metadata. Some you will see constantly:

- `Content-Type: application/json` — the body is JSON
- `Authorization: Bearer eyJ...` — authentication token
- `Cache-Control: max-age=3600` — cache this for an hour
- `X-Request-ID: abc-123` — unique ID for tracing requests through systems
- `User-Agent: curl/7.68.0` — what client made the request

**HTTPS** is HTTP with encryption (TLS/SSL). The data is the same, but it is encrypted in transit so nobody between the client and server can read it. Port 443 instead of 80. Every production website uses HTTPS — browsers now warn users about sites that do not.

<!-- RESOURCES -->

- [MDN - An overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview) -- type: reference, time: 20m
- [HTTP Status Codes Reference](https://httpstatuses.com/) -- type: reference, time: 10m
- [curl Tutorial](https://curl.se/docs/tutorial.html) -- type: tutorial, time: 30m
- [Julia Evans - HTTP Zine](https://wizardzines.com/zines/http/) -- type: zine, time: 15m
- [Everything curl (free book)](https://everything.curl.dev/) -- type: book, time: varies
