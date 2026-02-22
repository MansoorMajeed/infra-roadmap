---
id: "auto-scaling-groups"
title: "Auto Scaling Groups"
zone: "scaling"
edges:
  from:
    - id: "shared-sessions-redis"
      question: "Sessions are in Redis. My Python servers are truly stateless. How do I scale them automatically?"
      detail: "With sessions externalized to Redis, every app server is identical and replaceable. AWS Auto Scaling Groups (ASG) and GCP Managed Instance Groups (MIG) can now spin up new servers when load spikes and tear them down when it drops — without any user impact."
  to:
    - id: "redis-scaling"
      question: "My Python servers auto-scale. Now Redis is the single point of failure and it's hitting its limits."
      detail: "All those app servers are hammering one Redis instance for every session read and write. Redis is fast but has memory limits, and a single node going down takes out every user's session. Time to scale Redis itself."
    - id: "launch-templates-and-amis"
      question: "When the ASG spins up a new VM, how does it know what software to run?"
      detail: "A blank EC2 instance or GCP VM is just an OS. Your ASG needs instances that already have your Python app installed, configured, and ready to serve traffic. Launch templates and machine images are how you bake that configuration in."
difficulty: 2
tags: ["auto-scaling", "asg", "aws", "ec2", "launch-template", "scaling-policies", "elasticity"]
category: "practice"
milestones:
  - "Create a Launch Template that installs and starts your application"
  - "Create an Auto Scaling Group with a minimum, maximum, and desired capacity"
  - "Attach the ASG to your load balancer's target group"
  - "Set a scaling policy that adds instances when CPU exceeds 70%"
  - "Watch the ASG replace a terminated instance automatically"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
