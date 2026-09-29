---
title: "26. Introduction to NoSQL Databases"
tags:
  - CSC270
  - NoSQL
  - CAP Theorem
  - Distributed Databases
---

# 26. Introduction to NoSQL Databases

Every lecture so far has taken one design as given: data lives in tables, tables have a fixed
schema, and a single well-provisioned server (or a tightly-coupled cluster around it) holds the
whole database. That design has served the industry for decades, and it still runs the
overwhelming majority of the world's transactional systems. But it was never designed for the
scale, shape of data, and access patterns that internet-scale applications throw at it —
hundreds of millions of users, documents that don't look alike from one record to the next,
and traffic that a single machine, however large, cannot absorb. **NoSQL** databases are the
family of systems built specifically to answer those pressures, by relaxing exactly the
guarantees the relational model insists on. This lecture is the bridge from everything you know
about the relational model into three lectures of hands-on MongoDB.

## In This Lecture

- What relational databases start to struggle with at web scale
- The shared characteristics that define "NoSQL" as a category
- A direct, dimension-by-dimension comparison: relational vs. NoSQL
- The four major families of NoSQL database, with a real product example for each
- The advantages NoSQL trades for, and the limitations that come with them
- Realistic use cases where reaching for NoSQL is the right call
- The **CAP theorem** — why a distributed database can't have everything at once

## The Need for NoSQL

Picture a social-media startup's database, watched over three stages of growth:

- **At 1,000 users**, a single relational server handles everything comfortably — posts,
  comments, likes, friend relationships, all cleanly normalized across a handful of tables,
  exactly the way Units 3–5 taught you to design them.
- **At 10 million users**, writes alone (posts, likes, comments, arriving every second from
  every timezone) start to outpace what one server's disk and CPU can absorb, no matter how it's
  tuned. The obvious fix — buy a bigger server — is **vertical scaling**, and it has a hard
  ceiling: there is only so large a single machine gets, and the biggest machines available are
  disproportionately expensive.
- **At 500 million users**, the friend-of-a-friend queries that a normalized schema needs
  (join `Users` to `Friendships` to `Users` again, repeatedly) become genuinely expensive at
  that volume, and every new post "type" the product team dreams up (a poll, a shared location,
  a live video) means another schema migration on a table nobody can afford to lock for long.

None of this means the relational model is "wrong" — it means it optimized for a different
problem: strong consistency and rich, ad-hoc querying over a schema known in advance. NoSQL
systems exist for the workloads where those specific guarantees are less important than raw
horizontal scale and schema flexibility.

<div class="db-grid-2" markdown>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Vertical scaling — the relational default</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-orange" markdown><span class="db-node-title">One server</span><span class="db-node-sub">Grows by adding CPU, RAM, faster disks to the same box</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title">Bigger server</span><span class="db-node-sub">Hard ceiling — and cost rises much faster than capacity</span></div>
</div>
</div>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Horizontal scaling — the NoSQL default</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown><span class="db-node-title">Server 1</span></div>
<div class="db-node db-node-teal" markdown><span class="db-node-title">Server 2</span></div>
<div class="db-node db-node-teal" markdown><span class="db-node-title">Server N</span><span class="db-node-sub">Add more ordinary machines as load grows</span></div>
</div>
</div>

</div>

## Characteristics of NoSQL Databases

Despite covering very different products, NoSQL databases tend to share a common set of
traits:

- **Schema-flexible (often "schema-less")** — records don't need to share the same fields, and
  new fields can be added on the fly, with no `ALTER TABLE` and no downtime.
- **Horizontally scalable by design** — built from the ground up to spread data and load across
  many ordinary servers, rather than depend on one powerful one.
- **Often eventually consistent** — many NoSQL systems relax strict consistency in exchange for
  availability and speed, following the **BASE** model (Basically Available, Soft state,
  Eventual consistency) instead of the relational model's strict **ACID** guarantees.
- **Optimized for specific access patterns** — rather than a general-purpose query language
  like SQL, each NoSQL family is built around the handful of operations it needs to be
  extremely fast at (get-by-key, get-by-document-id, traverse-this-graph).

## Relational vs. NoSQL Databases

| Dimension | Relational (SQL) | NoSQL |
|---|---|---|
| Schema flexibility | Fixed, defined in advance; changes need `ALTER TABLE` | Flexible or absent; documents/records can differ in shape |
| Scaling model | Primarily vertical (bigger server); horizontal scaling is possible but hard | Horizontal by default (add more servers) |
| Consistency model | Strong consistency, ACID transactions | Often eventual consistency, BASE model (varies by product) |
| Query language | SQL — standardized across vendors | Varies per product (MongoDB's query API, CQL, Gremlin, …) |
| Typical use case | Banking, ERP, anything needing strict integrity and complex joins | Content management, catalogs, real-time analytics, social graphs |

!!! note "This is a spectrum, not a strict line"
    Modern relational engines support JSON columns and horizontal read replicas, and several
    NoSQL products (MongoDB included) now support multi-document ACID transactions. The table
    above describes the *default center of gravity* of each family, not an absolute rule every
    product in it obeys.

## Types of NoSQL Databases

NoSQL is an umbrella term covering four major data-model families:

<div class="db-grid-2" markdown>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Document Store</p>
<div class="db-node db-node-teal" markdown><span class="db-node-title">MongoDB</span><span class="db-node-sub">Stores self-contained, JSON-like documents grouped into collections. Each document can have its own shape.</span></div>
</div>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Key-Value Store</p>
<div class="db-node db-node-purple" markdown><span class="db-node-title">Amazon DynamoDB / Redis</span><span class="db-node-sub">Stores an opaque value against a unique key — extremely fast lookups, minimal querying beyond "get this key."</span></div>
</div>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Column-Family Store</p>
<div class="db-node db-node-orange" markdown><span class="db-node-title">Apache Cassandra</span><span class="db-node-sub">Stores data in wide rows grouped by column families, tuned for very high write throughput across many nodes.</span></div>
</div>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Graph Database</p>
<div class="db-node db-node-teal" markdown><span class="db-node-title">Neo4j</span><span class="db-node-sub">Stores nodes and the relationships (edges) between them, purpose-built for traversal queries like "friends of friends."</span></div>
</div>

</div>

## NoSQL Data Models

Each family above pairs its product with a distinct way of organizing data:

- **Document model** — a self-contained, nested, JSON-like structure per record (MongoDB's
  BSON documents — the subject of Lecture 27).
- **Key-value model** — the simplest possible model: an opaque value retrieved only by its
  exact key, with no structure the database itself understands.
- **Column-family (wide-column) model** — rows identified by a key, but with columns grouped
  into families that can vary from row to row, optimized for very wide, sparse datasets.
- **Graph model** — data modeled explicitly as nodes and the edges connecting them, so
  relationship traversal (rather than a join) is the primitive operation.

## Advantages and Limitations

<div class="db-grid-2" markdown>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Advantages</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown><span class="db-node-title">Scales horizontally</span><span class="db-node-sub">Add commodity servers instead of a bigger one</span></div>
<div class="db-node db-node-teal" markdown><span class="db-node-title">Flexible schema</span><span class="db-node-sub">Iterate on the data model without migrations</span></div>
<div class="db-node db-node-teal" markdown><span class="db-node-title">Fast for its access pattern</span><span class="db-node-sub">Purpose-built for the operations it targets</span></div>
</div>
</div>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Limitations</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-orange" markdown><span class="db-node-title">Weaker consistency guarantees</span><span class="db-node-sub">Eventual consistency can surprise developers used to ACID</span></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title">No standard query language</span><span class="db-node-sub">Skills and tooling don't transfer between products the way SQL does</span></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title">Weaker or absent joins</span><span class="db-node-sub">Multi-collection/table relationships are harder to query in one step</span></div>
</div>
</div>

</div>

## NoSQL Use Cases

- **Content management** — articles, product pages, and user profiles that naturally vary in
  shape from one record to the next (document stores).
- **Real-time analytics** — high-velocity event and metrics data written far more often than it
  is updated (column-family stores).
- **Product catalogs** — items with wildly different attribute sets (a book has an ISBN, a
  laptop has a CPU) that would otherwise force sparse, awkward relational tables.
- **Social graphs** — friend networks, recommendation engines, and fraud-detection systems
  built around "who is connected to whom" (graph databases).
- **Session stores and caches** — simple, extremely fast get/set operations against a key
  (key-value stores).

## CAP Theorem Overview

Once a database is **distributed** — its data spread across more than one machine, which is
the entire premise of horizontal scaling — it runs into a hard limit described by the **CAP
theorem**. Any distributed data system can only fully guarantee **two** of the following three
properties **at the same time**, whenever a network problem splits the cluster:

<div class="db-diagram" markdown>
<p class="db-diagram-label">Pick two — you cannot have all three during a partition</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown><span class="db-node-title"><span class="db-badge db-badge-teal">C</span> Consistency</span><span class="db-node-sub">Every read sees the most recent write, everywhere</span></div>
<div class="db-node db-node-purple" markdown><span class="db-node-title"><span class="db-badge db-badge-purple">A</span> Availability</span><span class="db-node-sub">Every request gets a response, even if not the latest data</span></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title"><span class="db-badge db-badge-orange">P</span> Partition tolerance</span><span class="db-node-sub">The system keeps working even if servers can't talk to each other</span></div>
</div>
</div>

Here is the concrete scenario that makes this unavoidable, not theoretical. Suppose a
database's servers span two data centers — one in Lahore, one in Karachi — replicating every
write to each other over a network link. Now that link fails: the two data centers can still
each serve their own local users, but they can no longer talk to each other. **Partition
tolerance is not optional here** — the network failure has already happened, whether the
system "chooses" it or not. That leaves exactly one real decision, for every write that arrives
at either data center while the link is down:

<div class="db-grid-2" markdown>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Choose Consistency (give up Availability)</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown><span class="db-node-title">Reject the write</span><span class="db-node-sub">Karachi refuses new writes until it can confirm with Lahore again</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown><span class="db-node-title">Result: CP system</span><span class="db-node-sub">Never returns stale data, but some requests fail during the partition</span></div>
</div>
</div>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Choose Availability (give up Consistency)</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-purple" markdown><span class="db-node-title">Accept the write locally</span><span class="db-node-sub">Karachi keeps serving requests using only its own local data</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown><span class="db-node-title">Result: AP system</span><span class="db-node-sub">Always responds, but Lahore and Karachi may briefly disagree</span></div>
</div>
</div>

</div>

Once the link comes back, an AP system reconciles the two data centers' divergent writes (this
is exactly what "eventual consistency" means — they *will* agree eventually, just not
instantly). A traditional single-server relational database is usually described as **CA** — it
guarantees consistency and availability, but only because it was never partition-tolerant in
the first place: there was only ever one server to ask.

!!! tip "CAP is about behavior during a partition, not all the time"
    Outside of an actual network partition, a well-built distributed system can offer strong
    consistency *and* high availability simultaneously — the CAP theorem only forces a choice
    at the exact moment the network splits. Most real products (MongoDB included) let you tune
    *how* they behave during a partition, rather than being permanently locked into pure CP or
    pure AP.

This three-way trade-off — and the deliberate choices a document database makes about it — is
exactly what you'll see up close starting next lecture, as we leave general NoSQL theory behind
and go hands-on with the document database that dominates real-world use today.

## Key Takeaways

- Relational databases hit real limits at web scale: vertical scaling has a ceiling, joins
  across huge normalized tables get expensive, and rigid schemas slow down fast-moving
  products.
- **NoSQL** databases trade strict schema and strong consistency for horizontal scalability and
  schema flexibility — a deliberate trade-off, not a strict upgrade.
- The four major NoSQL families are **document** (MongoDB), **key-value** (DynamoDB, Redis),
  **column-family** (Cassandra), and **graph** (Neo4j) stores — each optimized for a different
  access pattern.
- The **CAP theorem** says a distributed system can only fully guarantee two of Consistency,
  Availability, and Partition tolerance at once, during an actual network partition — the
  Lahore/Karachi scenario shows exactly why there is no way around this, only a choice of which
  guarantee to relax.
- NoSQL fits content management, real-time analytics, flexible catalogs, and social graphs
  especially well — not as a universal replacement for the relational model, but as the right
  tool for workloads the relational model wasn't built for.

Continue to [Lecture 27 — MongoDB and the Document Model](lecture-27-mongodb-and-the-document-model.md).
