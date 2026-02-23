---
id: container-networking
title: Container Networking
zone: containers
edges:
  to:
    - id: building-images-in-ci
      question: I understand how containers talk to each other. How do I automate building images in CI?
      detail: >-
        The networking model makes sense now. The next thing I need is to stop
        building images manually — I want this to happen automatically when I push code.
difficulty: 2
tags:
  - docker
  - networking
  - containers
  - docker-compose
category: concept
milestones:
  - Understand Docker's default bridge network and its limitations
  - Know how user-defined bridge networks enable container DNS
  - Understand how Compose creates a network per project automatically
  - Know the difference between publishing a port (-p) and exposing one (EXPOSE)
  - Understand when to use host networking and why it's usually the wrong choice
  - Debug connectivity between containers with docker network inspect
---

When Docker Compose lets you use the service name `db` as a hostname, it works because Docker created a network with built-in DNS. The default `docker run` networking doesn't give you this — and understanding why explains a lot about how containers talk to each other and why they sometimes don't.

Networking is also where a lot of confusing behavior lives: a container binds to a port, the other container can't reach it, `curl localhost` works from your laptop but not from inside another container. These failures all have the same root cause — which network a container is on, and whether DNS resolution is available there.

<!-- DEEP_DIVE -->

## The default bridge network

Every Docker installation comes with a default network called `bridge`. When you run `docker run` without specifying a `--network` flag, that container attaches to it automatically.

The limitation is significant: containers on the default bridge network **can reach each other only by IP address, not by name**. Docker does not provide DNS resolution on the default bridge. You'd have to look up the container's IP with `docker inspect`, hardcode it, and hope it doesn't change when the container restarts.

```bash
# list all Docker networks on the host
docker network ls

# inspect the default bridge to see which containers are on it
docker network inspect bridge
```

This is mostly a historical artifact — the default bridge exists for backward compatibility. For anything beyond running a single container, you want a user-defined network.

## User-defined bridge networks

Creating your own network is the fix. User-defined bridge networks get an **embedded DNS server** that resolves container names as hostnames. Any container on the network can reach any other container on that network using its name.

```bash
# create a network
docker network create mynetwork

# attach containers to it at run time
docker run --network mynetwork --name api myapp:latest
docker run --network mynetwork --name db postgres:16

# now 'api' can reach 'db' by name
docker exec -it api curl http://db:5432
```

Isolation is also automatic: containers on different networks **cannot reach each other by default**. If you need two containers from different networks to communicate, you can connect a container to multiple networks with `docker network connect`.

## How Compose networking works

Docker Compose automates the user-defined network setup for you. When you run `docker compose up`, Compose creates a bridge network named `<project>_default` and attaches every service in the file to it. That's the entire reason service names resolve as hostnames — there's nothing magic about Compose itself, it just creates the right network automatically.

```bash
# inspect the network Compose created
docker network inspect myproject_default
```

The project name defaults to the directory name, or can be set explicitly with `--project-name` or the `COMPOSE_PROJECT_NAME` environment variable. If you have two Compose projects running on the same host, their services are on separate networks and cannot reach each other unless you explicitly connect them or use an external network.

## Publishing ports vs exposing them

These two things are often confused because they sound related:

**Publishing a port** (`-p 8080:80` on the command line, or `ports:` in a Compose file) binds a port on the host to a port inside the container. Traffic hitting `host:8080` gets forwarded to `container:80`. This is what makes a service accessible from outside Docker — from your browser, from another machine, from the internet.

**Exposing a port** (`EXPOSE 80` in a Dockerfile, or `expose:` in a Compose file) does nothing at runtime. It's documentation — a signal to operators about which ports the application listens on. It does not publish anything, and it has no effect on whether other containers can reach the service.

The important implication: **containers on the same network can reach each other on any port without any port publishing**. If your `api` service and `db` service are both on `myproject_default`, the API can connect to port 5432 on `db` with no `ports:` declaration on the database service. Port publishing is only needed to make something reachable from outside the Docker network.

## Host and none networking

These are special-purpose modes you'll rarely need in normal application development.

`--network host` removes the network namespace entirely. The container shares the host's network stack directly — no virtual interface, no NAT, no port mapping. Port 8080 inside the container is literally port 8080 on the host. This is occasionally useful for performance-sensitive applications or for tools that need to observe host-level network traffic.

The reason to avoid it in production: the container has unrestricted access to every interface on the host, and any service it opens is immediately exposed on the host's network with no isolation.

`--network none` gives the container no network interface at all. Useful for batch jobs or data processing tasks that should have zero network access as a security constraint.

## Debugging connectivity

When containers can't reach each other, the failure is almost always one of three things: wrong network, DNS not working, or the application binding to the wrong address.

```bash
# which containers are on this network?
docker network inspect <network-name>

# from inside a container — test DNS resolution
docker exec -it <container> nslookup <other-service>

# test HTTP connectivity once DNS resolves
docker exec -it <container> curl http://<other-service>:<port>

# list all networks a container is connected to
docker inspect <container> --format '{{json .NetworkSettings.Networks}}'
```

**If DNS fails**: the two containers are on different networks. Check `docker network inspect` on both and verify they share one.

**If DNS resolves but connection is refused**: the application isn't listening on that port, or the process crashed. Check `docker logs <container>`.

**If the application binds to `127.0.0.1`**: it will not be reachable from other containers even on the same network. The application must bind to `0.0.0.0` (all interfaces) to accept traffic from the Docker network. This is a common gotcha with development servers that default to loopback-only.

<!-- RESOURCES -->

- [Docker networking overview](https://docs.docker.com/network/)
- [docker network reference](https://docs.docker.com/reference/cli/docker/network/)
- [Networking in Compose](https://docs.docker.com/compose/how-tos/networking/)
