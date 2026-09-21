---
title: "Lecture 5: Linked Lists: Fundamentals"
tags:
  - CSC211
  - Linked Lists
  - Pointers
  - Data Structures
---

# Lecture 5: Linked Lists: Fundamentals

Lecture 4 ended on a cliffhanger: arrays are fixed-size, and inserting or deleting
anywhere but the end costs O(n) because everything has to shift. The **linked list**
solves both problems at once, at the cost of giving up O(1) random access. This lecture
introduces the structure that will reappear, in one form or another, for the rest of the
course — stacks, queues, and even trees are all built from the same core idea: a **node**
that knows where the *next* node is.

## In This Lecture

- Why arrays alone aren't enough — the need for linked lists
- The linked list concept and how it's actually organized in memory
- The node structure, and what "head" and "tail" mean
- Creating, traversing, and doing basic insertion/deletion on a linked list
- The advantages and limitations of linked lists, compared directly against arrays

## The Need for Linked Lists

An array's size is fixed at creation, and inserting into the middle means shifting every
later element. A linked list fixes both: it grows and shrinks one element at a time, and
inserting or removing an element never requires moving any *other* element — only a
couple of pointers change.

## The Linked List Concept and Memory Organization

Where an array stores its elements *contiguously*, a linked list stores each element in
its own independently-allocated chunk of memory, called a **node**, and each node stores
the *address* of the next node. The nodes can be scattered anywhere in memory — what
makes it a "list" is purely the chain of pointers connecting them.

```mermaid
flowchart LR
    Head(["head"]) --> N1["data: 10<br/>next: ●"]
    N1 --> N2["data: 20<br/>next: ●"]
    N2 --> N3["data: 30<br/>next: ●"]
    N3 --> Null["nullptr"]
```

## The Node Structure

A node bundles two things: the actual data, and a pointer to the next node in the chain.

```cpp
struct Node {
    int data;       // the value this node holds
    Node* next;      // the address of the next node, or nullptr if this is the last one
};
```

`Node* next` is what makes this a *self-referential* structure — a `Node` contains a
pointer to another `Node` of the exact same type. This is the single idea that makes
linked lists (and later, trees and graphs) possible.

## Head and Tail

The **head** is a pointer to the *first* node in the list — it's the only thing you need
to reach the entire list, since every other node is reachable by following `next`
pointers from it. If `head` is `nullptr`, the list is empty. The **tail** is the *last*
node — the one whose `next` is `nullptr`, marking the end of the chain.

## Creating and Traversing a Linked List

```cpp title="linked_list_basics.cpp"
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
};

// Create a single new node holding `value`, with `next` initialized to nullptr.
Node* createNode(int value) {
    Node* newNode = new Node();   // allocate memory for one Node on the heap
    newNode->data = value;
    newNode->next = nullptr;
    return newNode;
}

// Visit every node from head to the end, printing its data.
void traverse(Node* head) {
    Node* current = head;
    while (current != nullptr) {
        cout << current->data;
        if (current->next != nullptr) cout << " -> ";
        current = current->next;
    }
    cout << endl;
}

int main() {
    // Manually build a list of three nodes: 10 -> 20 -> 30
    Node* head = createNode(10);
    head->next = createNode(20);
    head->next->next = createNode(30);

    cout << "List: ";
    traverse(head);
    return 0;
}
```

```text
$ g++ -std=c++17 -o linked_list_basics linked_list_basics.cpp
$ ./linked_list_basics
List: 10 -> 20 -> 30
```

## Basic Insertion

The cheapest possible insertion is at the **front** of the list: create a new node, point
its `next` at the current head, then make the new node the head. No existing node moves —
only two pointer assignments happen.

```mermaid
flowchart LR
    NewHead(["head"]) -.->|"1. new node's next<br/>points at old head"| N1["data: 10"]
    NewHead --> New["data: 5"]
    New -.-> N1
    N1 --> N2["data: 20"]
    N2 --> N3["data: 30"]
```

```cpp title="linked_list_insert.cpp"
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
};

Node* createNode(int value) {
    Node* newNode = new Node();
    newNode->data = value;
    newNode->next = nullptr;
    return newNode;
}

void traverse(Node* head) {
    Node* current = head;
    while (current != nullptr) {
        cout << current->data;
        if (current->next != nullptr) cout << " -> ";
        current = current->next;
    }
    cout << endl;
}

// Insert `value` at the very front of the list; returns the new head.
Node* insertAtFront(Node* head, int value) {
    Node* newNode = createNode(value);
    newNode->next = head;
    return newNode;   // the new node is now the head
}

int main() {
    Node* head = createNode(10);
    head->next = createNode(20);
    head->next->next = createNode(30);

    cout << "Before: "; traverse(head);
    head = insertAtFront(head, 5);
    cout << "After:  "; traverse(head);
    return 0;
}
```

```text
$ g++ -std=c++17 -o linked_list_insert linked_list_insert.cpp
$ ./linked_list_insert
Before: 10 -> 20 -> 30
After:  5 -> 10 -> 20 -> 30
```

## Basic Deletion

Deleting the front node means reading `head->next` (the new head-to-be), freeing the old
head's memory, and updating `head` to point at that saved node.

```cpp title="linked_list_delete.cpp"
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
};

Node* createNode(int value) {
    Node* newNode = new Node();
    newNode->data = value;
    newNode->next = nullptr;
    return newNode;
}

void traverse(Node* head) {
    Node* current = head;
    while (current != nullptr) {
        cout << current->data;
        if (current->next != nullptr) cout << " -> ";
        current = current->next;
    }
    cout << endl;
}

// Delete the front node; returns the new head.
Node* deleteFromFront(Node* head) {
    if (head == nullptr) return nullptr;   // nothing to delete
    Node* oldHead = head;
    head = head->next;   // move head to the second node first
    delete oldHead;       // now it's safe to free the old head's memory
    return head;
}

int main() {
    Node* head = createNode(5);
    head->next = createNode(10);
    head->next->next = createNode(20);

    cout << "Before: "; traverse(head);
    head = deleteFromFront(head);
    cout << "After:  "; traverse(head);
    return 0;
}
```

```text
$ g++ -std=c++17 -o linked_list_delete linked_list_delete.cpp
$ ./linked_list_delete
Before: 5 -> 10 -> 20
After:  10 -> 20
```

!!! warning "Always update the pointer before calling delete"
    `deleteFromFront` reads `head->next` and saves it *before* calling `delete oldHead`.
    Deleting a node frees its memory back to the operating system — reading `oldHead->next`
    *after* the delete would access memory you no longer own, which is undefined behavior
    in C++ (it might work, might crash, or might silently corrupt other data).

## Advantages and Limitations of Linked Lists

**Advantages**

- Genuinely dynamic size — grows and shrinks one node at a time, no wasted pre-allocated
  space and no "resize and copy everything" step.
- Insertion and deletion at the front (and, as Lecture 6 will show, anywhere with a
  reference to the right node) never requires shifting other elements.

**Limitations**

- No random access — reaching `node[i]` means following `i` pointers from the head, one
  at a time, an O(n) walk. There is no equivalent of an array's instant `arr[i]`.
- Extra memory per element for the `next` pointer, on top of the data itself.
- Worse cache performance than an array — nodes can be scattered anywhere in memory,
  unlike an array's contiguous block.

| | Array | Linked List |
|---|---|---|
| Access by index | O(1) | O(n) |
| Insert/delete at front | O(n) (shift everything) | O(1) |
| Extra memory per element | None | One pointer |
| Memory layout | Contiguous | Scattered |

Lecture 6 builds on today's `insertAtFront`/`deleteFromFront` with the full set of
singly linked list operations: inserting and deleting at the end, at a specific position,
searching, and reversing the list.

## Try It Yourself

1. Draw (on paper) the node-by-node picture, like the diagrams above, of what happens when
   you call `insertAtFront` twice in a row on an empty list, first with `100` then with
   `200`. What does the final list look like?
2. Compile and run `linked_list_insert.cpp`, then modify `main` to insert three more
   values at the front in a row and confirm the final order from the printed output
   matches what you'd expect (each new value ends up first).

## Key Takeaways

- A linked list stores each element in its own **node**, scattered anywhere in memory,
  connected by `next` pointers — contiguity is traded away for dynamic size.
- A node is a **self-referential structure**: it holds data plus a pointer to another node
  of the same type.
- **Head** is the entry point to the whole list; a `nullptr` `next` marks the **tail**.
- Inserting or deleting at the front is O(1) — only pointer assignments happen, no other
  node moves — but reaching any specific position requires an O(n) walk from the head.
- Linked lists trade away an array's O(1) random access in exchange for cheap insertion
  and deletion without shifting — pick whichever trade-off matches what your application
  actually does most.
