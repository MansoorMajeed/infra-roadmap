---
id: "file-and-object-storage"
title: "File & Object Storage"
zone: "building"
edges:
  from:
    - id: "databases-and-sql"
      question: "Users upload images and PDFs. I can't shove binary files into a SQL table, can I?"
      detail: "Databases are designed for structured data — rows, columns, queries. But applications also deal with files: user avatars, uploaded documents, generated reports, log archives. Storing large binary files in a database is technically possible but practically terrible. File and object storage systems are purpose-built for this, and understanding the difference is essential for building real applications."
  to:
    - id: "it-works-on-my-laptop"
      question: "I can handle files and data. Now how do I deploy all of this?"
      detail: "Your application now handles structured data in a database and files in storage. Locally, the files just sit on your filesystem. But in production, where do they go? You cannot rely on a single server's disk. This is where cloud storage, networking, and deployment architecture all come together."
difficulty: 2
tags: ["storage", "s3", "object-storage", "files", "blob", "cdn"]
category: "concept"
milestones:
  - "Understand the difference between file storage, block storage, and object storage"
  - "Handle file uploads in a web application and store them on disk"
  - "Use an S3-compatible API to store and retrieve objects"
---

Your app lets users upload profile pictures. Where do those images go? You could base64-encode them and store them in a database column — but your database will balloon in size, queries will slow to a crawl, and your DBA will cry. Files and databases are different kinds of data, and they need different kinds of storage.

<!-- DEEP_DIVE -->

**File storage** is what you already know — directories and files on a filesystem. `/home/user/photos/vacation.jpg`. It is hierarchical (folders within folders), supports permissions, and every operating system understands it. For a small app running on a single server, storing uploads on the local filesystem is perfectly fine:

```python
import os
from flask import Flask, request

app = Flask(__name__)
UPLOAD_DIR = "/var/uploads"

@app.route("/upload", methods=["POST"])
def upload_file():
    file = request.files["avatar"]
    filename = f"{user_id}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    file.save(filepath)
    return {"path": filepath}
```

This works on your laptop. But what happens when you have two servers behind a load balancer? A user uploads to server A, and their next request hits server B — which does not have the file. Local filesystem storage does not scale.

**Object storage** (Amazon S3, Google Cloud Storage, Azure Blob Storage) solves this. Instead of files in directories, you have **objects** in **buckets**. Each object has a key (like a filepath), the data itself, and metadata. There is no real directory hierarchy — the "folders" you see in S3 are just key prefixes.

```python
import boto3

s3 = boto3.client("s3")

# Upload a file
s3.upload_file("local_photo.jpg", "my-app-uploads", "avatars/user_123.jpg")

# Generate a URL anyone can use to download it
url = s3.generate_presigned_url(
    "get_object",
    Params={"Bucket": "my-app-uploads", "Key": "avatars/user_123.jpg"},
    ExpiresIn=3600  # URL valid for 1 hour
)
```

Object storage is fundamentally different from a filesystem:

- **Virtually unlimited capacity** — you do not manage disks, S3 scales for you
- **Built-in redundancy** — your data is replicated across multiple data centers automatically
- **HTTP accessible** — every object has a URL, making it easy to serve to users
- **Flat namespace** — no real directories, just keys like `avatars/user_123.jpg`
- **No append or partial update** — you replace the whole object or nothing

**Block storage** (AWS EBS, GCP Persistent Disks) is the third type. It provides raw disk volumes that you attach to a server and format with a filesystem. It is what your cloud VM's hard drive actually is. You rarely interact with it directly unless you are doing database administration or need high-performance disk I/O.

**When to use what:**

| Type | Use case | Example |
|------|----------|---------|
| Object storage (S3) | User uploads, static assets, backups, logs | Profile pictures, PDF reports, log archives |
| File storage (EFS/NFS) | Shared filesystem across servers | Legacy apps that need POSIX filesystem |
| Block storage (EBS) | Database storage, high-performance I/O | PostgreSQL data directory, application state |
| Database | Structured, queryable data | User records, orders, relationships |

**CDNs (Content Delivery Networks)** sit in front of your object storage and cache files at edge locations around the world. When a user in Tokyo requests an image, they get it from a nearby CDN node instead of your S3 bucket in Virginia. CloudFront, Cloudflare, and Fastly are the big names. For any app serving static content globally, a CDN is essential.

**Why SREs care:** Storage is one of the three fundamental infrastructure resources (compute, storage, networking). Understanding storage tiers, costs, durability guarantees, and performance characteristics is core to infrastructure design. S3 in particular is everywhere — application data, infrastructure backups, Terraform state, CloudTrail logs, and more.

<!-- RESOURCES -->

- [Amazon S3 Documentation](https://docs.aws.amazon.com/s3/) -- type: reference, time: varies
- [Cloud Storage Explained (AWS vs GCP vs Azure)](https://cloud.google.com/learn/what-is-object-storage) -- type: article, time: 15m
- [MinIO - Self-hosted S3-compatible Storage](https://min.io/docs/minio/linux/index.html) -- type: tool, time: 30m
- [Cloudflare CDN Docs](https://developers.cloudflare.com/cache/) -- type: reference, time: 20m
