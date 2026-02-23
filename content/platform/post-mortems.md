---
id: "post-mortems"
title: "Blameless Post-Mortems"
zone: "platform"
edges:
  from:
    - id: "incident-management"
      question: "Incident resolved. How do we make sure it doesn't happen again?"
      detail: "Resolving an incident stops the pain. A post-mortem prevents it from recurring. The blameless post-mortem is the core SRE learning mechanism: reconstruct what happened, identify the systemic causes, and commit to specific changes — without blaming individuals."
    - id: "incident-communication"
      question: "Communication is done. Now how do we learn from this?"
      detail: "The post-mortem brings the technical and communication threads together. It's the document that explains what happened, why your systems and processes failed, what you told customers, and what you're committing to change. Done well, it builds trust — internally and externally."
  to:
    - id: "chaos-engineering"
      question: "We learn from incidents reactively. Can we find weaknesses before they cause incidents?"
      detail: "Post-mortems help us learn, but we only find out about a weakness after it's already hurt us. Is there a way to actually stress-test the system on purpose — before something breaks in production instead of after?"
difficulty: 2
tags: ["post-mortem", "blameless", "sre", "incident-review", "learning", "reliability"]
category: "practice"
milestones:
  - "Write a post-mortem for a real or simulated incident using a standard template"
  - "Identify contributing factors without assigning individual blame"
  - "Generate action items with owners and deadlines — not vague 'we should improve X'"
  - "Run a post-mortem review meeting and publish the document internally"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
