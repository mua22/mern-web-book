---
title: "Lecture 28: Minimum Spanning Trees"
tags:
  - CSC211
  - Graphs
  - MST
  - Data Structures
---

# Lecture 28: Minimum Spanning Trees

Dijkstra's algorithm found the cheapest way to reach *every* vertex from *one* starting
point. This lecture asks a related but different question: what's the cheapest possible
set of edges that connects *all* vertices to each other, period — no designated start,
just "keep everything connected as cheaply as possible"? That's a **Minimum Spanning
Tree**, and there are two classic, very different ways to find one.

## In This Lecture

- The spanning tree concept, and what makes one "minimum"
- Prim's algorithm — grow one connected tree, greedily
- Kruskal's algorithm — sort all edges, greedily avoid cycles
- Step-by-step traces of both algorithms, side by side, on the same graph
- A direct comparison, and when each is the better fit

## Spanning Tree and Minimum Spanning Tree

A **spanning tree** of a connected graph is a subset of its edges that connects every
vertex, contains no cycles, and — for a graph with `V` vertices — uses exactly `V - 1`
edges (echoing Lecture 16's binary tree edge-count fact). A **Minimum Spanning Tree
(MST)** is the spanning tree whose edges' total weight is the smallest possible, among
every valid spanning tree of that graph.

```mermaid
flowchart LR
    A((0)) -->|2| B((1))
    A -->|3| C((2))
    B -->|1| C
    B -->|4| D((3))
    C -->|5| D
```

This graph's MST uses edges `0-1` (2), `1-2` (1), and `1-3` (4) — total weight 7,
connecting all four vertices with no cycle, and no cheaper combination exists.

## Prim's Algorithm

**Prim's algorithm** grows a single tree, one vertex at a time: start from any vertex,
and repeatedly add the *cheapest edge* that connects the growing tree to a vertex not yet
in it — structurally almost identical to Dijkstra's algorithm (Lecture 27), just picking
by edge weight instead of cumulative distance.

```cpp title="prims_algorithm.cpp"
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

class Graph {
private:
    int numVertices;
    vector<vector<pair<int, int>>> adjList;   // (neighbor, weight)

public:
    Graph(int v) : numVertices(v), adjList(v) {}

    void addEdge(int u, int v, int weight) {
        adjList[u].push_back({v, weight});
        adjList[v].push_back({u, weight});
    }

    int primMST() const {
        vector<bool> inMST(numVertices, false);
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
        pq.push({0, 0});   // (weight, vertex) -- start from vertex 0, cost 0 to add it
        int totalWeight = 0;

        while (!pq.empty()) {
            auto [weight, current] = pq.top();
            pq.pop();

            if (inMST[current]) continue;   // already added via a cheaper edge
            inMST[current] = true;
            totalWeight += weight;
            cout << "  Added vertex " << current << " (edge weight " << weight << ")" << endl;

            for (auto& [neighbor, edgeWeight] : adjList[current]) {
                if (!inMST[neighbor]) {
                    pq.push({edgeWeight, neighbor});
                }
            }
        }
        return totalWeight;
    }
};

int main() {
    Graph graph(4);
    graph.addEdge(0, 1, 2);
    graph.addEdge(0, 2, 3);
    graph.addEdge(1, 2, 1);
    graph.addEdge(1, 3, 4);
    graph.addEdge(2, 3, 5);

    cout << "Prim's algorithm, starting from vertex 0:" << endl;
    int totalWeight = graph.primMST();
    cout << "Total MST weight: " << totalWeight << endl;

    return 0;
}
```

```text
$ g++ -std=c++17 -o prims_algorithm prims_algorithm.cpp
$ ./prims_algorithm
Prim's algorithm, starting from vertex 0:
  Added vertex 0 (edge weight 0)
  Added vertex 1 (edge weight 2)
  Added vertex 2 (edge weight 1)
  Added vertex 3 (edge weight 4)
Total MST weight: 7
```

### Tracing Prim's Algorithm Step by Step

Adding a running total alongside each step turns "the final answer is 7" into a visible
accumulation — watch the total climb one edge at a time as the tree grows outward from
vertex 0.

```cpp title="prims_trace.cpp"
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

class Graph {
private:
    int numVertices;
    vector<vector<pair<int, int>>> adjList;

public:
    Graph(int v) : numVertices(v), adjList(v) {}

    void addEdge(int u, int v, int weight) {
        adjList[u].push_back({v, weight});
        adjList[v].push_back({u, weight});
    }

    int primMSTTrace() const {
        vector<bool> inMST(numVertices, false);
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
        pq.push({0, 0});
        int totalWeight = 0;
        int step = 1;

        while (!pq.empty()) {
            auto [weight, current] = pq.top();
            pq.pop();

            if (inMST[current]) continue;
            inMST[current] = true;
            totalWeight += weight;
            cout << "  Step " << step << ": add vertex " << current
                 << " (edge weight " << weight << ") -- running total: " << totalWeight << endl;
            step++;

            for (auto& [neighbor, edgeWeight] : adjList[current]) {
                if (!inMST[neighbor]) {
                    pq.push({edgeWeight, neighbor});
                }
            }
        }
        return totalWeight;
    }
};

int main() {
    Graph graph(4);
    graph.addEdge(0, 1, 2);
    graph.addEdge(0, 2, 3);
    graph.addEdge(1, 2, 1);
    graph.addEdge(1, 3, 4);
    graph.addEdge(2, 3, 5);

    cout << "Prim's algorithm trace, starting from vertex 0:" << endl;
    int totalWeight = graph.primMSTTrace();
    cout << "Final MST weight: " << totalWeight << endl;

    return 0;
}
```

```text
$ g++ -std=c++17 -o prims_trace prims_trace.cpp
$ ./prims_trace
Prim's algorithm trace, starting from vertex 0:
  Step 1: add vertex 0 (edge weight 0) -- running total: 0
  Step 2: add vertex 1 (edge weight 2) -- running total: 2
  Step 3: add vertex 2 (edge weight 1) -- running total: 3
  Step 4: add vertex 3 (edge weight 4) -- running total: 7
Final MST weight: 7
```

```mermaid
flowchart LR
    A((0)) -->|"② weight 2"| B((1))
    A -.->|"3 (unused)"| C((2))
    B -->|"③ weight 1"| C
    B -->|"④ weight 4"| D((3))
    C -.->|"5 (unused)"| D
    linkStyle 0 stroke:#2e8b57,stroke-width:3px
    linkStyle 2 stroke:#2e8b57,stroke-width:3px
    linkStyle 3 stroke:#2e8b57,stroke-width:3px
    linkStyle 1 stroke:#999,stroke-dasharray: 4 4
    linkStyle 4 stroke:#999,stroke-dasharray: 4 4
```

The solid, numbered edges are the three edges Prim's algorithm actually chose — vertex `0`
is the implicit starting point (step ①), so the tree's first *edge* is step ②. The dashed
gray edges (`0-2` weight 3, and `2-3` weight 5) were genuinely considered — they were
sitting in the priority queue — but never won, because a cheaper edge into the same vertex
was always tried first: the queue offered `0-2` (weight 3) as a way to reach vertex 2, but
by the time vertex 2 needed to be reached, the cheaper `1-2` edge (weight 1) was already
available and got popped first.

## Kruskal's Algorithm

**Kruskal's algorithm** takes a completely different approach: sort *every* edge in the
graph by weight, then walk through them from cheapest to most expensive, adding each edge
**unless it would create a cycle**. Detecting "would this create a cycle?" efficiently
needs a new helper structure: a **Disjoint Set (Union-Find)**, which tracks which
vertices are already connected to each other.

```cpp title="kruskals_algorithm.cpp"
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

struct Edge {
    int u, v, weight;
};

class DisjointSet {
private:
    vector<int> parent;

public:
    DisjointSet(int n) : parent(n) {
        for (int i = 0; i < n; i++) parent[i] = i;   // each vertex starts as its own group
    }

    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);   // path compression
        return parent[x];
    }

    // Returns true if u and v were in different groups (and merges them);
    // false if they were already in the same group (adding this edge would cycle).
    bool unite(int u, int v) {
        int rootU = find(u);
        int rootV = find(v);
        if (rootU == rootV) return false;
        parent[rootU] = rootV;
        return true;
    }
};

int kruskalMST(int numVertices, vector<Edge> edges) {
    sort(edges.begin(), edges.end(), [](const Edge& a, const Edge& b) {
        return a.weight < b.weight;
    });

    DisjointSet ds(numVertices);
    int totalWeight = 0;

    for (const Edge& edge : edges) {
        if (ds.unite(edge.u, edge.v)) {
            cout << "  Added edge " << edge.u << "-" << edge.v
                 << " (weight " << edge.weight << ")" << endl;
            totalWeight += edge.weight;
        }
    }
    return totalWeight;
}

int main() {
    vector<Edge> edges = {
        {0, 1, 2}, {0, 2, 3}, {1, 2, 1}, {1, 3, 4}, {2, 3, 5}
    };

    cout << "Kruskal's algorithm, edges sorted by weight:" << endl;
    int totalWeight = kruskalMST(4, edges);
    cout << "Total MST weight: " << totalWeight << endl;

    return 0;
}
```

```text
$ g++ -std=c++17 -o kruskals_algorithm kruskals_algorithm.cpp
$ ./kruskals_algorithm
Kruskal's algorithm, edges sorted by weight:
  Added edge 1-2 (weight 1)
  Added edge 0-1 (weight 2)
  Added edge 1-3 (weight 4)
Total MST weight: 7
```

### Tracing Kruskal's Algorithm Step by Step

Kruskal's algorithm examines *every* edge, in sorted order, whether or not it ends up
used — printing the skipped edges (and *why* they're skipped) alongside the added ones
makes the Disjoint Set's cycle-rejection visible, not just implied.

```cpp title="kruskal_trace.cpp"
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

struct Edge {
    int u, v, weight;
};

class DisjointSet {
private:
    vector<int> parent;

public:
    DisjointSet(int n) : parent(n) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }

    bool unite(int u, int v) {
        int rootU = find(u);
        int rootV = find(v);
        if (rootU == rootV) return false;
        parent[rootU] = rootV;
        return true;
    }
};

int kruskalMSTTrace(int numVertices, vector<Edge> edges) {
    sort(edges.begin(), edges.end(), [](const Edge& a, const Edge& b) {
        return a.weight < b.weight;
    });

    DisjointSet ds(numVertices);
    int totalWeight = 0;
    int step = 1;

    for (const Edge& edge : edges) {
        if (ds.unite(edge.u, edge.v)) {
            totalWeight += edge.weight;
            cout << "  Step " << step << ": add edge " << edge.u << "-" << edge.v
                 << " (weight " << edge.weight << ") -- running total: " << totalWeight << endl;
            step++;
        } else {
            cout << "  Skip edge " << edge.u << "-" << edge.v
                 << " (weight " << edge.weight << ") -- would create a cycle" << endl;
        }
    }
    return totalWeight;
}

int main() {
    vector<Edge> edges = {
        {0, 1, 2}, {0, 2, 3}, {1, 2, 1}, {1, 3, 4}, {2, 3, 5}
    };

    cout << "Kruskal's algorithm trace, edges sorted by weight:" << endl;
    int totalWeight = kruskalMSTTrace(4, edges);
    cout << "Final MST weight: " << totalWeight << endl;

    return 0;
}
```

```text
$ g++ -std=c++17 -o kruskal_trace kruskal_trace.cpp
$ ./kruskal_trace
Kruskal's algorithm trace, edges sorted by weight:
  Step 1: add edge 1-2 (weight 1) -- running total: 1
  Step 2: add edge 0-1 (weight 2) -- running total: 3
  Skip edge 0-2 (weight 3) -- would create a cycle
  Step 3: add edge 1-3 (weight 4) -- running total: 7
  Skip edge 2-3 (weight 5) -- would create a cycle
Final MST weight: 7
```

```mermaid
flowchart LR
    A((0)) -->|"② weight 2"| B((1))
    A -.->|"3 (skipped -- cycle)"| C((2))
    B -->|"① weight 1"| C
    B -->|"③ weight 4"| D((3))
    C -.->|"5 (skipped -- cycle)"| D
    linkStyle 0 stroke:#2e8b57,stroke-width:3px
    linkStyle 2 stroke:#2e8b57,stroke-width:3px
    linkStyle 3 stroke:#2e8b57,stroke-width:3px
    linkStyle 1 stroke:#c0392b,stroke-dasharray: 4 4
    linkStyle 4 stroke:#c0392b,stroke-dasharray: 4 4
```

Notice this diagram's step numbers on the *solid* edges don't match Prim's diagram's step
numbers — edge `1-2` is chosen **first** here (it's the globally cheapest edge, weight 1,
picked before Kruskal's algorithm has even looked at vertex 0), where Prim's algorithm
added that exact same edge **third**, only once its growing tree had already reached
vertex 1. The two dashed red edges are rejected for the *same reason* both times —
`ds.find(0) == ds.find(2)` is already true by the time edge `0-2` is considered, because
`0` and `2` are already connected indirectly through `0-1-2` — Kruskal's algorithm doesn't
need to "see" the whole tree shape to know this; the Disjoint Set answers it in
near-constant time.

### Side by Side: Prim's and Kruskal's on the Same Graph

Placing both traces next to each other, step for step, is the most direct way to see
"different order, same total" as more than a slogan:

| Step | Prim's edge added | Prim's running total | Kruskal's edge added | Kruskal's running total |
|---|---|---|---|---|
| 1 | *(start at vertex 0)* | 0 | `1-2` (weight 1) | 1 |
| 2 | `0-1` (weight 2) | 2 | `0-1` (weight 2) | 3 |
| 3 | `1-2` (weight 1) | 3 | *(skip `0-2`, would cycle)* | 3 |
| 4 | `1-3` (weight 4) | 7 | `1-3` (weight 4) | 7 |
| 5 | | | *(skip `2-3`, would cycle)* | 7 |

Both end at **7**, using the exact same three edges (`0-1`, `1-2`, `1-3`) — but they
arrive at that set in a completely different order, and for completely different reasons:
Prim's algorithm never even considers an edge like `0-2` unless it's the cheapest way to
reach a vertex still outside the tree, while Kruskal's algorithm considers `0-2`
explicitly and rejects it only after checking the Disjoint Set. Two different algorithms,
two different decision processes, and (for this graph, which happens to have a unique
MST) the identical final edge set.

Both algorithms chose *different edges* in a *different order* — Prim's grew outward
from vertex 0, Kruskal's picked the globally cheapest edge first regardless of which
vertex it touched — but both arrived at the exact same **total weight, 7**, confirming
there's genuinely one minimum, even though the specific edge set found along the way can
differ when multiple minimum spanning trees exist.

## Comparison of Prim and Kruskal

| | Prim's Algorithm | Kruskal's Algorithm |
|---|---|---|
| Approach | Grows one tree outward, vertex by vertex | Sorts all edges, adds cheapest first if no cycle |
| Data structure | Min-heap priority queue | Sorted edge list + Disjoint Set (Union-Find) |
| Time complexity | O(E log V) with a binary heap | O(E log E) for the sort, dominating overall |
| Best for | Dense graphs (many edges relative to vertices) | Sparse graphs (relatively few edges) |

## Applications of MST

- **Network design** — laying cable, pipeline, or road connections between a set of
  locations at the lowest total cost while keeping everything connected.
- **Approximation algorithms** — MSTs are a building block for approximate solutions to
  other, harder problems (like the traveling salesman problem).
- **Cluster analysis** — removing a spanning tree's most expensive edges is a real
  technique for grouping data points into clusters.

## Try It Yourself

1. Compile and run both `prims_algorithm.cpp` and `kruskals_algorithm.cpp` on the same
   graph with one new edge added — `{0, 3, 1}` (a cheap direct edge from 0 to 3). Confirm
   both algorithms report the same new total weight, even though the specific edges
   chosen will differ from the run above.
2. In `DisjointSet::unite`, the "union" step always attaches `rootU` under `rootV` with
   no regard for which tree is bigger. Look up "union by rank" or "union by size" and
   explain in a sentence or two why arbitrarily picking which root becomes the parent can,
   over many operations, produce a taller (slower) structure than a size-aware choice
   would.
3. Compile and run `prims_trace.cpp` and `kruskal_trace.cpp` with the same `{0, 3, 1}` edge
   from exercise 1 added to both. Build your own side-by-side trace table, like the one
   above, by hand first — including which edges get skipped by Kruskal's algorithm and why
   — then confirm every row against the real output.
4. Change `prims_trace.cpp` to start from vertex `3` instead of vertex `0` (change the
   initial `pq.push({0, 0})` to `pq.push({0, 3})`, and the `inMST` bookkeeping starts from
   there instead). Confirm the edges get added in a different order, but the final total
   weight is unchanged — Prim's algorithm produces a correct MST starting from *any*
   vertex, not just vertex 0.
5. Kruskal's algorithm's `sort` step is what dominates its O(E log E) time complexity. For
   the graph in `kruskal_trace.cpp`, write out the sorted edge list by hand (there are only
   5 edges) and confirm it matches the order the trace processes them in — then explain in
   one sentence why sorting is unavoidable here even though the *rest* of the algorithm
   (the Disjoint Set operations) runs in close to O(E) total.

## Key Takeaways

- A **spanning tree** connects every vertex with exactly `V - 1` edges and no cycles; a
  **Minimum Spanning Tree** is the cheapest one possible.
- **Prim's algorithm** grows one tree outward using a min-heap — structurally close to
  Dijkstra's algorithm (Lecture 27), just optimizing edge weight instead of cumulative
  distance.
- **Kruskal's algorithm** sorts all edges and greedily adds the cheapest one that doesn't
  create a cycle, using a **Disjoint Set (Union-Find)** to detect cycles efficiently.
- The side-by-side trace table makes "different order, same total" concrete: Prim's
  algorithm added `1-2` on **step 3** (once its growing tree reached vertex 1), while
  Kruskal's algorithm added the very same edge on **step 1** (it's simply the cheapest edge
  overall) — yet both algorithms landed on the identical three-edge MST.
- Both algorithms always find the *same total weight* for a given graph — confirming a
  true minimum exists — even when the specific set of edges chosen, and the order they're
  chosen in, differs.
- This closes Unit 6. Unit 7 returns to arrays and lists with a new lens: **searching**
  and **sorting** them as efficiently as possible.
