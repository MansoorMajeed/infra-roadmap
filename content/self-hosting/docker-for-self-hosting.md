---
id: "docker-for-self-hosting"
title: "Docker for Self-Hosting"
zone: "self-hosting"
edges:
  from:
    - id: "docker-or-native"
      question: "Docker it is — how do I get started?"
  to:
    - id: "docker-compose"
      question: "I know Docker — let's skip to managing services properly"
      detail: "I've been running containers with docker run commands but it's already getting messy. If I restart the server I have to remember all the flags. There has to be a better way."
    - id: "docker-ports"
      question: "Wait — I don't really understand how Docker works yet"
      detail: "I got a container running but I honestly have no idea what's happening. What are all those flags doing? If I delete the container, do I lose my data? And how do I get two services to talk to each other?"
difficulty: 1
tags: ["self-hosting", "docker", "containers", "linux"]
category: "tool"
milestones:
  - "Install Docker on your server"
  - "Pull and run a container (e.g. `docker run hello-world`)"
  - "Run Vaultwarden with `docker run` and access it from your browser"
  - "Understand images, containers, volumes, and ports"
---

Docker is a tool for running applications in isolated containers. For self-hosting, it means you can run any service — Vaultwarden, Immich, Jellyfin — without installing its dependencies directly on your server. You just run the container.

Let's install Docker and run your first service.

<!-- DEEP_DIVE -->

**Installing Docker**

Don't use the Docker package from the Debian apt repository — it's often outdated. Use the official Docker repository:

```bash
# Add Docker's official GPG key
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Add your user to the `docker` group so you can run Docker commands without `sudo`:

```bash
sudo usermod -aG docker $USER
```

Log out and back in, then verify:

```bash
docker run hello-world
```

**Four things Docker works with**

- **Image**: a packaged application, read-only. Think of it as the blueprint. `vaultwarden/server:latest` is an image.
- **Container**: a running instance of an image. You can run multiple containers from the same image.
- **Volume**: persistent storage attached to a container. Data here survives container restarts and updates.
- **Port**: a network port exposed from the container to your host machine.

**Run Vaultwarden with a single command**

```bash
docker run -d \
  --name vaultwarden \
  -v ~/apps/vaultwarden/data:/data \
  -p 8080:80 \
  --restart unless-stopped \
  vaultwarden/server:latest
```

What each flag does:
- `-d`: run in the background (detached)
- `--name vaultwarden`: give the container a name
- `-v ~/apps/vaultwarden/data:/data`: mount a host directory into the container for persistent storage
- `-p 8080:80`: map port 8080 on the host to port 80 in the container
- `--restart unless-stopped`: restart automatically if the server reboots

Open your browser: `http://YOUR-SERVER-IP:8080`. Vaultwarden is running.

**The problem with `docker run`**

That command is long and hard to remember. If you ever need to stop and restart the container, you have to type it all again — or hope you saved it somewhere. It doesn't version-control well. And when you have multiple services with multiple containers, managing them all with `docker run` becomes a nightmare.

Docker Compose solves this. It lets you define your entire setup in a single YAML file and manage it with two commands.

<!-- RESOURCES -->

- [Docker Installation for Debian](https://docs.docker.com/engine/install/debian/) -- type: guide, time: 15min
- [Vaultwarden on Docker Hub](https://hub.docker.com/r/vaultwarden/server) -- type: reference, time: 5min
