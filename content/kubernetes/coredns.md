---
id: coredns
title: CoreDNS and Cluster DNS
zone: kubernetes
edges:
  to:
    - id: dns-debugging-k8s
      question: >-
        My DNS lookups are randomly slow — some take 5 seconds, some fail
        entirely. Where do I even start?
      detail: >-
        Pods resolve service names most of the time, but under load, DNS gets
        flaky. Sometimes lookups time out. I also noticed that resolving
        `api.stripe.com` from inside a pod takes way longer than it should. I
        don't know if it's CoreDNS, my resolv.conf, or something else.
difficulty: 2
tags:
  - kubernetes
  - coredns
  - dns
  - service-discovery
  - k8s
category: concept
milestones:
  - >-
    Know that CoreDNS runs as pods in kube-system and is the cluster's DNS
    server
  - >-
    Understand that every pod's /etc/resolv.conf is configured to point at the
    CoreDNS Service IP
  - >-
    Know the naming convention:
    <service>.<namespace>.svc.cluster.local
  - >-
    Understand headless Services: DNS returns pod IPs directly instead of a
    single ClusterIP
  - >-
    Know how CoreDNS watches the API server for Service and Endpoint changes to
    keep DNS records up to date
  - >-
    Understand ExternalName Services: a DNS CNAME that points to an external
    hostname
---

TODO
