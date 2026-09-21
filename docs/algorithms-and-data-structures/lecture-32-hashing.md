---
title: "Lecture 32: Hashing and Efficient Data Access"
tags:
  - CSC211
  - Hashing
  - Data Structures
---

# Lecture 32: Hashing and Efficient Data Access

The course closes with the fastest data structure covered yet. A BST (Unit 5) gets
search down to O(log n); **hashing** gets it down to O(1) *on average* — by trading away
ordering entirely and computing, directly, roughly where a value should live.

## In This Lecture

- The need for O(1) data access, and the hashing concept
- Hash tables, key-value mapping, and hash functions
- What makes a hash function "good"
- Collisions, and open vs. closed hashing
- Three collision resolution strategies: separate chaining, linear probing, and double hashing
- Rehashing, and real applications of hashing

## Need for Efficient Data Access

A BST answers "is this value present?" in O(log n) by comparing against a handful of
nodes on the way down. Hashing asks a bolder question: what if you could compute
*exactly* where a value belongs, with simple arithmetic, and skip the comparisons
entirely? That's the idea behind every hash table, dictionary, and cache-lookup you've
ever used.

## Hashing Concept and the Hash Table

A **hash table** stores **key-value pairs**, using a **hash function** to convert a key
directly into an array index — the same array-indexing O(1) access from Lecture 4, now
applied to arbitrary keys (strings, not just integers).

```mermaid
flowchart LR
    K["Key: \"apple\""] --> H["Hash Function"]
    H --> I["Index: 5"]
    I --> T["table[5] = (\"apple\", value)"]
```

## Hash Function

A **hash function** takes a key and returns an integer index within the table's bounds. A
simple one for strings: sum the ASCII value of every character, then take the result
modulo the table's size.

```cpp title="hash_table_chaining.cpp"
#include <iostream>
#include <vector>
#include <list>
#include <string>
using namespace std;

int hashFunction(const string& key, int tableSize) {
    int sum = 0;
    for (char c : key) sum += c;
    return sum % tableSize;
}

int main() {
    int tableSize = 7;
    for (string key : {"apple", "cherry", "fig", "grape"}) {
        cout << "hash(\"" << key << "\") = " << hashFunction(key, tableSize) << endl;
    }
    return 0;
}
```

```text
$ g++ -std=c++17 -o hash_demo hash_table_chaining.cpp
$ ./hash_demo
hash("apple") = 5
hash("cherry") = 2
hash("fig") = 2
hash("grape") = 2
```

## Properties of a Good Hash Function

- **Deterministic** — the same key must always produce the same index.
- **Fast to compute** — the whole point is speed; a slow hash function defeats the purpose.
- **Uniform distribution** — keys should spread evenly across the table, not cluster in a
  few indices. Notice above: `"cherry"`, `"fig"`, and `"grape"` all hashed to index 2 —
  a **collision**, and exactly what a good hash function tries to minimize (this simple
  sum-of-characters function is easy to understand but poor in practice for exactly this
  reason — real hash functions mix bits far more thoroughly).

## Collisions

A **collision** happens when two different keys hash to the same index — as just shown,
this is common even with reasonable data, not a rare edge case, and every real hash table
implementation needs a strategy to handle it.

## Open Hashing: Separate Chaining

**Open hashing** (also called **separate chaining**) handles a collision by storing a
**list** at each index — every key that hashes there just gets appended to that index's
list.

```cpp title="hash_table_chaining_full.cpp"
#include <iostream>
#include <vector>
#include <list>
#include <string>
using namespace std;

class HashTableChaining {
private:
    int tableSize;
    vector<list<pair<string, int>>> table;

    int hashFunction(const string& key) const {
        int sum = 0;
        for (char c : key) sum += c;
        return sum % tableSize;
    }

public:
    HashTableChaining(int size) : tableSize(size), table(size) {}

    void insert(const string& key, int value) {
        int index = hashFunction(key);
        table[index].push_back({key, value});
    }

    bool search(const string& key, int& valueOut) const {
        int index = hashFunction(key);
        for (auto& pair : table[index]) {
            if (pair.first == key) { valueOut = pair.second; return true; }
        }
        return false;
    }

    void printBucket(const string& key) const {
        int index = hashFunction(key);
        cout << "Bucket " << index << ": ";
        for (auto& pair : table[index]) {
            cout << "(" << pair.first << ", " << pair.second << ") ";
        }
        cout << endl;
    }
};

int main() {
    HashTableChaining table(7);
    table.insert("apple", 100);
    table.insert("cherry", 75);   // hashes to index 2
    table.insert("fig", 40);       // collides with "cherry" (also index 2)
    table.insert("grape", 60);     // also collides (also index 2)

    table.printBucket("cherry");

    int value;
    if (table.search("fig", value)) {
        cout << "Found fig: " << value << " (correctly found despite the collision)" << endl;
    }

    return 0;
}
```

```text
$ g++ -std=c++17 -o hash_table_chaining_full hash_table_chaining_full.cpp
$ ./hash_table_chaining_full
Bucket 2: (cherry, 75) (fig, 40) (grape, 60) 
Found fig: 40 (correctly found despite the collision)
```

All three colliding keys live together in the same bucket's list — `search` still finds
`"fig"` correctly, it just has to check each entry in that one bucket instead of going
straight there in one step.

## Closed Hashing: Linear Probing

**Closed hashing** keeps every entry directly in the table array itself — on a collision,
it looks for the **next available slot** instead of using a separate list.
**Linear probing** is the simplest strategy: check `index + 1`, then `index + 2`, and so
on (wrapping around, like Lecture 14's circular queue), until an empty slot is found.

```cpp title="hash_table_probing.cpp"
#include <iostream>
#include <vector>
#include <string>
using namespace std;

class HashTableProbing {
private:
    int tableSize;
    vector<string> keys;
    vector<int> values;
    vector<bool> occupied;

    int hashFunction(const string& key) const {
        int sum = 0;
        for (char c : key) sum += c;
        return sum % tableSize;
    }

public:
    HashTableProbing(int size) : tableSize(size), keys(size), values(size), occupied(size, false) {}

    void insert(const string& key, int value) {
        int index = hashFunction(key);
        int originalIndex = index;
        int probes = 0;
        while (occupied[index]) {
            index = (index + 1) % tableSize;   // linear probing: try the next slot
            probes++;
        }
        keys[index] = key;
        values[index] = value;
        occupied[index] = true;
        cout << "Inserted \"" << key << "\" at index " << index
             << " (home index " << originalIndex << ", " << probes << " probe(s))" << endl;
    }
};

int main() {
    HashTableProbing table(7);
    table.insert("apple", 100);
    table.insert("cherry", 75);
    table.insert("fig", 40);
    table.insert("grape", 60);

    return 0;
}
```

```text
$ g++ -std=c++17 -o hash_table_probing hash_table_probing.cpp
$ ./hash_table_probing
Inserted "apple" at index 5 (home index 5, 0 probe(s))
Inserted "cherry" at index 2 (home index 2, 0 probe(s))
Inserted "fig" at index 3 (home index 2, 1 probe(s))
Inserted "grape" at index 4 (home index 2, 2 probe(s))
```

`"cherry"`, `"fig"`, and `"grape"` all "want" index 2, exactly like the chaining example
— but instead of a list, linear probing physically walks forward through the array until
it finds room, landing `"fig"` at 3 and `"grape"` at 4.

### Quadratic Probing and Double Hashing

Linear probing has a known weakness called **clustering**: once several keys land near
each other, new collisions become *more* likely to land in that same crowded region,
making the clustering worse over time. Two alternatives address this:

- **Quadratic probing** — checks `index + 1²`, `index + 2²`, `index + 3²`, ... instead of
  `index + 1, + 2, + 3`, spreading probes out faster to avoid clustering.
- **Double hashing** — uses a *second* hash function to compute the probe step size
  itself (`index + 1*step`, `index + 2*step`, ...), so different keys that collide at the
  same home index scatter in different probe patterns instead of all following the same
  path.

## Rehashing

As a hash table fills up, collisions become more frequent and performance degrades
toward O(n). **Rehashing** creates a new, larger table (commonly double the size) and
re-inserts every existing key using the new table's hash function — the same idea as a
`std::vector` growing past its capacity, applied to a hash table's **load factor**
(entries ÷ table size) instead of raw element count.

## Applications of Hashing

- **Dictionaries and language maps** — Python's `dict`, JavaScript's objects, and C++'s
  `unordered_map` (used back in Lecture 24's Huffman coding) are all hash tables.
- **Caching** — a web browser's cache, a CPU's memory cache, and a CDN's edge cache all
  use hashing to check "do I already have this?" in O(1).
- **Password storage** — passwords are hashed (with a one-way, cryptographic hash
  function) so the original password is never stored in plain text.
- **Duplicate detection** — checking whether a value has been seen before, in O(1) per
  check instead of an O(n) linear scan or an O(log n) BST lookup.

## Try It Yourself

1. Compile and run `hash_table_probing.cpp`, then add a fifth key, `"mango"` (home index
   5, the same as `"apple"`), and predict how many probes it will need before running it,
   based on which indices are already occupied.
2. Implement `search` for `HashTableProbing` (mirroring `HashTableChaining::search`, but
   walking forward through occupied slots via the same linear-probing pattern
   `insert` uses, stopping either when the key is found or an **empty** slot is reached —
   an empty slot proves the key was never inserted, since insertion never leaves gaps
   before a key's actual position).

## Key Takeaways

- **Hashing** computes an index directly from a key, achieving O(1) average-case access —
  the fastest data access this course covers, at the cost of giving up any ordering.
- A **collision** — two keys hashing to the same index — is common, not rare, and every
  real hash table needs a resolution strategy.
- **Open hashing (separate chaining)** stores a list per index; **closed hashing
  (probing)** keeps every entry in the array itself, searching forward for empty slots.
- **Linear probing** is simple but clusters; **quadratic probing** and **double hashing**
  spread collisions out more evenly.
- **Rehashing** grows the table and re-inserts everything once the load factor gets too
  high, keeping average-case O(1) performance intact as data grows.

## Where to Go From Here

Congratulations — you've reached the end of Algorithms and Data Structures (CSC211).
You started this semester with a single question — "how should data be organized?" —
and by now you've built, by hand and in real, compiled C++, every major answer to it:
linear structures that trade off access speed against insertion cost, trees that turn
search into a logarithmic walk (and, with AVL, *guarantee* it stays that way), graphs
that model any network of relationships at all, and finally hashing, which sidesteps the
whole search problem with direct computation.

None of this stops being relevant once the course ends. Every data structure here
reappears constantly in the courses ahead: databases index their tables with balanced
trees and hash tables; operating systems schedule processes with queues and priority
queues; compilers parse code with trees and stacks; and every serious job interview in
this field will, at some point, ask you to reason about exactly the trade-offs this
course spent a semester building your intuition for. The goal was never to memorize these
implementations — it was to build the habit of asking, for any new problem: *what does
this data actually need to do quickly, and which structure gives me that?* That question
will serve you for the rest of your career.
