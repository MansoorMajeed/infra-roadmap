---
id: "tcp-udp-basics"
title: "TCP, UDP & How Data Travels"
zone: "networking"
edges:
  from:
    - id: "local-network"
      question: "Devices can find each other on my network. But how does the data actually get there reliably?"
      detail: "You know your phone and laptop are on the same network and can reach each other by IP address. But when your browser loads a page, how does the data actually travel? How does the server know what order to reassemble the pieces? How does it know if something got lost? That is where transport protocols — TCP and UDP — come in."
  to:
    - id: "web-servers"
      question: "I understand how data travels. Now what sits between the internet and my app?"
      detail: "Your app can listen on a port and speak TCP, but you should not expose it directly to the internet. Web servers like Nginx and Apache sit in front of your application — they handle SSL, serve static files, manage connections, and forward requests to your app. Understanding reverse proxies is essential for deploying any web application properly."
difficulty: 1
tags: ["tcp", "udp", "networking", "ports", "ip-addresses", "protocols"]
category: "concept"
milestones:
  - "Explain the difference between TCP and UDP"
  - "Use netcat to send data between two machines"
  - "Identify what port a service is listening on using ss or lsof"
---

Your app works on localhost, but when you try to share it, nothing happens. To understand why, you need to understand how data actually moves between computers. Every time you load a webpage, send a message, or make an API call, data is being broken into packets and routed across networks using protocols — primarily TCP and UDP. These are the fundamental building blocks of all network communication.

<!-- DEEP_DIVE -->

**IP addresses** identify machines on a network. Think of them as street addresses — if you want to send a letter, you need to know where it is going. IPv4 addresses look like `192.168.1.42` (four numbers, 0-255 each). Every device on a network has one. Your home network uses private IPs (192.168.x.x, 10.x.x.x), while servers on the internet have public IPs that anyone can route to.

**Ports** identify specific services on a machine. If the IP address is the street address, the port is the apartment number. A single machine can run dozens of services — a web server on port 80, your Flask app on port 5000, a database on port 5432, SSH on port 22. When you type `http://localhost:5000`, you are telling your browser to connect to your own machine (localhost), specifically to whatever is listening on port 5000.

**TCP** (Transmission Control Protocol) is the reliable protocol. When your browser loads a webpage, it uses TCP. Here is what happens:

1. **Three-way handshake** — Your computer sends a SYN (synchronize) packet, the server responds with SYN-ACK, your computer sends ACK. Connection established. This takes milliseconds but it happens every time.
2. **Data transfer** — Your HTTP request is broken into segments, each one numbered. The server acknowledges each segment it receives.
3. **Reliability** — If a segment is lost, TCP detects it (no acknowledgment arrived) and retransmits. It guarantees that data arrives complete and in order.
4. **Connection teardown** — When done, both sides exchange FIN packets to close cleanly.

TCP is used for HTTP/HTTPS, SSH, email, database connections — anything where you cannot afford to lose data. If a packet containing part of your checkout form gets lost, TCP makes sure it gets retransmitted.

**UDP** (User Datagram Protocol) is the fast protocol. It does not do handshakes, does not guarantee delivery, does not ensure ordering. You just fire packets and hope they arrive. Why would anyone want this? Speed. UDP has less overhead, lower latency, and is perfect for cases where a few lost packets do not matter — video streaming, online gaming, DNS queries, voice calls. If one frame of a video call is lost, you do not want to pause and retransmit — you just skip it and move on.

You can see TCP in action with **netcat** (`nc`), a simple networking tool:

```bash
# Terminal 1 - start a listener on port 9000
nc -l 9000

# Terminal 2 - connect to it
nc localhost 9000
```

Type in Terminal 2, and the text appears in Terminal 1. You just sent data over TCP. This is exactly what your web app does, just with more structure (HTTP) on top.

To see what ports are in use on your machine:

```bash
# Show all listening ports
ss -tlnp

# Or on macOS
lsof -iTCP -sTCP:LISTEN -n -P
```

You will see your Flask app on port 5000, maybe a database on 5432, SSH on 22. Each one is a service waiting for TCP connections.

**The key insight**: when your app listens on `localhost:5000`, it is listening for TCP connections on port 5000, but only from the loopback interface (your own machine). When you change to `0.0.0.0:5000`, it listens on all interfaces, including your network card — so other machines that can reach your IP can connect. But getting traffic from the internet to your machine requires more: routing, possibly port forwarding, and typically a web server sitting in front of your app.

<!-- RESOURCES -->

- [Beej's Guide to Network Programming](https://beej.us/guide/bgnet/) -- type: book, time: varies
- [TCP/IP Illustrated - Kevin Fall & W. Richard Stevens](https://www.oreilly.com/library/view/tcpip-illustrated-volume/9780132808200/) -- type: book, time: varies
- [Cloudflare - What is TCP?](https://www.cloudflare.com/learning/ddos/glossary/tcp-ip/) -- type: article, time: 10m
- [Julia Evans - Networking Zine](https://jvns.ca/blog/2019/06/23/a-few-things-about-computer-networking/) -- type: article, time: 15m
