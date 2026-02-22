---
id: "i-want-pain"
title: "I Want to Install Everything Manually"
zone: "self-hosting"
edges:
  from:
    - id: "docker-or-native"
      question: "I want to install everything manually from source"
  to:
    - id: "installing-software"
      zone: "running"
      question: "OK, show me how to install software on Linux properly"
      detail: "I want to actually understand what I'm running, not just pull an image someone else built. Where do I even start? apt? Building from source? How do people manage all of this without Docker?"
difficulty: 3
tags: ["self-hosting", "linux", "native", "advanced"]
category: "practice"
milestones:
  - "Compile something from source"
  - "Debug a broken dependency at 2am"
  - "Reconsider"
---

Respect. This is the path of building software from source, managing systemd units by hand, and memorising config file locations across a dozen different projects.

It's a legitimate way to learn Linux deeply. It's also why Docker was invented.

<!-- DEEP_DIVE -->

The self-hosting community has largely standardised on Docker because native installs don't scale well — even for a single person running a handful of services. When your Nextcloud update breaks because PHP upgraded, or your Jellyfin depends on a libssl version that conflicts with something else, you'll understand the appeal of containers.

That said: if you want to go this route, the [Arch Wiki](https://wiki.archlinux.org/) is the best Linux reference on the internet, even if you're not running Arch. And the [Running Zone](/zone/running) on this roadmap covers Linux service management properly.

Good luck. You'll need it.

<!-- RESOURCES -->

- [Arch Wiki](https://wiki.archlinux.org/) -- type: reference, time: ongoing
