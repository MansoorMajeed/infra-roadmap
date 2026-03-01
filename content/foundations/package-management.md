---
id: package-management
title: Package Management
zone: foundations
edges:
  to: []
difficulty: 1
tags:
  - apt
  - yum
  - dnf
  - apk
  - packages
  - repositories
  - dependencies
category: concept
milestones:
  - 'Install, update, and remove a package using your distro''s package manager'
  - Explain what a repository is and how dependencies work
  - Search for packages from the command line
---

On Linux, you do not usually download installers from websites like you do on Windows or macOS. Software is managed through a **package manager** — a tool that installs, updates, and removes programs while automatically handling dependencies. It knows that installing Nginx also requires OpenSSL, and it fetches both for you. Every Linux distribution has one, and using it correctly is how you keep servers secure, reproducible, and maintainable.

<!-- DEEP_DIVE -->

A **package** is a bundled piece of software — the compiled program, its configuration files, documentation, and metadata about what other packages it depends on. Packages live in **repositories** (repos) — online servers that your package manager knows how to talk to. When you run `sudo apt install nginx`, your system checks its configured repositories, finds the Nginx package, resolves all its dependencies, downloads everything, and installs it in the right locations. This is massively better than manually downloading software because the package manager tracks what is installed, can upgrade everything at once, and can cleanly remove software without leaving orphaned files behind.

**The major package managers you will encounter:**

- **APT** (`apt`, `apt-get`) — used by Debian, Ubuntu, and their derivatives. Packages are `.deb` files. `sudo apt update` refreshes the package list from repos. `sudo apt install <package>` installs. `sudo apt upgrade` upgrades all installed packages. `apt search <query>` finds packages. This is probably the one you will use most.
- **YUM / DNF** — used by RHEL, CentOS, Fedora, Rocky Linux. Packages are `.rpm` files. DNF is the newer replacement for YUM (same commands, better dependency resolution). `sudo dnf install <package>`, `sudo dnf update`, `dnf search <query>`.
- **APK** — used by Alpine Linux. Lightweight and fast, designed for containers. `apk add <package>`, `apk update`, `apk search <query>`. You will encounter this when working with Docker images based on Alpine.

**Why `sudo`?** Installing software modifies system directories (`/usr/bin`, `/etc`, `/lib`). Only root can write to these locations. That is why you need `sudo` for install commands. This is the users-and-permissions model in action — it prevents a random user from installing malicious software system-wide.

**Repositories and trust.** Your system comes configured with official repositories maintained by the distribution. These packages are tested and signed — when you install from an official repo, you can be reasonably confident the software is not tampered with. Adding third-party repositories (PPAs on Ubuntu, EPEL on RHEL) gives you access to more software but requires you to trust the maintainer. In production environments, many companies run their own internal package mirrors to control exactly what software is available and ensure reproducibility.

**Dependencies** are the reason package managers exist. Real software does not exist in isolation. Nginx depends on OpenSSL for HTTPS. PostgreSQL depends on system libraries for locale handling. A package manager resolves the entire dependency tree — if package A needs B, and B needs C and D, it installs all of them in the right order. This is also why you should never install software by downloading random binaries and copying them to `/usr/local/bin` — the package manager cannot track those, cannot update them, and cannot resolve their dependencies.

**Security updates** are critical for SRE work. When a vulnerability is discovered in OpenSSL or the Linux kernel, the distribution maintainers release a patched package. Running `sudo apt update && sudo apt upgrade` (or the equivalent for your distro) pulls in those patches. Many production environments automate this with unattended upgrades for security patches. Not keeping packages updated is one of the most common ways servers get compromised.

A practical exercise: try `apt list --installed` (or `dnf list installed`) to see every package on your system — you will be surprised how many there are. Then run `apt show nginx` to see a package's metadata, including its dependencies. Install something, check where its files were placed with `dpkg -L nginx` (or `rpm -ql nginx`), then remove it cleanly with `apt remove nginx`.

<!-- RESOURCES -->

- [APT Package Management - Ubuntu Documentation](https://ubuntu.com/server/docs/package-management) -- type: reference, time: 30m
- [DNF Command Reference - Fedora Docs](https://docs.fedoraproject.org/en-US/quick-docs/dnf/) -- type: reference, time: 20m
- [How APT and dpkg Work - Debian Handbook](https://www.debian.org/doc/manuals/debian-handbook/apt.en.html) -- type: reference, time: 45m
- [Alpine Linux Package Management](https://wiki.alpinelinux.org/wiki/Alpine_Package_Keeper) -- type: reference, time: 15m
- [Linux Package Management Basics - Linode](https://www.linode.com/docs/guides/linux-package-management-overview/) -- type: tutorial, time: 25m
