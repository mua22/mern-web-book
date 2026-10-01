---
title: "20. Deadlock Avoidance and the Banker's Algorithm"
tags:
  - CSC323
  - Operating Systems
  - Deadlocks
  - Banker's Algorithm
---

# 20. Deadlock Avoidance and the Banker's Algorithm

Lecture 19's prevention strategy works by attacking one of the four necessary conditions
directly — forbidding hold-and-wait outright, for instance, by requiring every process to
request all its resources at once. That guarantees safety, but at a real cost: a process
that only occasionally needs a second resource is now forced to request it up front anyway,
locking up resources it won't touch for a long time. **Deadlock avoidance** takes a
different approach entirely. It doesn't forbid any of the four conditions — it simply
refuses to make any resource-allocation decision that could ever lead to deadlock, decided
dynamically, every time a request comes in. The price for this flexibility is information:
avoidance only works if every process declares, in advance, the maximum amount of each
resource it might ever need.

## In This Lecture

- Define a safe state and a safe sequence, and explain why avoidance is really just "never
  leave a safe state"
- Walk through the Resource-Allocation Graph algorithm for avoidance in single-instance
  systems
- Learn the Banker's Algorithm's data structures: Available, Max, Allocation, and Need
- Work a complete numeric example: run the Safety Algorithm by hand to find a safe sequence
- Work a complete Resource-Request Algorithm example, including a request that must be
  denied

## Safe States and Safe Sequences

A system is in a **safe state** if there exists at least one order in which every currently
existing process can run to completion — even if every process immediately asks for its
declared maximum — without ever causing deadlock. That order is called a **safe sequence**.
Concretely, a sequence `P1, P2, ..., Pn` is safe if, for every process `Pi` in that order,
the resources `Pi` might still need can be satisfied using what's currently available
*plus* everything held by processes earlier in the sequence (which will have already
finished and released their resources by the time `Pi`'s turn comes).

!!! note "Safe does not mean deadlocked otherwise"
    An **unsafe** state is not automatically a deadlocked state — it simply means *no
    guarantee* of avoiding deadlock exists anymore; the system might still get lucky and
    avoid it, depending on what processes actually request. Deadlock avoidance refuses to
    take that gamble: it only ever grants a request if the resulting state is still
    provably safe. This is strictly more cautious than necessary in some individual cases,
    but it's the only way to *guarantee* deadlock can never occur.

## The Resource-Allocation Graph Algorithm

When every resource type has exactly one instance, avoidance can be done directly on the
Resource-Allocation Graph from Lecture 19, extended with one new kind of edge: a **claim
edge** (drawn dashed, like a request edge, but meaning "this process *might* request this
resource at some point in the future," not "is requesting it right now"). Every process
must declare its claim edges before it runs.

The rule is simple: when a process actually requests a resource, convert that request's
claim edge into a real request edge — but only **grant** the request, converting it further
into an assignment edge, if doing so would **not** create a cycle anywhere in the graph. If
granting the request would create a cycle, the request is deferred, even though the
resource is currently free, because Lecture 19 already showed that a cycle among
single-instance resources guarantees deadlock. Checking for a cycle before every single
grant is exactly what makes this "avoidance" rather than "prevention" — the system is
free to allocate resources however it likes, as long as it keeps checking.

## The Banker's Algorithm

The RAG algorithm above doesn't scale to resource types with multiple instances — a cycle
stops being a reliable signal the moment more than one instance exists, as Lecture 19's
second example showed. The **Banker's Algorithm** is the general-purpose avoidance algorithm
for exactly that case, and it is almost certainly the single most exam-tested idea in this
unit. It tracks four data structures, each a table with one row per process and one column
per resource type:

- **Available** — a vector giving the number of currently free instances of each resource
  type.
- **Max** — a matrix where row `i` gives the maximum number of instances of each resource
  type process `Pi` may ever request over its lifetime, declared in advance.
- **Allocation** — a matrix where row `i` gives the number of instances of each resource
  type currently allocated to `Pi`.
- **Need** — a matrix where row `i` gives the number of additional instances of each
  resource type `Pi` may still request: `Need[i] = Max[i] − Allocation[i]`, always.

### The System

Consider a system with three resource types, `X`, `Y`, and `Z`, with **9**, **6**, and **8**
total instances respectively, and five processes, `P0`–`P4`, currently in this state:

<div class="db-relation" markdown>
<div class="db-relation-name">Allocation</div>

| Process | X | Y | Z |
|---|---|---|---|
| P0 | 1 | 2 | 2 |
| P1 | 2 | 0 | 1 |
| P2 | 2 | 1 | 1 |
| P3 | 0 | 1 | 2 |
| P4 | 1 | 1 | 0 |

</div>

<div class="db-relation" markdown>
<div class="db-relation-name">Max</div>

| Process | X | Y | Z |
|---|---|---|---|
| P0 | 5 | 4 | 4 |
| P1 | 3 | 2 | 2 |
| P2 | 5 | 3 | 3 |
| P3 | 2 | 2 | 3 |
| P4 | 3 | 3 | 2 |

</div>

<div class="db-relation" markdown>
<div class="db-relation-name">Need (Max − Allocation)</div>

| Process | X | Y | Z |
|---|---|---|---|
| P0 | 4 | 2 | 2 |
| P1 | 1 | 2 | 1 |
| P2 | 3 | 2 | 2 |
| P3 | 2 | 1 | 1 |
| P4 | 2 | 2 | 2 |

</div>

**Available** is what's left of the total once every current allocation is accounted for.
Summing each column of Allocation gives `X: 1+2+2+0+1 = 6`, `Y: 2+0+1+1+1 = 5`,
`Z: 2+1+1+2+0 = 6`. Subtracting from the totals:

<div class="db-relation" markdown>
<div class="db-relation-name">Available = Total − (sum of Allocation)</div>

| X | Y | Z |
|---|---|---|
| 9 − 6 = 3 | 6 − 5 = 1 | 8 − 6 = 2 |

</div>

### The Safety Algorithm

The Safety Algorithm asks one question: does **any** safe sequence exist right now? It
repeatedly scans the not-yet-finished processes, in order `P0 → P4`, and whenever it finds
one whose `Need` fits entirely within the current `Work` vector (initialized to
`Available`), it "runs" that process to completion — adding its `Allocation` back into
`Work`, since a finished process releases everything it held — and restarts the scan.

| Step | Scan finds | Why it qualifies (Need ≤ Work) | Work before → after |
|---|---|---|---|
| 1 | — | `P0` Need `(4,2,2)` ≤ Work `(3,1,2)`? **No** (4 > 3). `P1` Need `(1,2,1)` ≤ `(3,1,2)`? **No** (2 > 1). `P2` Need `(3,2,2)` ≤ `(3,1,2)`? **No** (2 > 1). `P3` Need `(2,1,1)` ≤ `(3,1,2)`? **Yes.** | `(3,1,2)` → `(3,1,2)+(0,1,2) = (3,2,4)` |
| 2 | `P3` done | `P0` Need `(4,2,2)` ≤ `(3,2,4)`? No (4 > 3). `P1` Need `(1,2,1)` ≤ `(3,2,4)`? **Yes.** | `(3,2,4)` → `(3,2,4)+(2,0,1) = (5,2,5)` |
| 3 | `P1` done | `P0` Need `(4,2,2)` ≤ `(5,2,5)`? **Yes.** | `(5,2,5)` → `(5,2,5)+(1,2,2) = (6,4,7)` |
| 4 | `P0` done | `P2` Need `(3,2,2)` ≤ `(6,4,7)`? **Yes.** | `(6,4,7)` → `(6,4,7)+(2,1,1) = (8,5,8)` |
| 5 | `P2` done | `P4` Need `(2,2,2)` ≤ `(8,5,8)`? **Yes.** | `(8,5,8)` → `(8,5,8)+(1,1,0) = (9,6,8)` |

Every process ends up marked finished, so the state **is safe**, with safe sequence
`P3, P1, P0, P2, P4`.

!!! tip "A built-in arithmetic check"
    Notice the final `Work` vector, `(9, 6, 8)`, is exactly equal to the system's total
    resources. That's not a coincidence — once every process has finished and released
    everything it held, nothing is allocated anywhere, so all resources must be free again.
    If your own hand-worked safety algorithm doesn't end with `Work` equal to the system
    totals, you've made an arithmetic mistake somewhere in the run.

### The Resource-Request Algorithm

Now suppose, from this same state, a process requests additional resources. The algorithm
checks, in order: **(1)** is the request ≤ that process's remaining `Need`? **(2)** is the
request ≤ current `Available`? If either check fails, the request cannot be granted yet. If
both pass, the algorithm *pretends* to grant it — updating `Available`, `Allocation`, and
`Need` as if the grant had happened — and reruns the Safety Algorithm on that hypothetical
state. Only if the hypothetical state is still safe does the grant actually become
permanent; otherwise everything is rolled back and the requesting process must wait.

**Example A — a request that is granted.** `P1` requests `(1, 0, 1)` additional units.

- Check 1: is `(1,0,1) ≤ Need[P1] = (1,2,1)`? Yes.
- Check 2: is `(1,0,1) ≤ Available = (3,1,2)`? Yes.
- Pretend-grant: `Available' = (3,1,2) − (1,0,1) = (2,1,1)`. `Allocation'[P1] = (2,0,1) + (1,0,1) = (3,0,2)`.
  `Need'[P1] = (1,2,1) − (1,0,1) = (0,2,0)`.
- Rerun the Safety Algorithm with `Work = (2,1,1)` and `P1`'s row replaced:

| Step | Scan finds | Why | Work before → after |
|---|---|---|---|
| 1 | `P3` | Need `(2,1,1)` ≤ `(2,1,1)`? Yes (exactly equal). | `(2,1,1)` → `(2,1,1)+(0,1,2) = (2,2,3)` |
| 2 | `P1` | Need `(0,2,0)` ≤ `(2,2,3)`? Yes. | `(2,2,3)` → `(2,2,3)+(3,0,2) = (5,2,5)` |
| 3 | `P0` | Need `(4,2,2)` ≤ `(5,2,5)`? Yes. | `(5,2,5)` → `(5,2,5)+(1,2,2) = (6,4,7)` |
| 4 | `P2` | Need `(3,2,2)` ≤ `(6,4,7)`? Yes. | `(6,4,7)` → `(6,4,7)+(2,1,1) = (8,5,8)` |
| 5 | `P4` | Need `(2,2,2)` ≤ `(8,5,8)`? Yes. | `(8,5,8)` → `(8,5,8)+(1,1,0) = (9,6,8)` |

The hypothetical state is safe (sequence `P3, P1, P0, P2, P4`, and `Work` again returns to
`(9,6,8)`), so **P1's request is granted immediately and permanently.**

**Example B — a request that must be denied.** Independently, from the *original* state
(`Available = (3,1,2)`, before Example A), suppose instead `P2` requests `(2, 1, 0)`.

- Check 1: is `(2,1,0) ≤ Need[P2] = (3,2,2)`? Yes.
- Check 2: is `(2,1,0) ≤ Available = (3,1,2)`? Yes.
- Pretend-grant: `Available' = (3,1,2) − (2,1,0) = (1,0,2)`. `Allocation'[P2] = (2,1,1) + (2,1,0) = (4,2,1)`.
  `Need'[P2] = (3,2,2) − (2,1,0) = (1,1,2)`.
- Rerun the Safety Algorithm with `Work = (1,0,2)`:

| Process | Need | Need ≤ Work `(1,0,2)`? |
|---|---|---|
| P0 | `(4,2,2)` | No — `4 > 1` |
| P1 | `(1,2,1)` | No — `2 > 0` |
| P2 | `(1,1,2)` | No — `1 > 0` |
| P3 | `(2,1,1)` | No — `2 > 1` and `1 > 0` |
| P4 | `(2,2,2)` | No — `2 > 1` |

No process can proceed from this `Work` vector, and `Work` itself can never grow without
some process finishing first — the scan is stuck. The hypothetical state is **unsafe**, so
the pretend-grant is rolled back in full and **P2's request is denied**; `P2` must wait,
even though enough resources were technically available to satisfy it right now.

!!! warning "Both checks passing is not enough on its own"
    Example B passed both preliminary checks — the request was within `P2`'s declared
    `Need` and within current `Available` — and still had to be denied. This is the entire
    reason the Banker's Algorithm reruns the full Safety Algorithm on every request instead
    of stopping at those two cheaper checks: a request can be individually affordable right
    now while still steering the whole system into a state with no safe sequence at all.

## Key Takeaways

- **Avoidance** differs from **prevention** (Lecture 19) in strategy, not goal: prevention
  permanently forbids one of the four necessary conditions; avoidance allows all four to
  remain possible but dynamically refuses any allocation that would leave the system
  **unsafe**.
- A **safe state** has at least one **safe sequence** — an order in which every process can
  finish using only currently available and progressively released resources. An unsafe
  state is not automatically deadlocked, but it is no longer *guaranteed* deadlock-free.
- The **RAG algorithm** (claim edges, grant only if no cycle results) handles avoidance for
  single-instance resource types; the **Banker's Algorithm** generalizes avoidance to
  resource types with multiple instances.
- The Banker's Algorithm's four structures relate by one identity that must hold for every
  process, always: `Need = Max − Allocation`.
- The **Safety Algorithm** finds a safe sequence (or proves none exists) by repeatedly
  granting the first process whose `Need` fits the current `Work` vector; the
  **Resource-Request Algorithm** checks a request against `Need` and `Available`, then
  *pretends* to grant it and reruns the Safety Algorithm before committing — rolling back if
  the resulting state would be unsafe, exactly as Example B showed.

Avoidance assumes the system can always get the information (maximum future needs) it
requires to make this guarantee. Lecture 21 covers what happens when that assumption is
dropped entirely — detecting deadlock after the fact, and recovering from it once it's
already occurred:
[Lecture 21: Deadlock Detection, Recovery, and Case Study](lecture-21-deadlock-detection-recovery-and-case-study.md).
