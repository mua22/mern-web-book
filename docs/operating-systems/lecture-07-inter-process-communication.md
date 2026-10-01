---
title: "7. Inter-Process Communication"
tags:
  - CSC323
  - Operating Systems
  - IPC
  - Shared Memory
  - Message Passing
  - Sockets
  - RPC
---

# 7. Inter-Process Communication

Lecture 6 treated processes as isolated entities, each with its own private memory, and that
isolation is deliberate — it's exactly what protection (Lecture 5) demands. But isolation
creates a problem the moment two processes actually need to work *together*. A shell running
`ls | grep txt` needs the output of `ls` to become the input of `grep`. A web browser's
rendering process needs to hand decoded image data to a separate GPU process. A producer
thread generating sensor readings needs to hand them off to a consumer thread writing them to
disk. None of this is possible if processes truly cannot see each other's memory at all —
so every operating system provides deliberate, controlled ways to breach that isolation on
purpose. That's **inter-process communication (IPC)**, and this lecture covers its two
fundamental models, plus the two mechanisms — sockets and RPC — that extend the same idea
across a network.

## In This Lecture

- Why **cooperating processes** need a way to communicate at all
- **Shared memory**: fast, but synchronization becomes the processes' own responsibility
- **Message passing**: `send()`/`receive()`, direct vs. indirect communication, synchronous
  vs. asynchronous, and automatic vs. explicit buffering
- **Sockets**: an endpoint for communication, identified by an IP address and a port
- **Remote Procedure Calls (RPC)**: calling a procedure on another machine as if it were local

## Why Processes Need to Communicate

Most processes on a system run completely independently and never need to talk to each
other at all — but **cooperating processes** are different: processes that are explicitly
designed to work together on a shared task, each contributing part of the result. Two
everyday examples:

- A **shell pipeline** like `cat log.txt | grep ERROR | sort` chains three separate
  processes together, where each one's output becomes the next one's input.
- A **producer/consumer pair**, where one process generates data (reading sensor values,
  say) and a second process consumes it (writing it to a database) — common in everything
  from print spoolers to streaming media pipelines.

Both examples need the same underlying capability: a way to move data from one process's
private address space into another's, safely and under OS supervision. There are two
fundamentally different ways to provide it.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Two IPC models</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Shared memory</span>
<span class="db-node-sub">OS sets up one region both processes can access directly; the processes do everything else themselves</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Message passing</span>
<span class="db-node-sub">OS mediates every exchange via send()/receive(); no memory is ever directly shared</span>
</div>
</div>
</div>

## Shared Memory

In the **shared memory** model, the operating system sets up a single region of memory that
multiple processes can map into their own address spaces. Once that mapping exists, those
processes read and write that memory directly, exactly as if it were ordinary local
variables — there is no further OS involvement in each individual read or write, which is
exactly why this model is *fast*: after the initial setup, communication is just memory
access, with none of the overhead of a system call per message.

The speed comes at a real cost, though: the OS steps out of the way entirely once the shared
region exists, which means **the processes themselves are entirely responsible for
coordinating their access to it**. If a producer process is in the middle of writing a new
value into the shared region while a consumer process reads it, the consumer can see a
half-written, inconsistent value. Nothing about the shared-memory mechanism itself prevents
that — the processes have to agree, through their own logic, on rules like "don't read until
the producer signals that a full value has been written."

!!! note "Synchronization is coming — this lecture only flags the problem"
    Making concurrent access to shared data safe is a large enough topic that it gets an
    entire unit of its own later in this course, covering race conditions, mutual exclusion,
    semaphores, and monitors. For now, the only thing to take away is that shared memory's
    speed is bought by pushing the coordination problem entirely onto the cooperating
    processes — the OS gives them a shared room, but it's up to them to agree on not talking
    over each other.

## Message Passing

In the **message passing** model, processes never directly touch each other's memory at all.
Instead, the OS provides two primitives — **`send(message)`** and **`receive(message)`** —
and every exchange of data between processes goes through the OS, which copies the message
from the sender into some OS-managed channel and then copies it out again to the receiver.

This is slower than shared memory, because every message involves at least one trip through
the operating system (and usually two copies of the data), but it is also considerably
*simpler to get right*: because the OS mediates every exchange, there's no way for one
process to see another's half-finished write, and the same `send()`/`receive()` interface
works whether the two processes are on the same machine or on opposite sides of a network —
which makes message passing the natural fit for distributed systems, where shared memory
across separate machines isn't even physically possible.

Message passing systems vary along a few independent design choices:

- **Direct vs. indirect communication** — in *direct* communication, `send()` and `receive()`
  name the other process explicitly (`send(P2, message)`), so each link is tied to exactly
  one sender-receiver pair. In *indirect* communication, processes send to and receive from a
  shared intermediary — a **mailbox** or **port** — rather than to each other by name, so
  several processes can share one mailbox without any of them needing to know who else is
  using it.
- **Synchronous vs. asynchronous communication** — *synchronous* (blocking) `send()` and
  `receive()` pause the calling process until the corresponding operation on the other side
  has happened — a sender blocks until its message is received, a receiver blocks until a
  message arrives. *Asynchronous* (non-blocking) versions return immediately, letting the
  process continue other work while the message is in transit.
- **Automatic vs. explicit buffering** — messages sent but not yet received have to sit
  somewhere in the meantime. With *automatic (system) buffering*, the OS maintains a queue of
  pending messages up to some capacity and manages overflow itself. With *explicit buffering*,
  the application is responsible for sizing and managing that queue itself (or, at the
  extreme, there's zero-capacity buffering, which forces synchronous send/receive since there
  is nowhere for a message to wait).

<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Direct communication</span>
<span class="db-node-sub">send(P2, msg) — names the receiving process explicitly, one link per pair</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Indirect communication</span>
<span class="db-node-sub">send(mailbox, msg) — sender and receiver need only agree on a shared mailbox</span>
</div>
</div>

!!! tip "Shared memory vs. message passing, side by side"

    <div class="db-relation" markdown>
    <div class="db-relation-name">Choosing between the two IPC models</div>

    | | Shared memory | Message passing |
    |---|---|---|
    | Speed | Fast — direct memory access after setup | Slower — every message is copied through the OS |
    | Ease of correctness | Hard — processes must synchronize access themselves | Easier — the OS mediates every exchange |
    | Works across machines? | No — requires physically shared memory | Yes — the same model scales naturally to a network |
    | Best suited for | Tightly coupled processes on one machine exchanging large volumes of data | Loosely coupled or distributed processes, where simplicity and safety matter more than raw speed |

    </div>

## Sockets

A **socket** is an endpoint for communication, identified by the combination of an **IP
address** and a **port number** — the IP address picks out a specific machine on a network,
and the port number picks out a specific process (or service) on that machine willing to
communicate. A web server listening on `192.0.2.10:443` and a browser connecting from
`203.0.113.7:51342` are each, from the OS's point of view, a socket — and the pair of them,
once connected, forms a full communication channel identified by all four values together.

The familiar **client-server** pattern is built directly on sockets: a server process
creates a socket and *listens* on a well-known port, while any number of client processes
create their own sockets and *connect* to that address and port. Once connected, both sides
exchange data over the connection using essentially the same `send()`/`receive()`-style
operations message passing already introduced — a socket is, at its core, message passing
extended across a network, rather than a third, unrelated mechanism.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Client-server communication over sockets</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Client socket</span>
<span class="db-node-sub">203.0.113.7 : 51342</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Connection</span>
<span class="db-node-sub">Identified by both endpoints' IP + port</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Server socket</span>
<span class="db-node-sub">192.0.2.10 : 443, listening for connections</span>
</div>
</div>
</div>

!!! note "A port lets one machine run many independent services"
    Without ports, a single IP address could only ever run one network service at a time.
    Ports let the same physical machine run a web server on port 443, a mail server on port
    25, and an SSH daemon on port 22 simultaneously, each with its own socket, each receiving
    exactly the traffic addressed to its own port number.

## Remote Procedure Calls (RPC)

Sockets give you a raw channel for exchanging bytes — but a programmer writing distributed
software usually doesn't want to think in terms of bytes at all; they want to call a function
and get a result back, the same way they'd call any local function. A **Remote Procedure Call
(RPC)** is exactly that: a mechanism that lets a program call a procedure that actually
executes on a different machine, while making the call look and feel like an ordinary local
function call.

RPC achieves this illusion with **stubs** — small pieces of generated code on both sides of
the call:

- On the calling machine, a **client stub** takes the procedure call's arguments, packages
  them into a message (a process called **marshalling**), and sends that message over the
  network (typically, under the hood, using sockets) to the remote machine.
- On the remote machine, a **server stub** receives that message, **unmarshals** it back into
  ordinary arguments, calls the *actual* procedure locally, and then marshals the return
  value back into a message to send to the client.
- The client stub receives that reply, unmarshals the return value, and hands it back to the
  calling code — which never had to know, from its own point of view, that the call went
  anywhere further than the next line of its own program.

<div class="db-diagram" markdown>
<p class="db-diagram-label">An RPC call, traced through its stubs</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Calling program</span>
<span class="db-node-sub">Invokes getBalance(acctNo) as if it were local</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Client stub</span>
<span class="db-node-sub">Marshals acctNo into a message, sends it over the network</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Server stub</span>
<span class="db-node-sub">Unmarshals the message, calls the real getBalance() locally, marshals the result back</span>
</div>
</div>
</div>

!!! tip "RPC is message passing with a procedure-call interface wrapped around it"
    It's worth noticing that RPC isn't a fourth, independent IPC mechanism — underneath the
    stubs, it's ordinary message passing (very often carried over sockets) between two
    processes on different machines. What RPC adds is purely a *convenience*: it hides the
    marshalling, the network call, and the unmarshalling behind something that looks
    syntactically identical to calling a local function, so the programmer doesn't have to
    hand-write `send()`/`receive()` logic for every remote call they need to make.

## Key Takeaways

- **Cooperating processes** — like a shell pipeline or a producer/consumer pair — need a
  deliberate, OS-provided way to exchange data across the isolation that normally separates
  processes.
- **Shared memory** is fast because the OS steps aside after setup, but that speed means the
  processes themselves must synchronize their own access — a topic this course returns to in
  full later.
- **Message passing** mediates every exchange through the OS via `send()`/`receive()`,
  trading some speed for safety and for working naturally across a network; it varies by
  direct vs. indirect addressing, synchronous vs. asynchronous calls, and automatic vs.
  explicit buffering.
- A **socket** is a communication endpoint identified by an IP address and a port, and
  underlies the familiar client-server communication pattern.
- **RPC** lets a program call a procedure on a remote machine as if it were local, using
  client and server **stubs** to marshal and unmarshal parameters — built on top of ordinary
  message passing, not separate from it.

Next: **[Lecture 8 — Introduction to Threads and Concurrency](lecture-08-introduction-to-threads-and-concurrency.md)**.
