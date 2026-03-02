---
id: launch-templates-and-amis
title: Launch Templates and Machine Images
zone: scaling
edges:
  to:
    - id: vm-scaling-pain-points
      question: >-
        AMI baking is slow and painful. Is this really the best way to ship code
        at scale?
      detail: >-
        Every code change triggers a slow cycle: bake a new machine image, wait
        minutes, update the template, roll it out across the fleet. AMI baking
        is one of the clearest examples of the operational overhead that comes
        with VM-based scaling.
difficulty: 2
tags:
  - ami
  - launch-template
  - ec2
  - packer
  - golden-image
  - immutable-infrastructure
  - aws
category: practice
milestones:
  - >-
    Create a custom AMI with your application pre-installed using Packer or
    manual snapshot
  - Reference the AMI in a Launch Template
  - >-
    Understand what a user-data script is and when to use it instead of a baked
    AMI
  - Explain the trade-offs between baked images and runtime configuration
---

When an Auto Scaling Group launches a new instance, it needs to know what software to run and how to configure it. A Launch Template answers the "what hardware" question (instance type, AMI, security groups, IAM role). The AMI answers the "what software is installed" question. Together they define what a new instance looks like the moment it boots.

<!-- DEEP_DIVE -->

## Launch Templates

A Launch Template is the specification the ASG uses when creating a new instance. Key fields:

- **AMI ID**: which machine image to boot from — this is where your application software lives
- **Instance type**: `t3.medium`, `c5.xlarge`, etc.
- **Security groups**: which traffic to allow
- **IAM instance profile**: what AWS permissions the instance has (to read from S3, write to CloudWatch, etc.)
- **Key pair**: for SSH access
- **User-data**: a shell script that runs at boot

Launch Templates support versioning. When you update the template (new AMI version, different instance type), the ASG continues using the old version until you tell it to update — giving you controlled rollouts.

## AMIs (Amazon Machine Images)

An AMI is a snapshot of a disk volume — it captures the OS, installed packages, application code, and configuration at a point in time. When EC2 launches an instance from an AMI, it boots from a copy of that snapshot.

The simplest AMI is AWS's base Amazon Linux or Ubuntu image. If you use one of these, you need a user-data script to install your application on every boot — which can take 3-5 minutes.

A **custom AMI** (sometimes called a golden image or baked image) has your application pre-installed. You boot an instance from a base image, install your software, configure it, then "bake" it into a new AMI using the EC2 console or the AWS CLI (`aws ec2 create-image`). Subsequent instances boot in seconds because the software is already there.

## Packer for automated image building

Doing AMI baking manually doesn't scale — every code change requires you to manually boot an instance, install software, and take a snapshot. HashiCorp Packer automates this. You write a Packer template that describes:
1. Which base AMI to start from
2. Shell commands to install and configure your app
3. What to name the resulting AMI

Packer launches an EC2 instance, runs your provisioners, creates the AMI, and terminates the instance. Plug this into your CI pipeline and every merged PR produces a new AMI ready to deploy.

## User-data vs baked AMI

| Approach | Boot time | Flexibility | Complexity |
|---|---|---|---|
| User-data script only | 3-8 minutes | High (script runs fresh) | Low |
| Pre-baked AMI | 30-60 seconds | Lower (baked at build time) | Medium |
| Baked AMI + minimal user-data | 30-60 seconds | High | Medium |

The hybrid is common: bake the application into the AMI (fast boot), but use user-data for environment-specific config (endpoint URLs, secrets) that differs between staging and production.

## The AMI deployment cycle

With a baked AMI approach, deploying new code looks like:
1. Build new AMI (CI pipeline builds, tests, bakes)
2. Update Launch Template to reference new AMI ID
3. Roll out the ASG: terminate old instances one at a time (or trigger an instance refresh), ASG launches replacements from new template

This is slow — an instance refresh for a 10-instance fleet might take 20-30 minutes. This operational overhead is one reason teams eventually move to containers.

<!-- RESOURCES -->

- [HashiCorp Packer Documentation](https://developer.hashicorp.com/packer/docs) -- type: docs, time: 30m
- [AWS EC2 User Data](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html) -- type: docs, time: 15m
- [AWS Instance Refresh](https://docs.aws.amazon.com/autoscaling/ec2/userguide/asg-instance-refresh.html) -- type: docs, time: 15m
