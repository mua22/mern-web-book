---
title: "Lecture 30: Sorting: Elementary Algorithms"
tags:
  - CSC211
  - Sorting
  - Algorithms
---

# Lecture 30: Sorting: Elementary Algorithms

Binary search's O(log n) speed had one precondition: the data must already be sorted.
This lecture covers the three classic **elementary** sorting algorithms — simple to
understand and implement, each O(n²) in the worst case, and the natural starting point
before Lecture 31's faster, more sophisticated alternatives.

## In This Lecture

- The sorting problem, and what characterizes a sorting algorithm
- Bubble sort, selection sort, and insertion sort
- In-place sorting
- A direct comparison of all three

## The Sorting Problem

**Sorting** rearranges a collection's elements into a defined order (ascending or
descending). Every sorting algorithm in this course works on the same underlying
operation set: **comparing** two elements, and **swapping** (or shifting) them.

## Characteristics of Sorting Algorithms

- **Time complexity** — how the number of comparisons/swaps grows with `n`.
- **Space complexity** — how much *extra* memory beyond the input array is needed.
- **Stability** — do two equal elements keep their original relative order after sorting?
  (Important when sorting records by one field but wanting ties broken by original order.)
- **In-place** — does it sort within the original array, or does it need a separate copy?

## Bubble Sort

**Bubble sort** repeatedly steps through the array, swapping adjacent elements that are
in the wrong order — each full pass "bubbles" the largest remaining unsorted value to its
correct position at the end.

```cpp title="elementary_sorts.cpp"
#include <iostream>
#include <vector>
using namespace std;

void printArray(const vector<int>& arr) {
    for (int v : arr) cout << v << " ";
    cout << endl;
}

void bubbleSort(vector<int> arr) {
    int n = arr.size();
    for (int pass = 0; pass < n - 1; pass++) {
        bool swapped = false;
        for (int i = 0; i < n - 1 - pass; i++) {
            if (arr[i] > arr[i + 1]) {
                swap(arr[i], arr[i + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;   // already sorted -- no need for further passes
    }
    cout << "Bubble sort:    "; printArray(arr);
}

void selectionSort(vector<int> arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIndex = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIndex]) minIndex = j;
        }
        swap(arr[i], arr[minIndex]);
    }
    cout << "Selection sort: "; printArray(arr);
}

void insertionSort(vector<int> arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];   // shift larger elements one position right
            j--;
        }
        arr[j + 1] = key;   // insert key into its correct position
    }
    cout << "Insertion sort: "; printArray(arr);
}

int main() {
    vector<int> data = {64, 25, 12, 22, 11, 90, 5};

    cout << "Original:       "; printArray(data);
    bubbleSort(data);
    selectionSort(data);
    insertionSort(data);

    return 0;
}
```

```text
$ g++ -std=c++17 -o elementary_sorts elementary_sorts.cpp
$ ./elementary_sorts
Original:       64 25 12 22 11 90 5 
Bubble sort:    5 11 12 22 25 64 90 
Selection sort: 5 11 12 22 25 64 90 
Insertion sort: 5 11 12 22 25 64 90 
```

All three reach the exact same sorted result — they differ only in *how* they get there,
which is what the rest of this lecture unpacks.

### Bubble Sort, in Detail

Bubble sort's `swapped` flag is an important optimization: if a full pass makes zero
swaps, the array is already sorted, and the algorithm can stop early instead of running
all `n - 1` passes regardless. This gives bubble sort a **best case of O(n)** (already
sorted input, detected on the very first pass) even though its worst case is O(n²).

### Selection Sort, in Detail

Selection sort takes the opposite approach: instead of swapping adjacent
out-of-order pairs, it finds the **minimum** of the remaining unsorted portion and swaps
it directly into place — exactly one swap per outer-loop iteration, `n - 1` swaps total,
regardless of how sorted the input already was. This makes selection sort's best,
average, and worst case all **O(n²)** — it never benefits from partially-sorted input the
way bubble and insertion sort can.

### Insertion Sort, in Detail

Insertion sort builds the sorted portion one element at a time, from the left: each new
element is shifted backward through the already-sorted portion until it reaches its
correct position — exactly how most people sort a hand of playing cards. Like bubble
sort, insertion sort has a **best case of O(n)** on already-sorted input (the inner `while`
loop never executes at all).

## In-Place Sorting

All three algorithms shown are **in-place**: they rearrange the array's own elements
using only a small, constant amount of extra memory (a few loop variables), never
allocating a second array the size of the input. This gives all three **O(1) extra space
complexity** — a real advantage they share, despite their O(n²) time complexity.

## Comparison of Elementary Sorting Algorithms

| | Best case | Average case | Worst case | Space | Stable? |
|---|---|---|---|---|---|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | No (a naive implementation can swap equal elements out of order) |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | Yes |

Despite sharing the same worst-case complexity, **insertion sort is generally preferred**
among the three in practice: it has the same best-case advantage as bubble sort, but does
noticeably less work on average — moving elements directly to their position instead of
bubbling one step at a time — which is why it's often the algorithm real standard
libraries fall back to for very small sub-arrays inside a faster algorithm (Lecture 31).

## Try It Yourself

1. Compile and run `elementary_sorts.cpp` with an **already-sorted** input array (e.g.,
   `{1, 2, 3, 4, 5}`), and add a comparison counter to `bubbleSort` and `selectionSort`.
   Confirm bubble sort's count is dramatically lower than selection sort's on this input —
   direct proof of the best-case difference described above.
2. Modify `insertionSort` to sort in **descending** order instead of ascending, by
   flipping exactly one comparison operator. Confirm your change with the same test data.

## Key Takeaways

- **Bubble sort** repeatedly swaps adjacent out-of-order pairs; its early-exit `swapped`
  flag gives it a best case of O(n) on nearly-sorted input.
- **Selection sort** repeatedly finds the minimum of the unsorted portion and swaps it
  into place — always O(n²), with no benefit from partially-sorted input.
- **Insertion sort** builds a sorted portion incrementally, shifting elements backward —
  also O(n) best case, and generally the most practically efficient of the three.
- All three are **O(1) extra space** (in-place), but all three are **O(n²) in the worst
  case** — Lecture 31 covers algorithms that do meaningfully better.
