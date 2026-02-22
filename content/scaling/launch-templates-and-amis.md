---
id: "launch-templates-and-amis"
title: "Launch Templates and Machine Images"
zone: "scaling"
edges:
  from:
    - id: "auto-scaling-groups"
      question: "When AWS spins up a new instance, how does it know what software to run?"
      detail: "A blank EC2 instance or GCP VM is just a base OS. Your ASG (AWS) or Managed Instance Group (GCP) needs VMs that already have your Python app installed, configured, and ready to serve traffic. Machine images — AMIs on AWS, custom images on GCP — are how you bake that configuration in."
  to:
    - id: "vm-scaling-pain-points"
      question: "AMI baking is slow and painful. Is this really the best way to ship code at scale?"
      detail: "Every code change triggers a slow cycle: bake a new machine image, wait minutes, update the template, roll it out across the fleet. AMI baking is one of the clearest examples of the operational overhead that comes with VM-based scaling."
difficulty: 2
tags: ["ami", "launch-template", "ec2", "packer", "golden-image", "immutable-infrastructure", "aws"]
category: "practice"
milestones:
  - "Create a custom AMI with your application pre-installed using Packer or manual snapshot"
  - "Reference the AMI in a Launch Template"
  - "Understand what a user-data script is and when to use it instead of a baked AMI"
  - "Explain the trade-offs between baked images and runtime configuration"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
