---
title: "Lecture 2: Classification, Operations, and Abstract Data Types"
tags:
  - CSC211
  - Data Structures
  - ADT
  - Abstraction
---

# Lecture 2: Classification, Operations, and Abstract Data Types

Lecture 1 defined *what* a data structure is. Before you can choose the right one for a
job, you need a map of the landscape — the handful of dimensions along which every data
structure can be classified — and a precise way to talk about what a data structure
*promises to do*, separate from how it actually does it. That second idea, the **Abstract
Data Type**, is one of the most important concepts in this entire course.

## In This Lecture

- Six criteria used to classify any data structure
- The standard operations every data structure exposes in some form
- What an Abstract Data Type (ADT) is, and why interface and implementation are kept separate
- The SAME ADT, implemented two completely different ways, proving interface and
  implementation really are independent
- Abstraction and encapsulation, and how C++ actually enforces them
- The trade-offs — time vs. space, simplicity vs. efficiency — behind every design choice

## Criteria for Classification of Data Structures

There is no single "type" of data structure — instead, every data structure can be placed
along several independent axes at once. A `std::vector` and a linked list, for example,
are both **linear**, but one is **static-ish** (contiguous, resizes in chunks) and the
other is genuinely **dynamic** (grows one node at a time).

```mermaid
flowchart TD
    DS["Data Structures"] --> P["By composition"]
    DS --> L["By arrangement"]
    DS --> S["By memory allocation"]
    DS --> A["By access pattern"]

    P --> P1["Primitive<br/>int, char, float, bool"]
    P --> P2["Non-Primitive<br/>array, list, tree, graph"]

    L --> L1["Linear<br/>array, linked list, stack, queue"]
    L --> L2["Non-Linear<br/>tree, graph"]

    S --> S1["Static<br/>fixed size, e.g. C-style array"]
    S --> S2["Dynamic<br/>grows/shrinks, e.g. linked list"]

    A --> A1["Sequential access<br/>must pass earlier elements first"]
    A --> A2["Random access<br/>jump straight to any element"]
```

### Primitive vs. Non-Primitive

**Primitive** data structures are the built-in types the language gives you for free —
`int`, `char`, `float`, `bool` — each holding a single value. **Non-primitive** data
structures are built *from* those primitives, combining many values into one organized
whole: arrays, linked lists, stacks, queues, trees, and graphs.

### Linear vs. Non-Linear

A structure is **linear** if its elements form a sequence — each element (except the
first and last) has exactly one predecessor and one successor. Arrays, linked lists,
stacks, and queues are all linear. A structure is **non-linear** if an element can connect
to more than one other element at once — a tree node can have several children, a graph
vertex can have many neighbors.

### Static vs. Dynamic

A **static** data structure has a fixed size decided when it's created — a plain
C-style array `int scores[100]` can never hold more than 100 elements without creating an
entirely new array. A **dynamic** data structure can grow and shrink while the program
runs, allocating exactly as much memory as it currently needs — a linked list is the
clearest example: every insertion allocates one more node, every deletion frees one.

### Sequential vs. Random Access

**Sequential access** means reaching element *N* requires visiting elements 1 through
*N-1* first — true of a linked list, where the only way to element 5 is through elements
1–4. **Random access** means jumping straight to any element in one step, given its
position — true of an array, where `scores[5]` is exactly as fast as `scores[0]`.

### Persistent vs. Ephemeral

An **ephemeral** data structure only ever remembers its *current* state — when you modify
it, the old version is gone. Almost every data structure you'll build in this course is
ephemeral. A **persistent** data structure preserves *every* previous version of itself as
you modify it, so you can go back and query "what did this look like before the last
change?" — the kind of structure behind an editor's full undo history or Git's commit
history, where nothing is ever truly overwritten.

```mermaid
flowchart TD
    subgraph Ephemeral["Ephemeral: modifying overwrites the only copy"]
    direction TB
        E1["List: [10, 20]"] -->|"append(30)"| E2["List: [10, 20, 30]<br/>(the [10, 20] version<br/>no longer exists anywhere)"]
    end
    subgraph Persistent["Persistent: modifying creates a new version, old one survives"]
    direction TB
        P1["Version 1: [10, 20]"] -->|"append(30)"| P2["Version 2: [10, 20, 30]"]
        P1 -.->|"still reachable"| P1
    end
```

## Operations on Data Structures

Regardless of which structure you're using, the operations you perform on it fall into a
small, recurring set:

| Operation | Meaning |
|---|---|
| **Traversal** | Visit every element, typically to process or display each one |
| **Insertion** | Add a new element |
| **Deletion** | Remove an existing element |
| **Searching** | Find whether (and where) a given value exists |
| **Sorting** | Rearrange elements into a defined order |
| **Updating** | Modify the value of an existing element |
| **Merging** | Combine two data structures of the same type into one |

Every lecture from here on is really answering the same question for a new structure:
*how efficiently can it perform each of these seven operations, and which ones is it
actually good at?*

## Abstract Data Types and Data Structure Design

### Abstract Data Type (ADT)

An **Abstract Data Type** is a mathematical, logical description of a data structure —
*what* operations it supports and *what* they do — with no mention of *how* it's built
underneath. "A Stack supports `push`, `pop`, and `peek`, and `pop` always removes the most
recently pushed item" is a complete ADT description. Nothing in it says whether the stack
is backed by an array or a linked list — and that's the entire point.

### Interface and Implementation

The **interface** is the ADT's public promise — the operation names, their inputs, and
their outputs. The **implementation** is the actual code that makes those operations
work. C++'s `class` keyword lets you write both while keeping them visibly separate:

```cpp
// int_bag.h -- an ADT interface (declarations only, no main -- illustrative, not
// meant to compile standalone; the runnable version follows immediately below)
class IntBag {
public:
    void add(int value);      // interface: what you can DO
    bool contains(int value) const;
    int size() const;
private:
    // implementation: how it's actually stored — callers never see this
    int data[100];
    int count = 0;
};
```

```cpp title="int_bag_demo.cpp"
#include <iostream>
using namespace std;

class IntBag {
public:
    void add(int value) { data[count++] = value; }
    bool contains(int value) const {
        for (int i = 0; i < count; i++) {
            if (data[i] == value) return true;
        }
        return false;
    }
    int size() const { return count; }
private:
    int data[100];
    int count = 0;
};

int main() {
    IntBag bag;
    bag.add(7);
    bag.add(42);
    bag.add(15);

    cout << "Bag size: " << bag.size() << endl;
    cout << "Contains 42? " << (bag.contains(42) ? "yes" : "no") << endl;
    cout << "Contains 99? " << (bag.contains(99) ? "yes" : "no") << endl;
    return 0;
}
```

```text
$ g++ -std=c++17 -o int_bag_demo int_bag_demo.cpp
$ ./int_bag_demo
Bag size: 3
Contains 42? yes
Contains 99? no
```

Whoever calls `bag.add(42)` never needs to know it's a fixed-size array under the hood —
tomorrow you could swap `data[100]` for a dynamically growing array, and every single
line of code that *uses* `IntBag` would keep working, unchanged. That's the payoff of
separating interface from implementation.

### The Same ADT, Two Different Implementations

That claim — "you could swap the implementation and nothing that calls it would notice" —
is worth proving directly instead of just asserting. Below are **two separate classes**,
`ArrayBag` and `VectorBag`. Both implement the exact same "Bag" ADT: `add`, `contains`,
`size`, with identical meaning. One stores its elements in a fixed-size C-style array (the
**static** classification from earlier this lecture); the other stores them in a
`std::vector`, which grows automatically (**dynamic**). A single templated function runs
the *identical sequence of operations* against both, having no idea which one it's talking
to:

```cpp title="bag_two_implementations.cpp"
#include <iostream>
#include <vector>
using namespace std;

// ---- Implementation 1: fixed-size array ----
class ArrayBag {
public:
    void add(int value) { data[count++] = value; }
    bool contains(int value) const {
        for (int i = 0; i < count; i++) {
            if (data[i] == value) return true;
        }
        return false;
    }
    int size() const { return count; }
private:
    int data[100];
    int count = 0;
};

// ---- Implementation 2: dynamically growing vector ----
class VectorBag {
public:
    void add(int value) { data.push_back(value); }
    bool contains(int value) const {
        for (int v : data) {
            if (v == value) return true;
        }
        return false;
    }
    int size() const { return (int)data.size(); }
private:
    vector<int> data;
};

// Runs the SAME sequence of ADT operations against whichever bag is passed in.
// This function doesn't know (and doesn't care) which implementation it got.
template <typename Bag>
void runSameOperations(Bag& bag, const string& label) {
    bag.add(7);
    bag.add(42);
    bag.add(15);
    cout << label << " -> size: " << bag.size()
         << ", contains(42): " << (bag.contains(42) ? "yes" : "no")
         << ", contains(99): " << (bag.contains(99) ? "yes" : "no") << endl;
}

int main() {
    ArrayBag arrayBag;
    VectorBag vectorBag;

    runSameOperations(arrayBag, "ArrayBag ");
    runSameOperations(vectorBag, "VectorBag");
    return 0;
}
```

```text
$ g++ -std=c++17 -o bag_two_implementations bag_two_implementations.cpp
$ ./bag_two_implementations
ArrayBag  -> size: 3, contains(42): yes, contains(99): no
VectorBag -> size: 3, contains(42): yes, contains(99): no
```

Identical output from two completely different pieces of code. `runSameOperations` calls
`bag.add(...)`, `bag.contains(...)`, and `bag.size()` exactly the same way in both cases —
it never touches `data` or `count` directly, so it genuinely cannot tell (and doesn't need
to know) whether it's holding a fixed array or a growable vector underneath. *That* is what
"interface and implementation are independent" means in practice, not just in theory.

The two implementations aren't equivalent in every respect, though — they inherit the exact
trade-offs the classification section above already named:

| | `ArrayBag` (static) | `VectorBag` (dynamic) |
|---|---|---|
| Maximum capacity | Fixed at 100 forever | Unlimited — grows as needed |
| Memory allocated up front | 100 slots, whether used or not | Only what's currently needed |
| Adding past capacity | Silent buffer overflow — undefined behavior | Automatically reallocates and grows |
| Extra bookkeeping | None beyond a `count` | Vector's internal capacity management |

```mermaid
flowchart LR
    subgraph Before["Before: SmallArrayBag holding 3/3 (full)"]
    direction LR
        A1["[10]"] --- A2["[20]"] --- A3["[30]"]
    end
    subgraph AfterArray["add(40) on ArrayBag: REJECTED"]
    direction LR
        B1["[10]"] --- B2["[20]"] --- B3["[30]"]
        BX["40 has nowhere to go —<br/>capacity is fixed"]
    end
    subgraph AfterVector["add(40) on VectorBag: accepted"]
    direction LR
        C1["[10]"] --- C2["[20]"] --- C3["[30]"] --- C4["[40]<br/>new capacity allocated"]
    end
    Before --> AfterArray
    Before --> AfterVector
```

That silent-overflow risk in the fixed-capacity version is real, not theoretical — the next
example demonstrates it safely, by having `add` *check* the capacity and report failure
instead of writing past the end of the array:

```cpp title="bag_capacity_limit.cpp"
#include <iostream>
#include <vector>
using namespace std;

// A small, fixed-capacity array-backed bag -- capacity is baked in at compile time.
class SmallArrayBag {
public:
    bool add(int value) {
        if (count >= 3) return false;   // out of room -- this IS the static limitation
        data[count++] = value;
        return true;
    }
    int size() const { return count; }
private:
    int data[3];   // capacity fixed at 3, forever
    int count = 0;
};

// A vector-backed bag has no such ceiling -- it reallocates as needed.
class GrowableBag {
public:
    bool add(int value) { data.push_back(value); return true; }   // always succeeds
    int size() const { return (int)data.size(); }
private:
    vector<int> data;
};

int main() {
    SmallArrayBag smallBag;
    GrowableBag growableBag;

    int valuesToAdd[] = {10, 20, 30, 40, 50};
    for (int v : valuesToAdd) {
        bool arrayOk = smallBag.add(v);
        bool vectorOk = growableBag.add(v);
        cout << "add(" << v << ") -> SmallArrayBag: " << (arrayOk ? "ok" : "REJECTED (full)")
             << ", GrowableBag: " << (vectorOk ? "ok" : "REJECTED") << endl;
    }
    cout << "Final sizes -> SmallArrayBag: " << smallBag.size()
         << ", GrowableBag: " << growableBag.size() << endl;
    return 0;
}
```

```text
$ g++ -std=c++17 -o bag_capacity_limit bag_capacity_limit.cpp
$ ./bag_capacity_limit
add(10) -> SmallArrayBag: ok, GrowableBag: ok
add(20) -> SmallArrayBag: ok, GrowableBag: ok
add(30) -> SmallArrayBag: ok, GrowableBag: ok
add(40) -> SmallArrayBag: REJECTED (full), GrowableBag: ok
add(50) -> SmallArrayBag: REJECTED (full), GrowableBag: ok
Final sizes -> SmallArrayBag: 3, GrowableBag: 5
```

Both bags received the exact same five `add` calls, through the exact same ADT interface —
and behaved completely differently, purely because of what's happening behind that
interface. This is the practical payoff of separating interface from implementation: an
application can be written entirely against the *interface* (`add`, `contains`, `size`),
and the choice of *implementation* can be swapped later — or compared side by side, as
just shown — without touching any of the code that uses it.

!!! note "This IS the array-vs-linked-list trade-off from Lecture 4, one level up"
    Notice the shape of this trade-off is identical to arrays vs. linked lists: a
    fixed-capacity structure is simple and has zero bookkeeping overhead, but hits a hard
    wall; a dynamically growing structure avoids that wall but pays a small ongoing cost
    (here, `std::vector`'s internal reallocation logic) to do it. You will see this exact
    tension resurface for nearly every ADT this course covers — Stack, Queue, and beyond —
    because it's a property of *static vs. dynamic storage*, not of any one ADT.

### Abstraction and Encapsulation

**Abstraction** means exposing only what a user of the ADT needs to know (`add`,
`contains`, `size`) and hiding everything else. **Encapsulation** is the mechanism C++
gives you to enforce that: the `private` section physically prevents outside code from
touching `data` or `count` directly — the compiler will reject `bag.data[0] = 5;` with an
error, not just a style guideline.

```cpp
// bag.data[0] = 5;   // ERROR: 'data' is private within this context
bag.add(5);           // OK — goes through the public interface
```

## Trade-offs in Data Structure Design

No data structure is best at everything — every design decision trades one thing for
another.

- **Time-space trade-off.** A hash table (covered in Unit 8) answers "is this value
  present?" almost instantly, but it spends extra memory to do it. A plain array uses
  less memory but may have to check every element to answer the same question.
- **Simplicity vs. efficiency.** A simple, unsorted array is trivial to implement and
  insert into — but searching it means checking every element. Keeping it sorted makes
  searching much faster (binary search, Unit 7) but makes every insertion slower, since
  elements may need to shift to stay in order.

### Criteria for Selecting an Appropriate Data Structure

When choosing a structure for a real problem, ask:

1. What operations does the application perform *most often* — lots of lookups? Lots of
   insertions? Rare deletions?
2. How much data will it realistically need to hold, and does that size change at runtime?
3. Is memory usage a hard constraint (embedded systems, mobile), or is speed the priority?
4. How will the application's needs likely change as it grows?

### Impact of Evolving Application Requirements

A choice that's correct today can become wrong tomorrow. A contact list built as a plain
array is perfectly fine for 50 contacts — but if the application grows to millions of
users and needs instant lookup by name, that same array becomes the bottleneck, and a
hash table or a balanced tree becomes the right call instead. Good engineers revisit their
data structure choices as an application's real usage pattern becomes clear, rather than
treating the first choice as permanent.

## Try It Yourself

1. Classify a `std::string` in C++ along all four axes from this lecture: is it primitive
   or non-primitive, linear or non-linear, static or dynamic, sequential or random access?
   Justify each answer in one sentence.
2. Extend the `IntBag` example with a `remove(int value)` method that deletes the first
   occurrence of `value` (shift later elements left by one to fill the gap). Compile and
   run it to confirm `size()` decreases correctly after a removal.
3. Write a *third* implementation of the same Bag ADT used in `bag_two_implementations.cpp`
   — `SortedArrayBag` — that keeps its internal array sorted on every `add` (insert the new
   value at the position that keeps it sorted, shifting later elements right, similar to
   Lecture 4's `insertAt`). Pass it to `runSameOperations` alongside `ArrayBag` and
   `VectorBag` and confirm the printed `size`/`contains` results are identical to the other
   two, even though `add` is now doing meaningfully more work per call.
4. In one or two sentences each, explain why `SmallArrayBag` from `bag_capacity_limit.cpp`
   is a **static** data structure and `GrowableBag` is a **dynamic** one, using the exact
   definitions from the "Static vs. Dynamic" section earlier in this lecture.

## Key Takeaways

- Every data structure can be classified along several independent axes at once:
  primitive/non-primitive, linear/non-linear, static/dynamic, sequential/random access,
  and ephemeral/persistent.
- Every data structure supports some combination of seven core operations: traversal,
  insertion, deletion, searching, sorting, updating, and merging.
- An **Abstract Data Type (ADT)** describes *what* a structure does, completely separate
  from *how* it's implemented — this is what lets an implementation change without
  breaking any code that uses it.
- Two genuinely different implementations of the same ADT (`ArrayBag` and `VectorBag`)
  produced byte-for-byte identical output when driven through the same interface — proof,
  not just assertion, that interface and implementation are independent.
- Static (fixed-capacity) and dynamic (growable) implementations of the same ADT trade a
  hard capacity ceiling against small ongoing reallocation overhead — the same time/space
  tension resurfaces for essentially every ADT later in this course.
- **Abstraction** (expose only what's needed) and **encapsulation** (C++'s `private`
  keyword enforcing that) are how ADTs are actually built in real code.
- Every design is a trade-off — usually time vs. space, or simplicity vs. efficiency —
  and the right choice depends on which operations the application actually needs to be
  fast, and can shift as the application's requirements evolve.
