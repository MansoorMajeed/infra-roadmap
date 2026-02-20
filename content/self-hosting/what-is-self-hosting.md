---
id: "what-is-self-hosting"
title: "What Is Self-Hosting?"
zone: "self-hosting"
edges:
  from:
    - id: "own-hardware"
      question: "I have my own hardware. What can I actually run on it?"
      detail: "A Linux box at home is the foundation for self-hosting — running your own file sync, media server, home automation hub, and more. You own the hardware, you own the data, and there are no monthly fees. The rabbit hole goes deep."
  to:
    - id: "docker-for-self-hosting"
      question: "How do I actually run these services without breaking everything?"
      detail: "Every self-hosted service has different dependencies, different config files, different ports. Docker Compose solves this: each service runs in an isolated container, defined in a single YAML file. You can start, stop, and update services without touching the rest of your system."
difficulty: 1
tags: ["self-hosting", "homelab", "docker", "privacy", "open-source"]
category: "concept"
milestones:
  - "List 3 services you want to run and why"
  - "Understand why Docker Compose is the standard tool for self-hosting"
  - "Know the difference between running a service locally vs. exposing it to the internet"
---

You have a Linux machine. You know how to SSH into it. Now what?

Self-hosting means running services on hardware you control — your own Dropbox, your own Netflix, your own photo library, your own password manager. The software exists. The communities around it are huge. And the skills you're building on this roadmap are exactly what you need to run it all.

<!-- DEEP_DIVE -->

**What can you actually self-host?**

The short answer: almost anything. The longer answer is a list that keeps growing:

| Category | Cloud service it replaces | Self-hosted alternative |
|---|---|---|
| **File sync** | Dropbox, Google Drive | Nextcloud, Seafile |
| **Photos** | Google Photos, iCloud | Immich, Photoprism |
| **Media streaming** | Netflix, Spotify | Jellyfin, Navidrome |
| **Password manager** | 1Password, LastPass | Vaultwarden (Bitwarden-compatible) |
| **Home automation** | Google Home, Amazon Alexa | Home Assistant |
| **RSS / reading** | Feedly | Miniflux, FreshRSS |
| **Note-taking** | Notion, Evernote | Joplin, Obsidian sync |
| **Git hosting** | GitHub | Gitea, Forgejo |
| **Bookmarks** | Pocket, Pinboard | Linkding, Wallabag |
| **Ad blocking** | Browser extensions | Pi-hole, AdGuard Home |
| **VPN** | Commercial VPN | WireGuard, Tailscale |

This is not an exhaustive list. The [r/selfhosted](https://www.reddit.com/r/selfhosted/) community adds new ones every week.

**Why do people self-host?**

Different people have different reasons. The most common ones:

- **Privacy.** Your data lives on your hardware, not a company's servers. No one is scanning your files or selling your usage patterns.
- **Cost.** After the hardware cost, most services are free. No Dropbox subscription, no Google One storage tier, no Netflix fee.
- **Control.** You decide when to update, what version to run, and what features to enable. You're not subject to a company changing their pricing or shutting down.
- **Learning.** Running real services teaches you things no tutorial can. You'll debug networking issues, manage disk space, set up backups, write cron jobs. It's infrastructure work in miniature.
- **It's fun.** Genuinely. The homelab community is large, welcoming, and enthusiastic.

**How self-hosting actually works**

Most self-hosted services run as Docker containers. A tool called **Docker Compose** lets you define an entire service — its image, ports, volumes, environment variables — in a single YAML file:

```yaml
# docker-compose.yml for Nextcloud (simplified)
services:
  nextcloud:
    image: nextcloud:latest
    ports:
      - "8080:80"
    volumes:
      - ./data:/var/www/html/data
    environment:
      - MYSQL_HOST=db
      - MYSQL_DATABASE=nextcloud
  db:
    image: mariadb:latest
    volumes:
      - ./db:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=secret
      - MYSQL_DATABASE=nextcloud
```

```bash
docker compose up -d   # start everything in the background
docker compose down    # stop everything
docker compose logs -f # watch the logs
```

That's it. Two commands and you have a running service. The container handles dependencies — you don't install PHP, Apache, MariaDB directly on your server. Each service lives in its own isolated environment.

**The three things you'll learn here**

Self-hosting has its own set of practical skills that sit alongside (and reinforce) what the professional SRE path teaches:

1. **Docker Compose** — how to define, run, and manage containerized services. This is the same Docker used in production, just simpler config.

2. **Reverse proxies** — running multiple services means multiple ports. A reverse proxy (Nginx, Caddy, or Traefik) routes traffic by domain name to the right service: `photos.yourdomain.com` → Immich on port 2283, `files.yourdomain.com` → Nextcloud on port 8080.

3. **Access from outside your home** — services on your home network aren't reachable from the internet by default (NAT). Tailscale is the modern answer: a free, easy VPN that connects your devices without port forwarding. For truly public services, you'll learn about port forwarding and dynamic DNS.

**Start small**

Pick one service. Something you'd actually use. Run it locally first — just on your home network, no external access. Get comfortable with Docker Compose, understand how the service works, and make sure it survives a reboot.

Then, when you're ready, expose it to the internet if you want. Or don't — plenty of people run their entire homelab on Tailscale and never open a port to the public internet. Both are valid.

The learning compounds. Every service you add teaches you something. Your second service is easier than your first. Your tenth is almost automatic.

<!-- RESOURCES -->

- [Awesome Self-Hosted (GitHub)](https://github.com/awesome-selfhosted/awesome-selfhosted) -- type: reference, time: ongoing
- [r/selfhosted](https://www.reddit.com/r/selfhosted/) -- type: community, time: ongoing
- [Docker Compose Getting Started](https://docs.docker.com/compose/gettingstarted/) -- type: tutorial, time: 30m
- [Tailscale - How it works](https://tailscale.com/blog/how-tailscale-works) -- type: article, time: 20m
