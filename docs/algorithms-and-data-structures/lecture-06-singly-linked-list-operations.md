---
title: "Lecture 6: Singly Linked List Operations"
tags:
  - CSC211
  - Linked Lists
  - Data Structures
---

# Lecture 6: Singly Linked List Operations

Lecture 5 covered insertion and deletion at the *front* of a linked list — the cheapest
possible case. Real programs need the full toolkit: inserting or deleting at the *end*, at
an arbitrary *position*, searching for a value, updating a node, counting the list, and
reversing it entirely. This lecture builds all of them into one complete
`SinglyLinkedList` class, compiled and run as one program.

## In This Lecture

- Every core singly linked list operation, built as methods on one reusable class
- Insertion and deletion at the beginning, end, and a specific position
- Searching, updating, and counting nodes
- Reversing a linked list in place
- The complexity of every operation covered

## The Singly Linked List Class

A **singly** linked list is exactly what Lecture 5 introduced: each node points only
*forward*, to the next node — there is no way to go backward from a node. Wrapping the
node-pointer logic inside a class (rather than free functions passing `head` around, like
Lecture 5 did) is how real code organizes this: the class keeps track of its own `head`,
and every operation becomes a method on it.

```cpp title="singly_linked_list.cpp"
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int value) : data(value), next(nullptr) {}
};

class SinglyLinkedList {
private:
    Node* head;

public:
    SinglyLinkedList() : head(nullptr) {}

    void insertAtBeginning(int value) {
        Node* newNode = new Node(value);
        newNode->next = head;
        head = newNode;
    }

    void insertAtEnd(int value) {
        Node* newNode = new Node(value);
        if (head == nullptr) {
            head = newNode;
            return;
        }
        Node* current = head;
        while (current->next != nullptr) {
            current = current->next;
        }
        current->next = newNode;
    }

    // position is 0-based; inserting at position == count() appends at the end.
    void insertAtPosition(int value, int position) {
        if (position == 0) { insertAtBeginning(value); return; }
        Node* current = head;
        for (int i = 0; i < position - 1 && current != nullptr; i++) {
            current = current->next;
        }
        if (current == nullptr) return;   // position out of range
        Node* newNode = new Node(value);
        newNode->next = current->next;
        current->next = newNode;
    }

    void deleteFromBeginning() {
        if (head == nullptr) return;
        Node* oldHead = head;
        head = head->next;
        delete oldHead;
    }

    void deleteFromEnd() {
        if (head == nullptr) return;
        if (head->next == nullptr) { delete head; head = nullptr; return; }
        Node* current = head;
        while (current->next->next != nullptr) {
            current = current->next;
        }
        delete current->next;
        current->next = nullptr;
    }

    void deleteAtPosition(int position) {
        if (position == 0) { deleteFromBeginning(); return; }
        Node* current = head;
        for (int i = 0; i < position - 1 && current != nullptr; i++) {
            current = current->next;
        }
        if (current == nullptr || current->next == nullptr) return;
        Node* toDelete = current->next;
        current->next = toDelete->next;
        delete toDelete;
    }

    // Returns the 0-based index of `value`, or -1 if not found.
    int search(int value) const {
        Node* current = head;
        int index = 0;
        while (current != nullptr) {
            if (current->data == value) return index;
            current = current->next;
            index++;
        }
        return -1;
    }

    bool updateAt(int position, int newValue) {
        Node* current = head;
        for (int i = 0; i < position && current != nullptr; i++) {
            current = current->next;
        }
        if (current == nullptr) return false;
        current->data = newValue;
        return true;
    }

    int countNodes() const {
        int count = 0;
        Node* current = head;
        while (current != nullptr) {
            count++;
            current = current->next;
        }
        return count;
    }

    // Reverses the list in place by walking it once, re-pointing each node's `next`
    // backward instead of forward.
    void reverse() {
        Node* previous = nullptr;
        Node* current = head;
        while (current != nullptr) {
            Node* nextNode = current->next;  // save it before we overwrite `next`
            current->next = previous;         // reverse this node's pointer
            previous = current;               // advance previous
            current = nextNode;               // advance current
        }
        head = previous;   // previous is now the new head (the old tail)
    }

    void display() const {
        Node* current = head;
        while (current != nullptr) {
            cout << current->data;
            if (current->next != nullptr) cout << " -> ";
            current = current->next;
        }
        cout << endl;
    }
};

int main() {
    SinglyLinkedList list;

    list.insertAtEnd(10);
    list.insertAtEnd(20);
    list.insertAtEnd(30);
    cout << "After inserting 10, 20, 30 at end: ";
    list.display();

    list.insertAtBeginning(5);
    cout << "After inserting 5 at beginning:    ";
    list.display();

    list.insertAtPosition(15, 2);
    cout << "After inserting 15 at position 2:  ";
    list.display();

    cout << "Search for 20: index " << list.search(20) << endl;
    cout << "Search for 99: index " << list.search(99) << endl;

    list.updateAt(1, 100);
    cout << "After updating position 1 to 100:  ";
    list.display();

    cout << "Node count: " << list.countNodes() << endl;

    list.deleteAtPosition(2);
    cout << "After deleting position 2:         ";
    list.display();

    list.deleteFromEnd();
    cout << "After deleting from end:           ";
    list.display();

    list.reverse();
    cout << "After reversing:                   ";
    list.display();

    return 0;
}
```

```text
$ g++ -std=c++17 -o singly_linked_list singly_linked_list.cpp
$ ./singly_linked_list
After inserting 10, 20, 30 at end: 10 -> 20 -> 30
After inserting 5 at beginning:    5 -> 10 -> 20 -> 30
After inserting 15 at position 2:  5 -> 10 -> 15 -> 20 -> 30
Search for 20: index 3
Search for 99: index -1
After updating position 1 to 100:  5 -> 100 -> 15 -> 20 -> 30
Node count: 5
After deleting position 2:         5 -> 100 -> 20 -> 30
After deleting from end:           5 -> 100 -> 20
After reversing:                   20 -> 100 -> 5
```

!!! note "Why reverse() only needs one pass"
    `reverse()` never allocates a new node or copies any data — it walks the list exactly
    once, and at each node it flips `next` to point *backward* instead of forward, using
    two helper pointers (`previous` and `nextNode`) so it never loses track of the rest of
    the list. This is the standard pattern for in-place linked list reversal and is worth
    tracing on paper, node by node, until it clicks.

## Complexity of Singly Linked List Operations

| Operation | Complexity | Why |
|---|---|---|
| Insert at beginning | O(1) | Only the new node's `next` and `head` change |
| Insert at end | O(n) | Must walk the whole list to find the current last node |
| Insert at position `k` | O(k) | Must walk `k` nodes in from the head |
| Delete from beginning | O(1) | Only `head` and one pointer change |
| Delete from end | O(n) | Must walk to the second-to-last node |
| Delete at position `k` | O(k) | Must walk `k` nodes in from the head |
| Search | O(n) | No way to skip ahead — must check nodes one by one |
| Update at position `k` | O(k) | Same walk as insert/delete at a position |
| Count nodes | O(n) | Must visit every node once |
| Reverse | O(n) | Visits every node exactly once |

Compare this table to Lecture 4's array complexity table: a linked list flips the
array's trade-off almost exactly — cheap insert/delete at the front instead of the end,
expensive access by position instead of cheap.

## Try It Yourself

1. Compile and run `singly_linked_list.cpp` yourself, then add a call to
   `insertAtPosition(999, 0)` and confirm from the output that it behaves identically to
   `insertAtBeginning` — trace through the code to explain *why* the `position == 0`
   check makes that guaranteed, not a coincidence.
2. Add a method `int sum() const` that returns the sum of every node's data, and a method
   `bool isEmpty() const`. Test both by calling them before and after emptying the list
   with repeated `deleteFromBeginning()` calls.

## Key Takeaways

- Wrapping node-pointer logic inside a class turns loose functions into a reusable,
  self-contained ADT — the caller never touches `Node` or `head` directly.
- Insert/delete at the **beginning** are O(1); insert/delete at the **end** or a **specific
  position** are O(n) or O(k), because reaching that point requires walking the list —
  there is no shortcut the way array indexing provides one.
- **Reversing** a singly linked list is a classic O(n), single-pass algorithm using three
  pointers (`previous`, `current`, `nextNode`) to flip each `next` pointer without losing
  the rest of the list.
- Every operation's complexity comes down to one fact: a singly linked list can only be
  walked forward, one node at a time, from the head.
