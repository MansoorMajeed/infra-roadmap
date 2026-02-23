---
id: ports-and-listening
title: Ports and How Apps Listen for Traffic
zone: running
edges:
  to:
    - id: firewall-basics
      question: >-
        My app is listening on a port. Who can actually connect to it from the
        internet?
      detail: >-
        My app is listening on port 5000 but I still can't reach it from outside
        the server. I've heard there's a firewall that might be blocking it —
        but I don't know how to check or fix that.
difficulty: 1
tags:
  - ports
  - tcp
  - sockets
  - listening
  - 0.0.0.0
  - 127.0.0.1
  - netstat
  - ss
category: concept
milestones:
  - Explain the difference between 0.0.0.0 and 127.0.0.1 and when to use each
  - Use ss -tlnp to see what processes are listening on which ports
  - Understand why non-root users cannot bind to ports below 1024
---

When your web app starts, it opens a socket and listens on a port — waiting for incoming connections. HTTP traffic goes to port 80. HTTPS to 443. SSH to 22. Your Flask or Express app probably listens on 3000 or 5000. A port is just a number that tells the operating system which process should receive a given packet.

Understanding ports — what they are, which address your app binds to, and how to inspect what is running — is essential for debugging the inevitable "why can't I reach my app?" problems.

<!-- DEEP_DIVE -->

**What is a port?**

A server has one IP address (say, `143.198.100.50`) but can run many services at once: a web server, an SSH server, a database, your app. Ports are how the OS tells them apart.

When a packet arrives at the server with `destination port 80`, the OS delivers it to whichever process is listening on port 80. When a packet arrives for port 5000, it goes to your Flask app.

Ports range from 0 to 65535:
- **0–1023**: Well-known ports. Require root to bind. HTTP=80, HTTPS=443, SSH=22, DNS=53.
- **1024–49151**: Registered ports. Common apps: Redis=6379, Postgres=5432, MySQL=3306, Node apps typically use 3000–9000.
- **49152–65535**: Ephemeral ports. Used temporarily for outgoing connections.

**The address your app binds to**

When your app listens, it binds to an IP address AND a port. This matters a lot:

```
0.0.0.0:5000   → listen on ALL network interfaces — reachable from the internet
127.0.0.1:5000 → listen on loopback only — only reachable from the server itself
```

For security, your app should bind to `127.0.0.1`, and Nginx (your reverse proxy) should handle traffic from the internet on port 80/443. Nginx then forwards requests to `127.0.0.1:5000` internally. This way, your app is never directly exposed to the internet.

```python
# Flask — bind to localhost only (correct for production)
app.run(host='127.0.0.1', port=5000)

# Flask — bind to all interfaces (only do this for testing)
app.run(host='0.0.0.0', port=5000)
```

```javascript
// Express
app.listen(3000, '127.0.0.1', () => {
  console.log('Listening on 127.0.0.1:3000');
});
```

**Why non-root users cannot bind to ports below 1024**

Ports 1–1023 are privileged. The kernel requires root (or the `CAP_NET_BIND_SERVICE` capability) to bind to them. This is why:

- Your app should NOT run as root just to use port 80
- Instead: run your app on port 5000 (or 3000, 8000, etc.) as a normal user
- Run Nginx as root briefly to bind port 80/443, then drop to a lower-privilege worker

Trying to bind a privileged port as a non-root user gives you:
```
Error: listen EACCES: permission denied 0.0.0.0:80
```

The fix is not to run your app as root. The fix is to use Nginx as a reverse proxy.

**Checking what is listening**

`ss` (socket statistics) is the modern replacement for `netstat`:

```bash
# Show all TCP ports that are listening, with the process name
sudo ss -tlnp

# Output looks like:
# State   Recv-Q  Send-Q  Local Address:Port  Peer Address:Port  Process
# LISTEN  0       128     127.0.0.1:5000      0.0.0.0:*          users:(("python3",pid=12345))
# LISTEN  0       511     0.0.0.0:80          0.0.0.0:*          users:(("nginx",pid=1001))
# LISTEN  0       128     0.0.0.0:22          0.0.0.0:*          users:(("sshd",pid=892))

# Flags:
# -t  TCP only
# -l  listening sockets only
# -n  show port numbers, not service names
# -p  show which process owns the socket (requires sudo)
```

Quick test — can you reach your app locally?

```bash
# If your app is on 127.0.0.1:5000, test it from the server itself
curl http://127.0.0.1:5000/

# If you get a response, the app is running and reachable locally
# If you get "Connection refused", the app is not listening on that port
```

**How traffic flows (the full picture)**

```
Browser on the internet
    ↓ TCP connection to 143.198.100.50:443
Server's network interface (public IP)
    ↓ Firewall checks: is port 443 allowed?
Nginx (listening on 0.0.0.0:443)
    ↓ TLS termination, then proxy_pass http://127.0.0.1:5000
Your Flask/Node app (listening on 127.0.0.1:5000)
    ↓ Processes the request, returns response
Back through Nginx to the browser
```

This is the standard architecture. Nginx is the only thing listening on the public IP for ports 80/443. Your app is only reachable internally via localhost.

**Common mistakes**

- **Binding to `0.0.0.0` in production** — your app is directly reachable from the internet, bypassing Nginx, TLS, and any rate limiting
- **Forgetting to check what is already on a port** — you try to start your app and it fails because something else already claimed that port. Check with `ss -tlnp`.
- **Running your app on port 80 as root** — root is not needed for your app. Use Nginx on 80 and your app on an unprivileged port.

<!-- RESOURCES -->

- [ss command reference](https://man7.org/linux/man-pages/man8/ss.8.html) -- type: reference, time: 10m
- [Linux Well-Known Ports (Wikipedia)](https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers) -- type: reference, time: 5m
