---
id: auto-scaling-groups
title: Auto Scaling Groups
zone: scaling
edges:
  to:
    - id: redis-scaling
      question: >-
        My Python servers auto-scale. Now Redis is the single point of failure
        and it's hitting its limits.
      detail: >-
        All those app servers are hammering one Redis instance for every session
        read and write. Redis is fast but has memory limits, and a single node
        going down takes out every user's session. Time to scale Redis itself.
    - id: launch-templates-and-amis
      question: 'When the ASG spins up a new VM, how does it know what software to run?'
      detail: >-
        When the ASG spins up a new VM at 2am during a traffic spike, it needs
        to just work — my app installed, configured, serving traffic within
        minutes. But how does a brand new blank VM know what to run? I can't SSH
        into every new instance manually every time the group scales out.
    - id: connection-pooling
      question: My app servers are scaling out, but now the database is throwing "too many connections" errors before they've even taken any load. What's happening?
      detail: >-
        Every app server opens its own persistent connection pool to the
        database. With ten servers each holding twenty connections open, that's
        already two hundred — and Postgres has a hard limit. When the ASG scales
        out during a spike I start seeing connection errors before the new
        servers have served a single request.
    - id: async-job-queues
      question: My servers scale fine for normal requests — but some operations take 10 seconds and block the whole request. What do I do with those?
      detail: >-
        Sending confirmation emails, resizing uploaded images, generating
        invoices — these are slow no matter how many servers I have. They block
        the web worker for the whole duration, and if they fail the user sees an
        error. I keep thinking there must be a way to just hand them off and
        respond immediately.
difficulty: 2
tags:
  - auto-scaling
  - asg
  - aws
  - ec2
  - launch-template
  - scaling-policies
  - elasticity
category: practice
milestones:
  - Create a Launch Template that installs and starts your application
  - 'Create an Auto Scaling Group with a minimum, maximum, and desired capacity'
  - Attach the ASG to your load balancer's target group
  - Set a scaling policy that adds instances when CPU exceeds 70%
  - Watch the ASG replace a terminated instance automatically
---

An Auto Scaling Group (ASG) is an AWS construct that manages a fleet of EC2 instances automatically. You define the minimum and maximum size of the fleet, set policies for when to scale in and out, and the ASG handles the rest: launching new instances when load is high, terminating them when it drops, replacing instances that fail health checks. It's the automation layer that makes horizontal scaling practical to operate.

<!-- DEEP_DIVE -->

## The core concepts

An ASG needs three things:

1. **A Launch Template**: the blueprint for new instances — which AMI to use, instance type, security groups, IAM role, user-data script. When the ASG decides to launch a new instance, it uses this template.

2. **Capacity settings**: minimum, maximum, and desired count. The ASG will always maintain at least the minimum and never exceed the maximum. Desired is the current target that scaling policies adjust.

3. **A target group**: the ASG registers each new instance with the load balancer's target group automatically. When the instance passes health checks, it starts receiving traffic. When it's terminated, it's deregistered first.

## Scaling policies

**Target tracking scaling** is the simplest and recommended starting point: pick a metric and a target value, and AWS manages scaling automatically. "Keep average CPU utilization across the fleet at 70%" — the ASG adds instances when CPU is above 70% and removes them when it's been below 70% for long enough. You can also track requests per target (useful if CPU isn't a good proxy for load in your workload).

**Step scaling** gives you more control: "If CPU > 70%, add 2 instances. If CPU > 90%, add 5." Useful when the relationship between load and required capacity isn't linear.

**Scheduled scaling** adds or removes capacity on a time-based schedule. If you know traffic spikes every Monday morning at 9 AM, pre-scale at 8:45 instead of reacting after the spike arrives.

## The new instance bootstrap problem

When the ASG spins up a new EC2 instance, it starts completely blank. It needs to:
- Have your application installed
- Have configuration files in the right places
- Start the application process
- Pass the load balancer's health check

This is solved one of two ways: **user-data scripts** (run at startup, install software on boot — slow but flexible) or **pre-baked AMIs** (the application is already installed, boots fast). The Launch Templates node covers this in detail.

## Instance replacement on failure

If an instance fails the load balancer's health check repeatedly, the ASG terminates it and launches a replacement. This is where the single-server reliability problem goes away: you're not hoping a server stays healthy forever, you're running a system that automatically replaces unhealthy servers. A server that crashes at 3 AM gets replaced within minutes, automatically, without waking anyone up.

Set the minimum to at least 2 and spread across multiple availability zones. That way, a single AZ having a problem doesn't take down your entire fleet.

## Connection draining

When the ASG decides to terminate an instance (scaling in, replacement, or deployment), it first deregisters it from the load balancer and waits for in-flight requests to complete before terminating. This **connection draining** (called "deregistration delay" in AWS) prevents requests from being cut off mid-flight. Set this to your p99 request duration — if 99% of requests complete in under 5 seconds, a 30-second draining window is more than enough.

<!-- RESOURCES -->

- [AWS Auto Scaling Groups Documentation](https://docs.aws.amazon.com/autoscaling/ec2/userguide/AutoScalingGroup.html) -- type: docs, time: 30m
- [AWS Target Tracking Scaling](https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html) -- type: docs, time: 15m
- [AWS Launch Templates](https://docs.aws.amazon.com/autoscaling/ec2/userguide/launch-templates.html) -- type: docs, time: 15m
