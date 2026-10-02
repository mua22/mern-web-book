---
title: "Lab 15: MongoDB Sharding, Replication & NoSQL vs. SQL Trade-offs"
---

# Lab 15: MongoDB Sharding, Replication & NoSQL vs. SQL Trade-offs

## Objectives:

- Explain how a MongoDB replica set provides high availability through primary/secondary nodes and automatic failover.
- Explain the architecture of a sharded cluster -shard keys, the `mongos` router, and config servers -at a conceptual level.
- Explain the CAP theorem (Consistency, Availability, Partition tolerance) and where MongoDB typically sits on that trade-off.
- Contrast MongoDB's tunable consistency model with the ACID guarantees studied for the relational database in Labs 1–12.
- Tie the whole course together: revisit the relational-vs-document comparison from Lab 13, now informed by querying, aggregation, replication, and sharding.

## Activity Outcomes:

- Describe the role of each node in a 3-member replica set and trace what happens when the primary fails.
- Read and interpret the output of `rs.status()` on a running replica set.
- Describe shard-key selection and read the output of `sh.status()` on a sharded cluster.
- Compare the CAP theorem trade-offs made by MongoDB against the ACID guarantees made by the relational database used throughout the course.

**Tools / Software Required:**

- A pre-configured 3-node MongoDB replica set (local `mongod` instances or a MongoDB Atlas free-tier cluster, which is itself a managed replica set)
- `mongosh` (the MongoDB Shell) connected to that replica set
- Optional: access to a sharded cluster (instructor-provided or Atlas) for the `sh.status()` activity

Instructor Note: This is a conceptual, broad-survey lab closing out the course. Setting up replication and sharding from scratch is normally beyond what fits in a 75-minute lab session, so full cluster setup is typically demonstrated via an **instructor walkthrough or a pre-configured Atlas cluster**, rather than built from scratch here. As pre-lab activity, read the official MongoDB manual pages "Replication" and "Sharding", and review the ACID discussion from the relational transactions lab earlier in the course.

## 1) Useful Concepts

**Replication vocabulary:**

| Term | Description |
|---|---|
| Replica set | A group of `mongod` processes holding the same data set, providing redundancy and high availability |
| Primary | The single node in a replica set that accepts all writes |
| Secondary | A node that replicates the primary's data via the oplog; can serve reads if configured |
| Oplog | The operations log the primary writes to and secondaries replay to stay in sync |
| Automatic failover | When the primary becomes unreachable, the remaining nodes hold an election and promote a secondary to primary -typically within seconds |
| Write concern | How many nodes must acknowledge a write before it is considered successful (e.g. `w: 1`, `w: "majority"`) |
| Read preference | Which node(s) a client is allowed to read from (e.g. `primary`, `secondary`, `nearest`) |

**Sharding vocabulary:**

| Term | Description |
|---|---|
| Sharding | Horizontally partitioning a collection's data across multiple machines ("shards") so no single server holds all of it |
| Shard | A single replica set holding one partition (subset) of the sharded collection's data |
| Shard key | The field (or fields) used to decide which shard a given document lives on -chosen for even distribution and query patterns |
| Chunk | A contiguous range of shard-key values; MongoDB splits and migrates chunks to keep shards balanced |
| `mongos` | The query router -the process clients actually connect to; it routes each operation to the correct shard(s) |
| Config servers | A small replica set storing the cluster's metadata (which chunks live on which shard) |

**Conceptual sharded-cluster architecture (what `mongos` sits between):**

| Layer | Component(s) | Role |
|---|---|---|
| Client / application | Driver or `mongosh` | Sends ordinary CRUD/aggregation commands, unaware data is split |
| Routing layer | One or more `mongos` routers | Receives client requests, consults config servers, forwards to the correct shard(s), merges results |
| Metadata layer | Config server replica set | Stores the chunk-to-shard mapping for the whole cluster |
| Data layer | Shard 1 (a replica set), Shard 2 (a replica set), Shard N... | Each shard holds, and itself replicates, its slice of the collection |

**CAP theorem summary:**

| Property | Meaning |
|---|---|
| Consistency (C) | Every read receives the most recent write or an error (all nodes agree) |
| Availability (A) | Every request receives a (non-error) response, without the guarantee it contains the latest write |
| Partition tolerance (P) | The system keeps operating despite network partitions between nodes |
| CAP theorem | A distributed system can only fully guarantee two of the three properties at once when a network partition occurs |
| Where MongoDB sits | Partition-tolerant by design; **consistency-favoring (CP-leaning)** by default -reads/writes go through a single primary, and `write concern: "majority"` plus default read behavior avoid stale reads, at some cost to availability during an election. Read preference and write concern are tunable toward more availability if an application can tolerate staleness. |
| Relational DB (Labs 1–12) by contrast | Guarantees **ACID** (Atomicity, Consistency, Isolation, Durability) on a single node / tightly-coupled cluster -a different axis of guarantee, aimed at transactional correctness rather than distributed partition behavior |

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 20 Minutes | Medium | CLO-5 |
| Activity 2 | 15 Minutes | Low | CLO-4 |
| Activity 3 | 20 Minutes | Medium | CLO-4 |
| Activity 4 | 20 Minutes | Medium | CLO-5 |

### Activity 1 (conceptual): Sketch a 3-node replica set and trace a primary failure

*Sketch a replica set of three nodes -one primary (`mongod-A`) and two secondaries (`mongod-B`, `mongod-C`) -showing the direction of oplog replication. Then trace, step by step, what happens if `mongod-A` suddenly goes offline.*

**Solution:**

```text
      writes                 oplog replication
Client ----> [ mongod-A : PRIMARY ] ----> [ mongod-B : SECONDARY ]
                     |
                     +------------------> [ mongod-C : SECONDARY ]

Step-by-step trace when mongod-A (the primary) goes offline:

1. mongod-B and mongod-C stop receiving heartbeats from mongod-A.
2. After the election timeout elapses, the remaining members call an election.
3. mongod-B and mongod-C vote; whichever has the most up-to-date oplog
   (and a majority of votes) is elected the new PRIMARY -say mongod-B.
4. mongod-C becomes a SECONDARY replicating from the new primary, mongod-B.
5. The driver's topology monitor detects the new primary and routes
   subsequent writes to mongod-B automatically.
6. If/when mongod-A comes back online, it rejoins as a SECONDARY and
   catches up via the oplog (never automatically "reclaims" primary).
```

**Output / Expected behaviour:**

```text
Clients experience a brief write outage (typically a few seconds) during the
election, then resume writing against the newly elected primary with no
application code changes -this automatic failover is the main availability
benefit replication provides over a single stand-alone database server.
```

### Activity 2 (runnable): Inspecting replica-set state with `rs.status()`

*Connect `mongosh` to any member of a running replica set and inspect which node is currently primary.*

**Solution:**

```javascript
rs.status()

// For a quick summary instead of the full document:
rs.status().members.map(m => ({ name: m.name, state: m.stateStr, health: m.health }))
```

**Output / Expected behaviour:**

```json
[
  { "name": "mongod-A:27017", "state": "PRIMARY",   "health": 1 },
  { "name": "mongod-B:27018", "state": "SECONDARY", "health": 1 },
  { "name": "mongod-C:27019", "state": "SECONDARY", "health": 1 }
]
```

### Activity 3 (runnable, instructor-provided cluster): Choosing a shard key and inspecting `sh.status()`

*On an instructor-provided or Atlas sharded cluster, enable sharding on the `hrDB` database, shard the `employees` collection on `department.department_id` (chosen because queries and writes are commonly scoped by department, giving reasonably even distribution), and inspect the resulting cluster status.*

**Solution:**

```javascript
// Run from mongosh connected to a mongos router, not directly to a shard
sh.enableSharding("hrDB")

sh.shardCollection("hrDB.employees", { "department.department_id": 1 })

sh.status()
```

**Output / Expected behaviour:**

```text
--- Sharding Status ---
  sharding version: { ... }
  shards:
        {  "_id" : "shard0000",  "host" : "shard0000/host1:27018", ... }
        {  "_id" : "shard0001",  "host" : "shard0001/host2:27018", ... }
  databases:
        {  "_id" : "hrDB",  "primary" : "shard0000",  "partitioned" : true  }
                hrDB.employees
                        shard key: { "department.department_id" : 1 }
                        chunks:
                                shard0000    1
                                shard0001    1
```

### Activity 4 (conceptual): CAP trade-offs vs. ACID -tying back to Lab 13

*Revisit the relational-vs-document comparison opened in Lab 13. Now that querying, aggregation, replication, and sharding have all been covered, summarize in a table how the relational database's ACID guarantees and MongoDB's CAP positioning lead to different trade-offs for the same HR data set.*

**Solution:**

| Concern | Relational DB (Labs 1–12) | MongoDB (Labs 13–15) |
|---|---|---|
| Guarantee family | ACID (Atomicity, Consistency, Isolation, Durability) | CAP-aware; CP-leaning by default, tunable per operation |
| Typical topology | Single server, or a tightly-coupled cluster, treated as one logical unit | Distributed by design -replica sets for availability, shards for horizontal scale |
| Schema | Fixed, enforced by `CREATE TABLE` | Flexible per document, optionally validated |
| Related data | Normalized across tables, joined with `JOIN` at query time | Often embedded in one document; `$lookup` available when it is not |
| Consistency during failure | A single node either serves the latest committed data or is down | A brief availability dip during a replica-set election, after which the new primary serves consistent data; secondaries can optionally serve slightly stale reads for availability |
| Scaling writes | Vertical scaling (bigger server) or complex clustering | Horizontal scaling via sharding, distributing writes across many shards |

**Output / Expected behaviour:**

```text
Conclusion: the relational labs optimized for strict transactional correctness
on data that is naturally tabular and relationship-heavy. The MongoDB labs
optimized for flexible, horizontally scalable storage of the *same* HR data
reshaped as self-contained documents -trading some of SQL's join-time
guarantees for availability and scale. Neither model is "better" in the
abstract; the right choice depends on the application's read/write patterns,
consistency requirements, and growth needs.
```

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Replica-set failover trace (conceptual)**

Sketch a 5-node replica set (1 primary, 4 secondaries). Explain, in your own words, why an odd number of voting members is recommended, and trace what happens if two secondaries (not the primary) go offline simultaneously -does the replica set still have a primary? Does it still accept writes?

**Lab Task 2: Shard-key evaluation (conceptual)**

For the `employees` collection, evaluate two candidate shard keys -`employee_id` and `department.department_id` -against the criteria of (a) write distribution evenness and (b) whether common queries (e.g. "find all employees in department X") would be routed to a single shard or broadcast to all shards. State which key you would recommend and why.

**Lab Task 3: CAP positioning for a new application (conceptual)**

A ride-hailing app needs to record driver-location updates (very high write volume, slightly stale reads are tolerable) and a banking app needs to record account balance transfers (every read must reflect the latest committed write). For each application, state whether you would lean the data store toward availability or toward consistency, and justify your answer using the CAP-theorem vocabulary from this lab.
