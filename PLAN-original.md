# Interactive SRE/DevOps Roadmap - Implementation Plan

## The Problem

SRE/DevOps is overwhelming. You Google "how to become an SRE" and get a wall of 200 tools, acronyms, and concepts with no clear starting point and no obvious connections between them. Traditional roadmaps make this worse - they hand you a flat checklist ("learn Docker, learn Kubernetes, learn Terraform") without ever explaining *why* these things exist or how they relate to each other. You end up memorizing tools without understanding the problems they solve.

## This Project

An interactive, graph-based roadmap where every topic connects to the next through a **natural question**. Instead of "next, learn Docker," you follow: *"VMs work but they're heavy... is there something lighter?"* Every transition has a reason. Every tool exists because the previous approach hit a wall.

The result: someone brand new can start from "what does code even mean?" and organically discover networking, cloud, containers, CI/CD, observability, and SRE practices - not by memorizing a list, but by **connecting the dots** the way experienced engineers already think about these systems.

## UX Decisions

- **Visualization**: Interactive node graph (React Flow)
- **Entry point**: Bird's eye view with 7 high-level zones; click to zoom into sub-graphs
- **Node depth**: Layered - summary paragraph → expandable deep dive → external resources
- **Progress tracking**: localStorage, nodes change color as completed
- **Multiple entry points**: "brand new to tech", "developer entering SRE", "sysadmin transitioning", etc.

## Content Architecture

### File Format

One Markdown file per node, organized by zone:

```
content/
  _zones.yaml              # Zone definitions (colors, positions, descriptions)
  foundations/
    hello-world.md
    how-computers-run-code.md
    ...
  building/
    what-is-a-web-service.md
    ...
  networking-and-hosting/
  scaling-and-reliability/
  delivery-and-automation/
  observability-and-security/
  platform-engineering/
```

Each node file has YAML frontmatter + Markdown body with section delimiters:

```yaml
---
id: "containers-docker"
title: "Containers & Docker"
zone: "delivery-and-automation"
edges:
  from:
    - id: "virtual-machines"
      question: "VMs work but they're heavy... is there something lighter?"
  to:
    - id: "container-registries"
      question: "I built an image. Where do I store it?"
    - id: "container-orchestration"
      question: "I have dozens of containers. How do I manage them all?"
difficulty: 2        # 1=beginner, 2=intermediate, 3=advanced
tags: ["containers", "docker"]
category: "tool"     # concept | tool | practice | principle
milestones:
  - "Run your first container"
  - "Write a Dockerfile"
---

Short summary paragraph shown on first click.

<!-- DEEP_DIVE -->

Detailed explanation with examples, tables, code blocks.

<!-- RESOURCES -->

- [Link](url) -- type: tutorial, time: 2h
```

### 7 Zones (Bird's Eye View)

```
[1. Foundations] --> [2. Building] --> [3. Networks & Internet]
                         |                     |
                         v                     v
              [4. Scale & Reliability] <--> [5. Delivery & Automation]
                         |                     |
                         v                     v
              [6. Observability & Security] --> [7. Platform & SRE Practices]
```

| # | Zone | Core Question | ~Nodes |
|---|------|--------------|--------|
| 1 | Foundations: Code & Computers | "What even is code?" | 10 |
| 2 | Building Real Software | "Let me build something real" | 12 |
| 3 | Networks & The Internet | "How do I put it on the internet?" | 14 |
| 4 | Scale & Reliability | "More users are coming" | 12 |
| 5 | Delivery & Automation | "Deploying manually is painful" | 14 |
| 6 | Observability & Security | "How do I know it's healthy?" | 14 |
| 7 | Platform & SRE Practices | "How do I do this professionally?" | 10 |

**Total: ~86 nodes**

### Key Nodes Per Zone

**Zone 1 - Foundations:** hello-world, how-computers-run-code, operating-system-basics, the-terminal, files-and-filesystems, processes-and-memory, text-editors-and-ides, version-control-git, programming-fundamentals, scripting-bash-python

**Zone 2 - Building:** what-is-a-web-service, http-fundamentals, building-a-rest-api, databases-fundamentals, sql-and-relational-dbs, nosql-databases, application-architecture, authentication-and-sessions, caching-basics, message-queues, dependency-management, testing-fundamentals

**Zone 3 - Networks:** networking-fundamentals, ip-addresses-and-ports, dns-how-names-become-addresses, tcp-vs-udp, firewalls-and-network-security, localhost-to-lan, web-servers, tls-and-https, domain-names-and-registrars, what-is-the-cloud, cloud-providers-overview, virtual-private-servers, ssh-and-remote-access, deploying-your-first-app

**Zone 4 - Scale:** why-one-server-isnt-enough, reverse-proxy, load-balancers, horizontal-vs-vertical-scaling, database-replication, database-sharding, cdn-content-delivery, high-availability, distributed-systems-basics, cap-theorem, service-discovery, api-gateway

**Zone 5 - Delivery:** virtual-machines, containers-docker, container-registries, docker-compose, container-orchestration, kubernetes-fundamentals, kubernetes-workloads, kubernetes-networking, helm-and-kustomize, ci-cd-concepts, ci-cd-pipelines, gitops, infrastructure-as-code, terraform

**Zone 6 - Observability & Security:** why-observability, logging-fundamentals, centralized-logging, metrics-and-monitoring, prometheus-and-grafana, distributed-tracing, alerting-and-on-call, dashboards-and-visualization, security-fundamentals, secrets-management, network-security-advanced, iam-and-access-control, container-security, compliance-and-auditing

**Zone 7 - SRE Practices:** sre-philosophy, slos-slis-slas, error-budgets, incident-management, postmortems, chaos-engineering, capacity-planning, toil-and-automation, developer-experience-platform, career-path-sre

### Edge Design (The Secret Sauce)

Every edge is a **natural question** the learner asks. Key cross-zone bridges:

| From → To | Question |
|-----------|----------|
| programming-fundamentals → what-is-a-web-service | "I can write code. How do I build something people can use?" |
| building-a-rest-api → localhost-to-lan | "It works on localhost. But only I can see it." |
| deploying-your-first-app → why-one-server-isnt-enough | "My app is live! But one server is a single point of failure." |
| deploying-your-first-app → ci-cd-concepts | "I deployed via SSH. I never want to do that again." |
| virtual-machines → containers-docker | "A whole OS per app? There has to be something lighter." |
| docker-compose → container-orchestration | "Compose works on one machine. I have twenty." |
| metrics-and-monitoring → slos-slis-slas | "I have 100 metrics. Which ones actually matter?" |
| alerting-and-on-call → incident-management | "The pager went off at 3 AM. Now what?" |

### Multiple Entry Points

| Entry Point | Audience | Starting Node |
|------------|---------|---------------|
| "I'm brand new to tech" | Complete beginner | hello-world |
| "I can code but don't know ops" | Developer → SRE | what-is-a-web-service |
| "I know Linux/networking" | Sysadmin transitioning | deploying-your-first-app |
| "I know Docker, learning K8s" | Mid-level | container-orchestration |
| "I want SRE practices" | Experienced engineer | sre-philosophy |

## Tech Stack

- **Framework**: Next.js (App Router)
- **Graph visualization**: React Flow (@xyflow/react)
- **Content parsing**: gray-matter (YAML frontmatter) + react-markdown (rendering)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (or any static hosting via `next export`)

## Implementation Plan (Prototype Scope: Zone 1 Only)

Start small - build Zone 1 (Foundations, 10 nodes) end-to-end with full content, working graph, and progress tracking. Prove the concept works before expanding.

### Step 1: Project Setup
- `npx create-next-app@latest` with TypeScript, Tailwind, App Router
- Install dependencies: `@xyflow/react`, `gray-matter`, `react-markdown`
- Create `content/` directory with `_zones.yaml` and `content/foundations/`

### Step 2: Content - Zone 1 Nodes (10 files)
- Create `_zones.yaml` with all 7 zone definitions (for the bird's eye view) but only Zone 1 is clickable
- Write full content for all 10 Foundation nodes:
  - hello-world.md, how-computers-run-code.md, operating-system-basics.md
  - the-terminal.md, files-and-filesystems.md, processes-and-memory.md
  - text-editors-and-ides.md, version-control-git.md, programming-fundamentals.md
  - scripting-bash-python.md
- Each with complete frontmatter (edges, difficulty, tags, milestones) and all 3 content sections

### Step 3: Build Pipeline
- `src/lib/content.ts` - functions to parse all markdown files, extract frontmatter, build graph data
- `src/lib/types.ts` - TypeScript types for Node, Edge, Zone, Progress
- Content loaded at build time via Next.js `generateStaticParams` / server components

### Step 4: UI - Bird's Eye Zone View
- `/` route shows the 7 zones as large clickable cards/nodes in React Flow
- Each zone shows: title, core question, node count, progress percentage
- Only Zone 1 is active (others show "Coming Soon" state)

### Step 5: UI - Zone Detail Graph
- `/zone/[zoneId]` route shows the sub-graph for a zone
- React Flow renders nodes with edges, edge labels show the "natural question"
- Nodes colored by difficulty (green/yellow/red) and completion status
- Click a node → slide-out panel with layered content

### Step 6: Content Panel
- Side panel or modal when clicking a node
- Shows: title, summary (always visible), "Learn More" accordion for deep dive, resources section
- Milestone checkboxes
- "Mark as Complete" button
- Navigation: shows outgoing edges as "Where to go next?" with the question text

### Step 7: Progress Tracking
- `src/lib/progress.ts` - localStorage helper (get/set/clear progress)
- Schema: `{ nodes: { [id]: { status, completedAt, milestones[] } }, entryPoint }`
- Nodes in the graph visually reflect status (not started / in progress / completed)

### Step 8: Entry Point Selector
- Landing page or modal: "Where do you want to start?"
- 5 options (see Multiple Entry Points table above)
- Selected entry point highlights the recommended starting node

## Key Files

```
src/
  app/
    page.tsx                    # Bird's eye zone view
    zone/[zoneId]/page.tsx      # Zone detail graph
    layout.tsx                  # Shared layout
  components/
    ZoneMap.tsx                 # React Flow - zone overview
    NodeGraph.tsx               # React Flow - zone detail
    ContentPanel.tsx            # Slide-out content viewer
    NodeCard.tsx                # Custom React Flow node component
    EntryPointSelector.tsx      # "Where do you want to start?"
  lib/
    content.ts                  # Parse markdown, build graph
    types.ts                    # TypeScript types
    progress.ts                 # localStorage progress tracking
content/
  _zones.yaml
  foundations/
    hello-world.md
    ... (10 files)
```

## Verification
- `npm run build` succeeds (content parsing works at build time)
- Navigate to `/` → see 7 zones, Zone 1 clickable
- Click Zone 1 → see 10-node graph with edges and question labels
- Click a node → content panel shows summary, expandable deep dive, resources
- Mark node complete → visual change persists across page reload
- Check milestone checkboxes → persists in localStorage
- Navigate via "Where to go next?" links → moves through the graph naturally
