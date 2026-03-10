---
id: network-debugging-k8s
title: Debugging Kubernetes Networking
zone: kubernetes
edges:
  to: []
difficulty: 3
tags:
  - kubernetes
  - debugging
  - networking
  - tcpdump
  - k8s
category: practice
milestones:
  - >-
    Follow a systematic approach: is it DNS? routing? the pod? the Service? the
    CNI?
  - >-
    Use kubectl exec with curl or wget to test connectivity from inside pods
  - >-
    Know how to use ephemeral debug containers with kubectl debug to attach to
    running pods
  - >-
    Capture packets with tcpdump inside pods or on nodes to trace actual network
    traffic
  - >-
    Diagnose common failures: pod can't reach external DNS, cross-node traffic
    drops, connection resets
  - >-
    Use CNI-specific tools: calicoctl for Calico, cilium status and hubble
    observe for Cilium
  - >-
    Debug network policy issues: applied a policy and broke everything — how to
    identify what's being blocked
---

When networking breaks in Kubernetes, the symptoms are vague — timeouts, connection refused, packets just disappearing. The key is to systematically narrow down which layer is broken: is it DNS? The Service? The CNI? A network policy? This node walks through a structured approach to debugging, with the tools to test each layer.

<!-- DEEP_DIVE -->

## Start with the right question

Before running commands, figure out which layer to investigate:

1. **Can the pod reach the internet?** If not → DNS or CNI issue
2. **Can the pod reach other pods on the same node?** If not → bridge or CNI issue
3. **Can the pod reach pods on other nodes?** If not → cross-node routing, overlay, or firewall issue
4. **Can the pod reach a Service by ClusterIP?** If not → kube-proxy or iptables issue
5. **Can the pod resolve Service names?** If not → CoreDNS issue
6. **Was everything working until you applied a NetworkPolicy?** → Policy issue

This ordering goes from the broadest scope to the narrowest. Start at the top and stop when you find the broken layer.

## The debugging toolkit

Most production container images are minimal — no curl, no dig, no ping. You need a way to get debugging tools into the picture.

### Ephemeral debug containers

The best approach — attach a debug container to a running pod without restarting it:

```bash
# Attach a debug container with networking tools
kubectl debug -it my-pod --image=nicolaka/netshoot --target=my-container

# Now you're inside a container that shares the pod's network namespace
# You can use curl, dig, tcpdump, ping, traceroute, etc.
```

The `netshoot` image is specifically built for this — it has every networking tool you'd want.

### Standalone debug pod

If you don't need to debug from a specific pod's perspective:

```bash
kubectl run debug --rm -it --image=nicolaka/netshoot -- bash
```

### Debug from the node

Sometimes the problem is at the node level, not inside a pod:

```bash
# On managed clusters, you can debug a node
kubectl debug node/my-node -it --image=ubuntu

# This gives you a shell on the node with access to the host network
# You can inspect iptables rules, routing tables, CNI config
chroot /host    # to access the node's filesystem
```

## Testing connectivity layer by layer

### Pod to pod (same node)

```bash
# Find two pods on the same node
kubectl get pods -o wide

# From pod A, curl pod B by IP
kubectl exec pod-a -- curl -s --max-time 3 <pod-b-ip>:8080
```

If this fails, the problem is local to the node — veth pairs, bridge, or CNI configuration.

### Pod to pod (cross-node)

```bash
# Find two pods on different nodes
kubectl get pods -o wide

# From pod on node-1, curl pod on node-2 by IP
kubectl exec pod-on-node1 -- curl -s --max-time 3 <pod-on-node2-ip>:8080
```

If same-node works but cross-node doesn't, the problem is in the overlay/routing between nodes. Check:
- Can the nodes themselves ping each other?
- Is the CNI pod healthy on both nodes?
- Are there firewall rules between nodes blocking the overlay port (VXLAN uses UDP 4789)?

### Pod to Service

```bash
# Test by ClusterIP
kubectl exec debug -- curl -s --max-time 3 <cluster-ip>:80

# Test by DNS name
kubectl exec debug -- curl -s --max-time 3 my-service.default.svc.cluster.local
```

If pod-to-pod works but pod-to-Service doesn't, the problem is in kube-proxy's iptables/IPVS rules. Check:
- Does the Service have endpoints? `kubectl get endpoints my-service`
- Are kube-proxy pods running? `kubectl get pods -n kube-system | grep kube-proxy`

### DNS resolution

```bash
# Test internal DNS
kubectl exec debug -- nslookup my-service.default.svc.cluster.local

# Test external DNS
kubectl exec debug -- nslookup google.com

# Check what the pod thinks the nameserver is
kubectl exec debug -- cat /etc/resolv.conf
```

If DNS fails, check CoreDNS health: `kubectl get pods -n kube-system -l k8s-app=kube-dns`

## Packet capture with tcpdump

When you need to see exactly what's on the wire:

```bash
# Capture inside a pod (using a debug container)
kubectl debug -it my-pod --image=nicolaka/netshoot --target=my-container
tcpdump -i eth0 -n port 8080

# Capture on a node (see all traffic, including encapsulated overlay)
kubectl debug node/my-node -it --image=nicolaka/netshoot
tcpdump -i any -n host <pod-ip>
```

Things to look for:
- **SYN packets going out but no SYN-ACK coming back** → the destination is unreachable (routing, firewall, or the destination pod isn't listening)
- **SYN-ACK coming back but RST immediately after** → the destination is rejecting the connection (wrong port, application not listening)
- **Packets flowing but no HTTP response** → application-level issue, not networking

## Network policy debugging

Network policies are the most common cause of "it was working, then it stopped." If you recently applied a NetworkPolicy:

```bash
# List all network policies in the namespace
kubectl get networkpolicies -n my-namespace

# Describe a specific policy to see what it allows/blocks
kubectl describe networkpolicy my-policy -n my-namespace
```

The key gotcha: a default-deny policy blocks ALL traffic unless explicit allow rules match. If you applied a deny-all policy and only allowed ingress on port 80, your pod can't reach DNS (port 53) or other services — you need to explicitly allow egress too.

With Cilium, debugging is easier:

```bash
# See dropped traffic (shows exactly which policy blocked it)
hubble observe --verdict DROPPED --namespace my-namespace

# See all flows for a specific pod
hubble observe --pod my-namespace/my-pod
```

## CNI-specific debugging

### Calico

```bash
# Check Calico node status
kubectl exec -n kube-system calico-node-xxxxx -- calico-node -bird-ready
calicoctl node status

# Check routes Calico programmed
calicoctl get workloadEndpoints -n my-namespace
```

### Cilium

```bash
# Check Cilium agent health
kubectl exec -n kube-system cilium-xxxxx -- cilium status

# Check endpoint (pod) connectivity
kubectl exec -n kube-system cilium-xxxxx -- cilium endpoint list

# Network flows via Hubble
hubble observe --namespace my-namespace
```

## The usual suspects

| Symptom | Most likely cause |
|---------|-------------------|
| Pods stuck in ContainerCreating | CNI pod crashed or CNI binary missing |
| Cross-node traffic fails | Overlay port (UDP 4789) blocked by firewall, or CNI pod unhealthy on one node |
| Service ClusterIP unreachable | kube-proxy not running, or endpoints empty (label mismatch) |
| DNS timeout | CoreDNS overloaded or crash-looping |
| Intermittent DNS failures | ndots:5 generating extra queries, or conntrack table full |
| Everything broke after applying a policy | Default-deny policy without sufficient allow rules |

<!-- RESOURCES -->

- [Kubernetes Docs - Debug Services](https://kubernetes.io/docs/tasks/debug/debug-application/debug-service/) -- type: docs, time: 15m
- [netshoot - Container Networking Debugging](https://github.com/nicolaka/netshoot) -- type: tool, time: 10m
- [Kubernetes Docs - Ephemeral Debug Containers](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/#ephemeral-container) -- type: docs, time: 10m
