---
id: "databases-and-sql"
title: "Databases & SQL"
zone: "building"
edges:
  from:
    - id: "dynamic-web-app"
      question: "Where does my data actually live? Variables disappear when the app restarts."
      detail: "Your Flask app stores data in Python variables — lists, dictionaries, objects. But the moment you restart the app, everything is gone. Users, orders, cart items — all wiped. A database is a program specifically designed to store data permanently, organize it efficiently, and let you query it fast. Understanding databases is non-negotiable for anyone building or operating real software."
  to:
    - id: "nosql-databases"
      question: "What if my data doesn't fit neatly into rows and columns?"
      detail: "Relational databases work beautifully when your data is structured and predictable — users, orders, products. But what about chat messages with varying metadata, sensor readings with flexible schemas, or user profiles where every user has different fields? NoSQL databases trade the rigid structure of tables for flexibility, and they are everywhere in modern infrastructure."
    - id: "caching-and-redis"
      question: "My app keeps hitting the database for the same data over and over. How do I speed things up?"
      detail: "Every time a user loads a page, your app queries the database. The same product catalog, the same user profile, the same configuration — fetched fresh every single time. Databases are good at storing data, but they are not the fastest way to read data that rarely changes. Caching puts frequently accessed data in memory where it can be retrieved in microseconds instead of milliseconds."
    - id: "file-and-object-storage"
      question: "Users upload images and PDFs. I can't shove binary files into a SQL table, can I?"
      detail: "Databases are designed for structured data — rows, columns, queries. But applications also deal with files: user avatars, uploaded documents, generated reports, log archives. Storing large binary files in a database is technically possible but practically terrible. File and object storage systems are purpose-built for this, and understanding the difference is essential for building real applications."
difficulty: 1
tags: ["database", "sql", "postgresql", "mysql", "sqlite", "relational"]
category: "concept"
milestones:
  - "Create a SQLite database and write basic SQL queries (SELECT, INSERT, UPDATE, DELETE)"
  - "Design a schema with multiple related tables and foreign keys"
  - "Connect a database to a web application and perform CRUD operations"
---

Your Flask app stores a list of products in a Python list. You add a product, it shows up. You restart the app, it is gone. Every piece of data lives in memory, and memory is wiped the moment the process stops. You need somewhere for data to live permanently — somewhere that survives restarts, handles multiple users reading and writing at the same time, and lets you ask complex questions about your data. That is what a database does.

<!-- DEEP_DIVE -->

A **relational database** stores data in tables — rows and columns, like a spreadsheet but with superpowers. Each table represents a type of thing (users, products, orders), each row is one instance, and each column is an attribute. The "relational" part means tables can reference each other through **foreign keys**.

**SQL** (Structured Query Language) is how you talk to relational databases. It is not a programming language in the traditional sense — it is a query language designed specifically for asking questions about data:

```sql
-- Create a table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert data
INSERT INTO users (email, name) VALUES ('alice@example.com', 'Alice');

-- Query data
SELECT * FROM users WHERE email = 'alice@example.com';

-- Update data
UPDATE users SET name = 'Alice Smith' WHERE id = 1;

-- Delete data
DELETE FROM users WHERE id = 1;
```

These four operations — **Create, Read, Update, Delete** — are called **CRUD**, and they are the backbone of almost every application.

**Relationships** are what make relational databases powerful. An order belongs to a user. An order contains multiple products. These connections are expressed with foreign keys:

```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Join tables to get related data
SELECT users.name, orders.total, orders.created_at
FROM orders
JOIN users ON orders.user_id = users.id
WHERE users.email = 'alice@example.com';
```

**Choosing a database** matters. The three you will encounter most:

- **SQLite** — a database in a single file. No server to install, built into Python. Perfect for learning, prototyping, and small applications. Not great for high concurrency.
- **PostgreSQL** — the industry standard for production. Robust, feature-rich, handles complex queries and high concurrency. This is what most serious applications use.
- **MySQL** — widely used, especially in web hosting (WordPress, PHP apps). Solid but historically less feature-rich than PostgreSQL.

```python
# SQLite with Python — no setup needed
import sqlite3

conn = sqlite3.connect("myapp.db")
cursor = conn.cursor()

cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL
    )
""")

cursor.execute("INSERT INTO users (email, name) VALUES (?, ?)",
               ("alice@example.com", "Alice"))
conn.commit()

# Query
cursor.execute("SELECT * FROM users")
print(cursor.fetchall())
```

**Schemas and migrations** are how you manage the structure of your database over time. A schema defines what tables exist and what columns they have. As your app evolves, you need to add columns, create new tables, or change data types. Migration tools (like Alembic for Python) track these changes just like Git tracks code changes.

**Indexes** make queries fast. Without an index, the database has to scan every row to find what you want. With an index, it can jump straight to the right row — like looking up a word in a dictionary instead of reading every page. Always index columns you search or filter on frequently:

```sql
CREATE INDEX idx_users_email ON users(email);
```

**Why SREs care about databases:** Databases are the most common bottleneck in production systems. Slow queries, missing indexes, connection pool exhaustion, replication lag, disk space — these are the things that page you at 3 AM. Understanding how databases work is not optional for anyone operating production software.

<!-- RESOURCES -->

- [SQLBolt - Interactive SQL Tutorial](https://sqlbolt.com/) -- type: interactive, time: 2h
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/) -- type: tutorial, time: 4h
- [Use The Index, Luke](https://use-the-index-luke.com/) -- type: book, time: varies
- [SQLite Documentation](https://www.sqlite.org/docs.html) -- type: reference, time: 30m
