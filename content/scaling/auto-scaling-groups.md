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

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
