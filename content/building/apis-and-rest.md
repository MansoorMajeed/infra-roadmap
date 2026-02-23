---
id: apis-and-rest
title: APIs & REST
zone: building
edges:
  to:
    - id: it-works-on-my-laptop
      question: I have a clean API. How do I expose it to the world?
      detail: >-
        I can curl my endpoints locally and everything works. But I want someone
        on the other side of the internet to be able to hit these endpoints too
        — and I'm not sure how to get there without just punching holes in
        firewalls and hoping for the best.
difficulty: 1
tags:
  - api
  - rest
  - http
  - json
  - endpoints
  - curl
category: concept
milestones:
  - Build a REST API with proper HTTP methods and status codes
  - Test API endpoints using curl or a tool like Postman
  - 'Understand request/response format, headers, and JSON payloads'
---

Your Flask app returns HTML pages. That is fine for a website, but what if you also want a mobile app? Or a CLI tool? Or another service that needs your data? You do not want to build the same logic three times. An API lets you expose your backend as a service that any client can consume — browser, phone, script, or another server.

<!-- DEEP_DIVE -->

An **API (Application Programming Interface)** is a contract: "Send me this request, I will give you this response." It decouples the client (who wants data or actions) from the server (who provides them). The most common style for web APIs is **REST**.

**REST** (Representational State Transfer) uses standard HTTP methods to operate on resources:

| Method | Purpose | Example |
|--------|---------|---------|
| GET | Read data | `GET /api/users/42` — get user 42 |
| POST | Create data | `POST /api/users` — create a new user |
| PUT | Replace data | `PUT /api/users/42` — replace user 42 |
| PATCH | Update data | `PATCH /api/users/42` — update some fields |
| DELETE | Remove data | `DELETE /api/users/42` — delete user 42 |

A REST API in Flask:

```python
from flask import Flask, request, jsonify

app = Flask(__name__)
users = {}
next_id = 1

@app.route("/api/users", methods=["GET"])
def list_users():
    return jsonify(list(users.values()))

@app.route("/api/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = users.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user)

@app.route("/api/users", methods=["POST"])
def create_user():
    global next_id
    data = request.json
    user = {"id": next_id, "name": data["name"], "email": data["email"]}
    users[next_id] = user
    next_id += 1
    return jsonify(user), 201

@app.route("/api/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    if user_id not in users:
        return jsonify({"error": "User not found"}), 404
    del users[user_id]
    return "", 204
```

**HTTP status codes** tell the client what happened:

- **200 OK** — request succeeded
- **201 Created** — new resource created
- **204 No Content** — success, nothing to return (common for DELETE)
- **400 Bad Request** — client sent invalid data
- **401 Unauthorized** — authentication required
- **403 Forbidden** — authenticated but not allowed
- **404 Not Found** — resource does not exist
- **500 Internal Server Error** — something broke on the server

Using the right status codes is important. Do not return 200 with `{"error": "not found"}` — return 404. Clients (and monitoring tools) rely on status codes.

**JSON** is the lingua franca of APIs. Requests send JSON bodies, responses return JSON. It is human-readable, every language can parse it, and it maps naturally to the objects and dictionaries your code already uses.

**Testing APIs with curl:**

```bash
# GET request
curl http://localhost:5000/api/users

# POST request with JSON body
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com"}'

# DELETE request
curl -X DELETE http://localhost:5000/api/users/1
```

**Headers** carry metadata about the request and response. `Content-Type: application/json` tells the server you are sending JSON. `Authorization: Bearer <token>` sends authentication credentials. `Accept: application/json` tells the server what format you want back.

**API design principles that matter:**

- Use nouns for resources (`/api/users`), not verbs (`/api/getUsers`)
- Use plural names (`/api/users`, not `/api/user`)
- Nest related resources (`/api/users/42/orders` — orders for user 42)
- Use query parameters for filtering (`/api/users?role=admin&active=true`)
- Version your API (`/api/v1/users`) so you can evolve without breaking clients
- Return meaningful error messages with appropriate status codes

**Why SREs care:** APIs are how services communicate in any modern architecture. Monitoring API latency, error rates, and throughput (the "RED metrics" — Rate, Errors, Duration) is fundamental to SRE. When an incident happens, you need to understand which API calls are failing and why. API design also affects reliability — poorly designed APIs lead to cascading failures, retry storms, and outages.

<!-- RESOURCES -->

- [RESTful API Design Best Practices](https://restfulapi.net/) -- type: reference, time: 30m
- [HTTP Status Codes Reference](https://httpstatuses.com/) -- type: reference, time: 10m
- [Postman Learning Center](https://learning.postman.com/) -- type: tutorial, time: 1h
- [curl Tutorial](https://curl.se/docs/tutorial.html) -- type: tutorial, time: 30m
