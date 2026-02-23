# Plan: Edge Question & Detail Quality Pass — All Zones

## Context

Self-hosting zone went through a quality pass fixing two categories of issues:
1. **Narrator voice** — `detail` fields written in third-person/explainer tone instead of first-person user voice
2. **Missing details** — `to` edges with a `question` but no `detail`, leaving branch choices bare

This plan applies the same fixes across all 11 remaining active zones.

## Approach

- Parse only YAML frontmatter per file (not full markdown body) using a Python audit script
- Fix issues in-place with targeted `Edit` calls — no file rewrites
- Work zone by zone
- Verify at end with the same audit script (all `to` edges should have details, zero narrator patterns)

## The Standard

Every `question` and `detail` must pass one test: **could a real user plausibly think or say this exact thing?**

**`question:`** must express the user's felt problem or curiosity — never a chapter title, never a compliance response ("OK, show me...", "Got it —", "Understood —"), never name-dropping a solution the user doesn't know about yet.

**`detail:`** must be the user thinking aloud — expanding their own question, deepening the tension, or surfacing something they hadn't quite considered. It must:
- Be first-person ("I", "my", "me")
- Never start answering — no naming the solution, no explaining the concept, no making editorial observations about what will save them later
- Not recap what they just learned ("You know X, so now Y")
- Not transition on their behalf ("With X sorted, you can now...")
- Not describe a tool or technology

## Two Issue Types & How They're Fixed

### Type 1: Missing `detail`
Add a `detail` in first-person user voice that deepens their felt tension or surfaces a hidden complexity they hadn't considered. Never start answering.

### Type 2: `detail` that fails the standard
This covers narrator voice, tool descriptions, recaps, transitions, editorial observations, and anything that starts answering. Rewrite as the user's own authentic thought — what are they actually worried about or unsure of as they consider clicking this edge?

---

## Issues by Zone

### `building` — 4 bad details

| File | Question | What's wrong |
|------|----------|--------------|
| `apis-and-rest.md` | "I have a clean API. How do I expose it to the world?" | Narrator recaps what they built and sets up the premise. Not the user's thought. |
| `nosql-databases.md` | "I understand my data layer options. How do I get this whole thing running for real?" | Narrator lists what they learned and pivots to the next topic on their behalf. |
| `testing-basics.md` | "My code is tested and I'm confident it works. Now how do I run it somewhere real?" | Narrator explains why tests on a laptop don't equal production. Starts answering. |
| `version-control-git.md` | "I can manage my code properly now. How do I actually get it running for others?" | Narrator distinguishes pushing to GitHub vs deploying. Starts answering. |

---

### `containers` — 5 missing details

| File | Question |
|------|----------|
| `containerization.md` | "I get it. How do I build a container for my app?" |
| `writing-a-dockerfile.md` | "I can build an image. My app needs a database too — how do I run them together?" |
| `docker-compose-dev.md` | "Local setup works. How do I build images automatically in CI?" |
| `building-images-in-ci.md` | "I built an image in CI. Where does it go?" |
| `container-registry.md` | "My image is stored and versioned. How do I get it running on a real server?" |

All five are bare. Each is a "what's next" question on a clear linear progression — the detail should express what the user is actually uncertain about in that moment.

---

### `delivery` — 2 bad details

| File | Question | What's wrong |
|------|----------|--------------|
| `iac-intro.md` | "IaC makes sense. Show me Terraform." | Describes Terraform's mechanics. Starts answering before the user reaches the node. |
| `pipeline-secrets.md` | "Secrets are handled. Now how do I structure the full pipeline?" | "With secrets sorted, you can build..." — narrator transitioning on behalf of the user. Not the user's thought. |

---

### `foundations` — 6 bad details

`foundations` has a heavy uniform pattern of "You know X. Now Y." — narrator recapping what the user learned and pivoting to the next topic. None of these are the user's own thought.

| File | Question | What's wrong |
|------|----------|--------------|
| `files-and-filesystems.md` | "I understand files. Where do systems keep their logs?" | Narrator recap + explains why logs matter. Starts answering. |
| `linux-and-distros.md` | "I understand Linux. How do I actually use it?" | Narrator recap + explains what the terminal is and why. Starts answering. |
| `pipes-and-redirection.md` | "I can chain commands. How do I customise my shell environment?" | Narrator recap + explains what shell config does. Starts answering. |
| `processes-and-memory.md` | "I understand how the computer runs things. Now how do I write real programs?" | Narrator recap + editorial about "being dangerous enough with code." Starts answering. |
| `the-terminal.md` | "I need to write and edit files. What tools do I use?" | Narrator recap + explains why you need a terminal editor. Starts answering. |
| `what-is-a-process.md` | "A process is running. How does it use memory?" | Narrator recap + explains memory management concepts. Starts answering. |

---

### `kubernetes` — 3 bad details

| File | Question | What's wrong |
|------|----------|--------------|
| `namespaces.md` | "I understand how namespaces organise the cluster. Now — how do I actually run something in one?" | Narrator explains how namespaces work + editorial "organise from day one." Starts answering. |
| `pods.md` | "My Pod is running — but how does Kubernetes know if it's actually healthy?" | "Running and healthy are different things" — narrator framing the distinction. Starts answering. |
| `why-kubernetes.md` | "Before I run anything — how does Kubernetes keep different teams from interfering?" | Narrator explains what namespaces are and do. Fully starts answering. |

---

### `kubernetes-production` — 22 missing details (largest zone)

| File | Question |
|------|----------|
| `argocd-setup.md` | "ArgoCD watches my repo. How does CI feed into this — build, push, and trigger a deploy?" |
| `argocd-setup.md` | "ArgoCD is deploying my app — but where do the passwords and API keys actually live?" |
| `cluster-topology.md` | "I've decided on my cluster structure. Now how do I actually carve up the machines inside it?" |
| `gitops-intro.md` | "My manifests are in Git — how do I make the cluster automatically apply them when I merge?" |
| `graceful-shutdown.md` | "My app shuts down cleanly. But during a cluster upgrade, can Kubernetes take all my pods offline at once?" |
| `health-checks-k8s.md` | "Kubernetes knows when my app is sick. But what happens when it decides to restart or move a pod — does traffic just get dropped?" |
| `helm-for-cluster-tools.md` | "I can install cluster tools with Helm. How do I manage all of this with GitOps?" |
| `k8s-cicd-pipeline.md` | "The pipeline works for one environment. How do I promote between staging and production?" |
| `k8s-for-production.md` | "Do I even need to run the cluster control plane myself, or is there a better way?" |
| `k8s-for-production.md` | "My YAML files are getting messy across environments. How do I manage this properly?" |
| `kustomize-basics.md` | "Kustomize handles my manifests. How do I stop applying them by hand?" |
| `managed-vs-self-managed.md` | "I know I'm using a managed cluster. Now — should I have one cluster or many?" |
| `managing-k8s-manifests.md` | "I want a simple way to manage staging and production without duplicating YAML." |
| `managing-k8s-manifests.md` | "I need to install things like cert-manager and nginx-ingress. How does that work?" |
| `multi-env-k8s.md` | "My app is deployed across environments — but how do I make sure it doesn't starve or take down other pods?" |
| `multi-env-k8s.md` | "Everything is running. But how do services talk to each other securely, and how do I know what's going wrong?" |
| `node-pools.md` | "I have my node pools set up — but do I really need to manually decide how many nodes to run?" |
| `node-pools.md` | "I understand my cluster hardware setup. Now how do I manage the workloads that run on it?" |
| `pod-disruption-budgets.md` | "PDBs limit how many pods go down at once. But what if they all land on the same node or zone?" |
| `resource-requests-limits.md` | "Setting static requests worked. But what if my traffic spikes — can the cluster adjust automatically?" |
| `resource-requests-limits.md` | "Resources are set. But how does Kubernetes actually know if my app is healthy?" |
| `service-mesh-problems.md` | "Those problems sound familiar. What actually solves them?" |

---

### `networking` — 1 bad detail

| File | Question | What's wrong |
|------|----------|--------------|
| `ip-addresses.md` | "Every device needs an IP. But how does your device actually get one assigned?" | Narrator recap + explains what DHCP does. Starts answering. |

---

### `observability` — 4 bad details

| File | Question | What's wrong |
|------|----------|--------------|
| `distributed-tracing.md` | "I can observe my system. Now how do I secure it?" | Narrator explains what observability vs security means. Starts answering. |
| `metrics-and-monitoring.md` | "I'm collecting metrics. How do I visualise them usefully?" | Narrator explains what dashboards are for + names Grafana. Fully starts answering. |
| `sli-slo-error-budgets.md` | "I know what I'm measuring. How do I get paged when I'm breaching them?" | Narrator explains what SLOs are and advocates burn-rate alerts. Starts answering. |
| `you-cant-debug-what-you-cant-see.md` | "What's the first thing I should instrument?" | Fully answers the question — names logs as the first thing and explains structured logging. |

---

### `platform` — 2 bad details

| File | Question | What's wrong |
|------|----------|--------------|
| `post-mortems.md` | "We learn from incidents reactively. Can we find weaknesses before they cause incidents?" | Contrasts post-mortems with chaos engineering and defines both. Fully answers the question. |
| `what-is-sre.md` | "SRE sounds like engineering your way out of operational work. What is 'toil' exactly?" | Defines toil in full. Fully answers the question. |

---

### `running` — 6 bad details

| File | Question | What's wrong |
|------|----------|--------------|
| `environment-variables.md` | "My app is configured. How do I keep it running reliably after I close SSH?" | Narrator explains the problem (process dies when SSH closes). Starts answering. |
| `firewall-basics.md` | "My server is set up and secured. Now how do I get my code onto it?" | Narrator recap of what they've configured. Not the user's thought. |
| `initial-server-setup.md` | "My server is secured. How do I install the software my app needs?" | Narrator recap + explains what "installing the runtime" means. Starts answering. |
| `linux-server-basics.md` | "I can manage a Linux server. How do I get my code onto it?" | Narrator recap + defines "deployment." Starts answering. |
| `process-management.md` | "My app is running as a systemd service. How do I see its output and errors?" | Narrator frames "when something goes wrong" and explains what journald does. Starts answering. |
| `tls-and-certificates.md` | "I understand HTTPS and TLS. How do I put it all together and deploy?" | Narrator recap + previews what the next node covers. Starts answering. |

---

### `scaling` — 3 bad details

| File | Question | What's wrong |
|------|----------|--------------|
| `load-balancers.md` | "Load balancer is in place. But now users keep getting randomly logged out. What's going on?" | Narrator names the problem and says it has "a well-understood solution." Starts answering. |
| `session-problem.md` | "Can't I just send each user to the same server every time?" | Names sticky sessions, gives a verdict ("it works — until it doesn't"), and warns about production incidents. Fully answers. |
| `shared-sessions-redis.md` | "Wait — do I even need server-side sessions? What about JWT or signed cookies?" | Describes both approaches and their trade-offs. Fully answers. |

---

## Summary

| Zone | Missing details | Bad details (fails user-voice test) | Total |
|------|----------------|--------------------------------------|-------|
| building | 0 | 4 | 4 |
| containers | 5 | 0 | 5 |
| delivery | 0 | 2 | 2 |
| foundations | 0 | 6 | 6 |
| kubernetes | 0 | 3 | 3 |
| kubernetes-production | 22 | 0 | 22 |
| networking | 0 | 1 | 1 |
| observability | 0 | 4 | 4 |
| platform | 0 | 2 | 2 |
| running | 0 | 6 | 6 |
| scaling | 0 | 3 | 3 |
| **Total** | **27** | **31** | **58** |

## Verification Strategy

### What can be automated
**Missing details** are fully automatable: the audit script parses frontmatter and checks whether every `to` edge `question:` is followed by a `detail:`. After implementation, re-run the script — count must be 0.

**Structural bad patterns** are partially automatable using heuristics:
- Starts with "You know", "You have", "You can" → narrator recap
- Starts with a proper noun (tool name) → likely answering
- Contains "you" as subject address → narrator
- Starts with "This is", "It is", "These are" → narrator framing

### What cannot be automated
A detail can pass all heuristics and still fail the user-voice test — it might be grammatically first-person but editorially be answering or transitioning. This requires a human read.

### Verification steps (after implementation)
1. Run the Python audit script — confirms zero missing details and zero flagged heuristic patterns
2. Print all `to`-edge details for each zone — do a scan to confirm no remaining failures
3. The audit script output is the source of truth for whether there are issues left

### How we found the 58 issues
The audit script was run once before implementation. It found:
- 27 missing details (definitive)
- 31 bad details flagged by heuristics (we manually reviewed all 31 — all confirmed bad)

The 31 confirmed cases cover all the systematic patterns present: narrator recaps, tool descriptions, answers disguised as detail, and editorial transitions. Residual risk of missed cases is low but non-zero — the final scan will catch anything remaining.
