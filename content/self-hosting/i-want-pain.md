---
id: i-want-pain
title: I Want to Install Everything Manually
zone: self-hosting
edges:
  to:
    - id: installing-software
      zone: running
      question: >-
        How do people actually install and run services on bare Linux without
        Docker?
      detail: >-
        I've seen apt, but also snap, pip, building from source... I don't know
        which one to use for server software, or how to make sure a service
        starts back up automatically when the machine reboots.
difficulty: 3
tags:
  - self-hosting
  - linux
  - native
  - advanced
category: practice
milestones:
  - Compile something from source
  - Debug a broken dependency at 2am
  - Reconsider
---

Respect. This is the path of building software from source, managing systemd units by hand, and memorising config file locations across a dozen different projects.

It's a legitimate way to learn Linux deeply. It's also why Docker was invented.

<!-- DEEP_DIVE -->

The self-hosting community has largely standardised on Docker because native installs don't scale well — even for a single person running a handful of services. When your Nextcloud update breaks because PHP upgraded, or your Jellyfin depends on a libssl version that conflicts with something else, you'll understand the appeal of containers.

That said: if you want to go this route, the [Arch Wiki](https://wiki.archlinux.org/) is the best Linux reference on the internet, even if you're not running Arch. And the [Running Zone](/zone/running) on this roadmap covers Linux service management properly.

Good luck. You'll need it.

<!-- RESOURCES -->

- [Arch Wiki](https://wiki.archlinux.org/) -- type: reference, time: ongoing
