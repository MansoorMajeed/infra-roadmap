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
