---
id: encryption-basics
title: 'Encryption: Why and How'
zone: networking
edges:
  to:
    - id: tls-and-certificates
      zone: running
      question: >-
        I understand encryption. How does the web actually use it to secure
        traffic?
      detail: >-
        I understand the building blocks — symmetric keys, asymmetric keys, the
        key exchange problem. But how does any of that play out when my browser
        connects to an HTTPS site for the first time? How does it establish a
        secure channel with a server it's never talked to before?
difficulty: 2
tags:
  - encryption
  - cryptography
  - symmetric
  - asymmetric
  - keys
  - security
category: concept
milestones:
  - Explain the difference between symmetric and asymmetric encryption
  - Understand why HTTPS matters and what plaintext HTTP exposes
  - Describe the key exchange problem and how asymmetric encryption solves it
---

Run `curl -v http://example.com` and look at what goes over the wire. The entire HTTP request — the URL, the headers, the body with your password — travels across the network as readable text. Anyone sitting between you and the server can read it. Your ISP, the coffee shop WiFi operator, any compromised router along the way. This is not a theoretical risk — it is trivially easy. Encryption makes the data unreadable to everyone except the intended recipient.

<!-- DEEP_DIVE -->

**Encryption** is the process of scrambling data so that only someone with the right key can read it. The original data is called **plaintext**, and the scrambled version is called **ciphertext**. Without the key, the ciphertext looks like random garbage.

There are two fundamental approaches:

**Symmetric encryption** uses the same key to encrypt and decrypt. Think of it like a lockbox with one key — you lock the box, send it to your friend, and they unlock it with an identical key. It is fast and efficient, which makes it perfect for encrypting large amounts of data.

```
Key:        "my-secret-key-123"

Plaintext:  "password=hunter2&card=4111111111111111"
    ↓ encrypt with key
Ciphertext: "a7f3b2e91d... (unreadable garbage)"
    ↓ decrypt with same key
Plaintext:  "password=hunter2&card=4111111111111111"
```

The algorithms you will encounter: **AES** (Advanced Encryption Standard) is the gold standard — it is what your bank uses, what your phone uses for disk encryption, what almost everything uses. AES-256 (256-bit key) is considered unbreakable with current technology.

**The problem with symmetric encryption:** How do you share the key? If you and the server both need the same key, someone has to send it first. But if you send the key over the network in plaintext, anyone watching can grab it — and then your encryption is worthless. You cannot encrypt the key because you do not have a shared key yet. This is the **key exchange problem**, and it stumped cryptographers for decades.

**Asymmetric encryption** (also called public-key cryptography) solves this. Instead of one key, you have a **key pair** — a public key and a private key. They are mathematically linked but you cannot derive one from the other:

- **Public key** — you share this with everyone. Anyone can use it to encrypt data.
- **Private key** — you keep this secret. Only you can decrypt data encrypted with your public key.

```
Server generates a key pair:
  Public key:  (shared openly)
  Private key: (kept secret on server)

Your browser:
  1. Gets the server's public key
  2. Encrypts data with the public key
  3. Sends the ciphertext

The server:
  1. Receives the ciphertext
  2. Decrypts with its private key
  3. Reads the original data

Anyone intercepting the ciphertext cannot decrypt it —
they don't have the private key.
```

The most common asymmetric algorithm is **RSA**. Others include **ECDSA** (Elliptic Curve) and **Ed25519** — you have seen Ed25519 if you have ever generated an SSH key with `ssh-keygen -t ed25519`.

**Asymmetric encryption is slow.** Much slower than symmetric. Encrypting an entire web page with RSA would be painfully slow. So in practice, the web uses **both**:

1. Asymmetric encryption to securely exchange a symmetric key (solving the key exchange problem)
2. Symmetric encryption (AES) for the actual data transfer (fast)

This is exactly what happens when your browser connects to a website over HTTPS. The two sides use asymmetric crypto to agree on a shared symmetric key, and then use that key for the rest of the conversation. You get the security of asymmetric key exchange with the speed of symmetric encryption.

**Hashing** is related but different. A hash function takes input of any size and produces a fixed-size output (a "digest"). It is a one-way function — you cannot reverse a hash to get the original input. Hashing is used for:

- **Password storage** — store the hash, not the password. When a user logs in, hash their input and compare.
- **Data integrity** — hash a file, send the file and the hash. The recipient hashes the file and checks if it matches.
- **Digital signatures** — hash a message, encrypt the hash with a private key. Anyone with the public key can verify the signature.

Common hash functions: **SHA-256** (secure, widely used), **bcrypt/argon2** (designed for passwords, intentionally slow).

```bash
# Hash a string with SHA-256
echo -n "hello world" | sha256sum
# b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9

# Change one character, the hash changes completely
echo -n "hello worle" | sha256sum
# completely different hash
```

**Why SREs care:** Encryption is not optional — it is the foundation of secure communication. Understanding symmetric vs asymmetric, key exchange, and hashing helps you debug TLS issues, manage certificates, configure SSH, handle secrets management, and understand security incidents. Every HTTPS connection, every SSH session, every API call with an auth token relies on these concepts.

<!-- RESOURCES -->

- [Khan Academy - Cryptography](https://www.khanacademy.org/computing/computer-science/cryptography) -- type: interactive, time: 2h
- [Cloudflare - What is encryption?](https://www.cloudflare.com/learning/ssl/what-is-encryption/) -- type: article, time: 10m
- [The Code Book - Simon Singh](https://simonsingh.net/books/the-code-book/) -- type: book, time: varies
- [Practical Cryptography for Developers (free)](https://cryptobook.nakov.com/) -- type: book, time: varies
