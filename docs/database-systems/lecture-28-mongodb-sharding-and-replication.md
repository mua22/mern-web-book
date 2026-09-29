---
title: "28. MongoDB Sharding and Replication"
tags:
  - CSC270
  - MongoDB
  - Replication
  - Sharding
---

# 28. MongoDB Sharding and Replication

A single `mongod` process, however well it handles documents, is still just one server — one
point of failure, and one machine's worth of disk and CPU. This lecture covers the two
techniques MongoDB uses to move past both limits: **replication**, which copies the same data
onto multiple servers for safety and read capacity, and **sharding**, which splits *different*
data across multiple servers for write and storage capacity. They solve genuinely different
problems, they are easy to blur together, and — as this lecture's final section makes explicit
— a real production deployment almost always uses both at once.

## In This Lecture

- Why replication exists: high availability and read scaling
- **Replica sets**, and the roles of primary and secondary nodes
- **Automatic failover** — how a replica set elects a new primary
- How reads and writes are actually routed across a replica set
- Why sharding exists: horizontal write and storage scaling
- **Sharded cluster architecture** — shards, config servers, and `mongos`
- Choosing a good **shard key**, and the hotspots a bad one causes
- The **balancer** and how chunks move between shards
- Sharding vs. replication, side by side — and why production clusters use both together

## MongoDB Replication

**Replication** means keeping multiple copies of the same data on multiple servers, kept in
sync with each other. It exists to solve two problems a single server cannot:

- **High availability** — if the one server holding your data crashes, your application goes
  down with it. Multiple copies mean the application can keep running on a surviving copy.
- **Read scaling** — a single server has a ceiling on how many reads per second it can serve;
  spreading reads across several copies of the same data raises that ceiling.

## Replica Sets

MongoDB implements replication through a **replica set** — a group of `mongod` instances that
all hold the same data. A replica set almost always has an **odd number of members** (three is
typical), which matters for the election process covered below.

<div class="db-diagram" markdown>
<p class="db-diagram-label">A three-member replica set</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown><span class="db-node-title">Primary</span><span class="db-node-sub">Accepts all writes</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown><span class="db-node-title">Secondary</span><span class="db-node-sub">Replicates the oplog from the primary</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title">Secondary</span><span class="db-node-sub">Replicates the oplog from the primary</span></div>
</div>
</div>

## Primary and Secondary Nodes

Exactly one member of a replica set is the **primary** at any moment — the only node that
accepts writes. Every other member is a **secondary**, which continuously replicates the
primary's changes by tailing its **oplog** (operations log: an ordered record of every write
the primary applied) and re-applying the same operations locally. Secondaries are therefore
always slightly behind the primary — usually by milliseconds, but under heavy load or a slow
network link, that lag can grow, which matters for the read-routing choice below.

## Automatic Failover

If the primary becomes unreachable — a crash, a network partition, a planned maintenance
restart — the remaining members detect this through routine heartbeats and trigger an
**election**: the surviving secondaries vote, and whichever eligible member wins becomes the
new primary, typically within a few seconds, with no manual intervention.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Automatic failover after the primary goes down</p>
<div class="db-flow" markdown>
<div class="db-node db-node-orange" markdown><span class="db-node-title">Primary fails</span><span class="db-node-sub">Heartbeats to it start timing out</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown><span class="db-node-title">Election</span><span class="db-node-sub">Surviving secondaries vote among themselves</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown><span class="db-node-title">New primary</span><span class="db-node-sub">A former secondary now accepts writes</span></div>
</div>
</div>

A majority of the replica set's members (a quorum) must be reachable and agree for an election
to succeed — this is exactly why replica sets favor odd membership counts: with three members,
losing any one still leaves a clear majority of two able to elect a primary; with an even
count, a split can leave neither side with a majority.

!!! note "The old primary rejoins as a secondary"
    Once a failed primary comes back online, it does not reclaim its role automatically — it
    rejoins the replica set as a secondary, catches up on any writes it missed from the oplog,
    and would need a fresh election (or a deliberate step-down) to become primary again.

## Read and Write Operations in Replication

**Writes** in a replica set always go to the primary — there is no way around this, since it
is the only member allowed to accept them. **Reads**, by contrast, can be directed to
secondaries as well, controlled by the application's chosen **read preference**:

| Read preference | Behavior |
|---|---|
| `primary` (default) | All reads go to the primary — always the most up-to-date data |
| `primaryPreferred` | Prefer the primary, fall back to a secondary if it's unreachable |
| `secondary` | All reads go to a secondary — spreads out read load, but may return slightly stale data |
| `secondaryPreferred` | Prefer a secondary, fall back to the primary if none are available |
| `nearest` | Route to whichever member has the lowest network latency |

!!! tip "Read scaling from secondaries is a trade-off, not a free win"
    Routing reads to secondaries raises your read capacity, but because secondaries lag the
    primary by the oplog replication delay, an application reading from a secondary can see
    data that is a few milliseconds (rarely, longer) out of date — acceptable for an analytics
    dashboard, and usually unacceptable for "did my write just succeed" confirmation screens.

## MongoDB Sharding

Replication solves availability and read capacity — but every member of a replica set still
holds the *entire* dataset, so it does nothing for a dataset that has simply grown too large,
or a write volume too high, for any single server to hold or handle at all. **Sharding**
solves that different problem: it **partitions** a collection's data across multiple servers,
so each one holds only a slice of the total, and both storage and write capacity grow as you
add more shards.

## Sharded Cluster Architecture

A sharded MongoDB deployment has three distinct kinds of component, and the application never
talks to the shards directly:

<div class="db-diagram" markdown>
<p class="db-diagram-label">Sharded cluster architecture</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown><span class="db-node-title">Application</span><span class="db-node-sub">Sends every query exactly as it would to a single mongod</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown><span class="db-node-title">mongos (query router)</span><span class="db-node-sub">Figures out which shard(s) hold the relevant data</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title">Config servers</span><span class="db-node-sub">Hold the cluster's metadata — which chunks live on which shard</span></div>
</div>
</div>

<div class="db-grid-3" markdown>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Shard 1</p>
<div class="db-node db-node-teal" markdown><span class="db-node-title">Holds one slice of the data</span><span class="db-node-sub">e.g. regNo A–H</span></div>
</div>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Shard 2</p>
<div class="db-node db-node-purple" markdown><span class="db-node-title">Holds another slice</span><span class="db-node-sub">e.g. regNo I–P</span></div>
</div>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Shard 3</p>
<div class="db-node db-node-orange" markdown><span class="db-node-title">Holds another slice</span><span class="db-node-sub">e.g. regNo Q–Z</span></div>
</div>

</div>

- **Shards** — each one holds a subset of the collection's total data. In production, each
  shard is not a single server but its own replica set (tied back together in the comparison
  section below).
- **Config servers** — store the cluster's metadata: which ranges of shard-key values (called
  **chunks**) currently live on which shard. Modern MongoDB runs the config servers themselves
  as a replica set, for the same availability reasons covered above.
- **`mongos`** — the query router the application actually connects to. It consults the config
  servers to work out which shard(s) a query needs, forwards the query there, and merges the
  results before returning them.

## Shard Keys

Every sharded collection needs a **shard key** — the field (or fields) MongoDB uses to decide
which chunk, and therefore which shard, a given document belongs to. Choosing it well is the
single most consequential decision in a sharded deployment:

- **High cardinality** — the field should have many distinct values, so data can actually be
  split into many chunks. A `department` field with five possible values can never produce more
  than five useful chunks, however the data is split.
- **Even distribution** — values should be spread roughly evenly across the key's range, so no
  one chunk (and therefore no one shard) ends up disproportionately large or busy.
- **Avoiding hotspots** — a monotonically increasing key (an auto-incrementing counter, or a
  timestamp of insertion) sends every *new* write to whichever shard currently owns the
  highest-value chunk, turning that one shard into a bottleneck while the others sit idle.

!!! warning "A timestamp or auto-increment ID is a classic bad shard key"
    It looks high-cardinality, but because every new document has a *larger* value than the
    last one, all new writes land on the single shard holding the topmost chunk — exactly the
    hotspot sharding was supposed to prevent. A better choice combines such a field with a
    higher-entropy one (a compound shard key), or avoids a strictly increasing field entirely.

## Query Routing and mongos

How `mongos` handles a query depends entirely on whether that query includes the shard key:

- **Targeted query** — the query's filter includes the shard key, so `mongos` can compute
  exactly which shard(s) hold the answer and forward the query only there.
- **Scatter-gather query** — the query's filter does not include the shard key, so `mongos`
  must send the query to *every* shard and merge all the partial results — far more expensive,
  and exactly why shard-key choice should be driven by your application's most common queries,
  the same "know your workload first" principle from Lecture 25's index selection.

## Config Servers

Config servers are easy to underestimate because they hold no application data at all — only
the cluster's own bookkeeping: which chunk ranges exist, and which shard currently owns each
one. If the config servers become unavailable, the cluster can't safely route new queries or
move data, even though the shards themselves still hold all their data intact — which is
exactly why production deployments run the config servers as their own replica set rather than
a single point of failure.

## Balancing and Data Distribution

As documents are inserted, updated, and deleted, chunks can grow unevenly — one range of the
shard key might accumulate far more documents than another. A background process called the
**balancer** watches for this imbalance and migrates chunks between shards to even out the
distribution, splitting an oversized chunk in two when necessary. This runs automatically and
is largely invisible to the application, aside from a brief moment of extra load while a chunk
migration is in progress.

## Sharding vs. Replication

| Aspect | Replication | Sharding |
|---|---|---|
| Problem solved | High availability, read scaling | Horizontal write and storage scaling |
| What each node holds | The *same* complete dataset | A *different slice* of the dataset |
| Failure it protects against | Losing a single server | Running out of capacity on a single server |
| Key components | Primary, secondaries | Shards, config servers, `mongos` |
| Typical unit | A replica set | A sharded cluster (built from multiple replica sets) |

<div class="db-diagram" markdown>
<p class="db-diagram-label">A realistic production topology — sharding AND replication together</p>
<div class="db-stack" markdown>
<div class="db-stack-layer" markdown><span class="db-node-title">mongos query router(s)</span> <span class="db-node-sub">— what the application actually connects to</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Config server replica set</span> <span class="db-node-sub">— cluster metadata, itself replicated for availability</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Shard 1 = its own replica set</span> <span class="db-node-sub">— primary + secondaries, holding one slice of the data</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Shard 2 = its own replica set</span> <span class="db-node-sub">— primary + secondaries, holding another slice</span></div>
</div>
</div>

**Sharding and replication are not competing techniques — they answer different questions, and
a serious production MongoDB deployment uses both simultaneously.** Sharding gives horizontal
capacity by splitting the data across shards; replication gives each of those shards its own
high availability by making every shard a replica set in its own right. Losing one server in
that topology triggers a routine failover within its shard's replica set; the cluster's overall
capacity is untouched, because every *other* shard keeps serving its own slice of the data the
entire time.

## Key Takeaways

- **Replication** copies the *same* data across a **replica set** of servers — solving high
  availability and read scaling. Writes always go to the **primary**; reads can optionally be
  routed to **secondaries** via a read preference.
- **Automatic failover** elects a new primary from the surviving secondaries when the current
  primary fails, requiring a majority (quorum) of the replica set to agree.
- **Sharding** splits *different* slices of one collection's data across multiple **shards** —
  solving horizontal write and storage capacity, a different problem from replication.
- A sharded cluster routes every query through **`mongos`**, which consults the **config
  servers'** metadata to send a **targeted query** to the right shard(s), or fall back to an
  expensive **scatter-gather query** across all of them.
- Shard key choice — high cardinality, even distribution, no monotonic hotspot field — is the
  single most consequential decision in a sharded deployment, echoing the index-selection
  discipline from Lecture 25.
- In production, the two techniques combine: a sharded cluster's individual shards are
  themselves replica sets, giving both horizontal capacity and per-shard high availability at
  once.

This closes out the course's dedicated look at MongoDB and, with it, the shift from purely
relational thinking into how modern systems actually scale data in practice — the same
underlying trade-offs (consistency vs. availability, normalization vs. embedding, one server
vs. many) resurface in almost every large system you will design from here on.
