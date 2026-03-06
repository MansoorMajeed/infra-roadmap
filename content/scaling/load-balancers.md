---
id: load-balancers
title: Load Balancers
zone: scaling
edges:
  to:
    - id: session-problem
      question: >-
        Load balancer is in place. But now users keep getting randomly logged
        out. What's going on?
      detail: >-
        Everything looked fine after I added the load balancer, but now users
        keep complaining they're getting signed out mid-session. I didn't change
        any auth code — why is this suddenly happening?
    - id: application-caching
      question: >-
        The site is slow even though the servers aren't overloaded. Every
        request hits the database for the same data over and over.
      detail: >-
        I watched the queries — the same product pages, the same category
        listings, the same results being fetched from the database on every
        single request. The servers have capacity but the database is the
        bottleneck. Can I just keep frequently-used data somewhere faster?
    - id: rate-limiting
      question: The load balancer is distributing traffic. But bots and badly-written clients are hammering my API with hundreds of requests a second. How do I protect against that?
      detail: >-
        The LB handles normal traffic fine. But scrapers, abusive clients, and
        traffic spikes from retrying clients can still overwhelm my servers. A
        few bad actors shouldn't be able to take down the whole service. How do
        I throttle individual clients without affecting everyone else?
difficulty: 1
tags:
  - load-balancer
  - alb
  - aws
  - high-availability
  - health-checks
  - target-groups
category: concept
milestones:
  - Create an AWS Application Load Balancer with a target group
  - Register two EC2 instances behind the load balancer
  - Configure health checks and watch the ALB remove an unhealthy instance
  - Understand the difference between a Layer 4 and Layer 7 load balancer
---

A load balancer sits in front of your application servers and distributes incoming requests across them. When you have three app servers, the load balancer is the single entry point — it accepts the connection, picks a backend server, and forwards the request. It's the traffic cop that makes horizontal scaling possible.

<!-- DEEP_DIVE -->

## What a load balancer actually does

When a request arrives at the load balancer, it selects one of the registered backend servers (called targets) and proxies the request to it. The client talks to the load balancer's IP address; the load balancer talks to the backend. From the backend's perspective, every request looks like it came from the load balancer.

Most cloud load balancers also perform **health checks**: they periodically send a request to each backend (typically an HTTP `GET /health` endpoint or a TCP connection) and mark backends as healthy or unhealthy. Traffic is only sent to healthy backends. If a server crashes, the load balancer detects the failed health check within seconds and stops sending it traffic. This is where availability comes from — not just performance.

## Layer 4 vs Layer 7

Load balancers operate at different layers of the network stack:

**Layer 4 (transport layer)** balancers forward TCP or UDP connections. They see source/destination IP and port, but not the HTTP content. They're fast and simple — they just route connections — but they can't make routing decisions based on URL path, cookies, or headers.

**Layer 7 (application layer)** balancers understand HTTP. They can route based on URL path (`/api/` → one set of servers, `/static/` → another), read cookies, terminate TLS, add headers, and inspect request content. AWS's **Application Load Balancer (ALB)** is a Layer 7 load balancer; the older **Classic Load Balancer** and **Network Load Balancer** operate at Layer 4.

For most web applications, a Layer 7 load balancer is what you want. The ability to route by URL, terminate TLS in one place, and make routing decisions based on headers covers the vast majority of use cases.

## Setting one up on AWS

1. Create an **Application Load Balancer** in the EC2 console. Choose internet-facing (or internal for backend services). Configure your VPC and subnets — pick at least two availability zones.
2. Create a **Target Group** — a logical group of backends. Register your EC2 instances in it. Configure the health check: path (`/health`), protocol, and thresholds (how many successes before marking healthy, how many failures before marking unhealthy).
3. Create a **Listener** on the ALB — port 80 (or 443 with a TLS certificate). Attach a rule that forwards traffic to your target group.

Your domain should now point to the ALB's DNS name, not directly to your EC2 instances. The instances can have private IPs only — they don't need to be publicly accessible.

## Algorithms: round robin and beyond

By default, ALBs use **round robin** — requests are distributed evenly across healthy backends in order. This works well when requests have similar cost. Other algorithms:

- **Least connections**: send to the backend with the fewest active connections — better when some requests take much longer than others
- **IP hash**: hash the client IP to always send the same client to the same backend — this is effectively sticky sessions at the network layer, with all its problems

Round robin is fine for most applications. The session problem (coming up next) should be solved in your application layer, not by messing with the load balancer's routing algorithm.

<!-- RESOURCES -->

- [AWS Application Load Balancer Documentation](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html) -- type: docs, time: 30m
- [AWS Load Balancer Types Compared](https://aws.amazon.com/elasticloadbalancing/features/) -- type: docs, time: 10m
- [NGINX Load Balancing](https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/) -- type: docs, time: 15m
