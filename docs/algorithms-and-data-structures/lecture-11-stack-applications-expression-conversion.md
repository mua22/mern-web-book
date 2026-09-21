---
title: "Lecture 11: Stack Applications: Expression Conversion"
tags:
  - CSC211
  - Stack
  - Algorithms
---

# Lecture 11: Stack Applications: Expression Conversion

Stacks aren't just an academic exercise — they're the quiet machinery behind function
calls, undo/redo, and browser back-buttons. This lecture focuses on one of their most
elegant applications: converting the arithmetic expressions you write by hand (`infix`,
like `3 + 4 * 2`) into a form a computer can evaluate without ever worrying about operator
precedence or parentheses — `postfix`.

## In This Lecture

- Real applications of stacks: function calls, backtracking, undo/redo
- Infix, prefix, and postfix expression notation
- Operator precedence and associativity
- Converting infix to postfix using a stack
- Evaluating a postfix expression using a stack

## Applications of Stacks

- **Function call management** — every time a function calls another, the computer pushes
  a "stack frame" (its local variables and return address) onto the **call stack**; when
  the function returns, that frame is popped. This is *why* it's called a call stack.
- **Backtracking** — algorithms that try a path, and "undo" it if it fails (maze solving,
  Sudoku solvers), push each decision as they go and pop back to the last decision point
  when they hit a dead end.
- **Undo/redo** — every action is pushed onto an undo stack; undoing pops the most recent
  action and reverses it.

## Expression Notation

The same arithmetic expression can be written three different ways, depending on *where*
the operator sits relative to its operands:

| Notation | Operator position | Example (for "3 plus 4") |
|---|---|---|
| **Infix** | Between the two operands | `3 + 4` |
| **Prefix** | Before the two operands | `+ 3 4` |
| **Postfix** | After the two operands | `3 4 +` |

Infix is what humans write and read naturally — but it's genuinely hard for a computer to
evaluate directly, because it has to know about **operator precedence** (`*` before `+`)
and **parentheses** to get the right answer. Postfix needs neither: it can be evaluated
left to right with nothing but a stack, no precedence rules required at all.

## Operator Precedence and Associativity

| Operator | Precedence | Associativity |
|---|---|---|
| `^` (exponent) | Highest | Right to left |
| `*`, `/` | Middle | Left to right |
| `+`, `-` | Lowest | Left to right |

**Associativity** decides the tie-breaker when two operators of the *same* precedence sit
next to each other: `10 - 3 - 2` is evaluated left to right (`(10 - 3) - 2 = 5`), because
`-` is left-associative.

## Infix-to-Postfix Conversion

The conversion algorithm uses a stack to temporarily hold operators until it's their
turn to be placed in the output:

1. Scan the infix expression left to right, one token at a time.
2. If the token is an **operand** (a number), append it directly to the output.
3. If the token is `(`, push it onto the stack.
4. If the token is `)`, pop and output operators until a matching `(` is popped (and
   discarded).
5. If the token is an **operator**, pop and output any operators on top of the stack that
   have *greater or equal* precedence, then push the current operator.
6. After scanning the whole expression, pop and output any remaining operators.

```cpp title="infix_to_postfix.cpp"
#include <iostream>
#include <stack>
#include <string>
#include <sstream>
#include <cctype>
using namespace std;

int precedence(char op) {
    if (op == '^') return 3;
    if (op == '*' || op == '/') return 2;
    if (op == '+' || op == '-') return 1;
    return 0;   // '(' has the lowest precedence when compared this way
}

string infixToPostfix(const string& infix) {
    stack<char> operators;
    ostringstream postfix;

    for (char token : infix) {
        if (isspace(token)) continue;

        if (isdigit(token)) {
            postfix << token;
        } else if (token == '(') {
            operators.push(token);
        } else if (token == ')') {
            while (!operators.empty() && operators.top() != '(') {
                postfix << ' ' << operators.top();
                operators.pop();
            }
            operators.pop();   // discard the matching '('
        } else {
            // token is an operator: +, -, *, /, ^
            postfix << ' ';
            while (!operators.empty() && precedence(operators.top()) >= precedence(token)) {
                postfix << operators.top() << ' ';
                operators.pop();
            }
            operators.push(token);
        }
    }
    while (!operators.empty()) {
        postfix << ' ' << operators.top();
        operators.pop();
    }
    return postfix.str();
}

int main() {
    string expressions[] = {"3+4*2", "(3+4)*2", "3+4*2-1", "2^3^2"};
    for (const string& expr : expressions) {
        cout << "Infix:   " << expr << endl;
        cout << "Postfix: " << infixToPostfix(expr) << endl << endl;
    }
    return 0;
}
```

```text
$ g++ -std=c++17 -o infix_to_postfix infix_to_postfix.cpp
$ ./infix_to_postfix
Infix:   3+4*2
Postfix: 3 4 2 * +

Infix:   (3+4)*2
Postfix: 3 4 + 2 *

Infix:   3+4*2-1
Postfix: 3 4 2 * + 1 -

Infix:   2^3^2
Postfix: 2 3 ^ 2 ^
```

!!! note "Why the spacing works out correctly even for multi-digit numbers"
    Digits of the *same* number are appended back-to-back with no separator (so `1` then
    `2` become `12`, not `1 2`), while every operator branch explicitly writes a leading
    space before doing anything else. The result is that digits belonging to one number
    stay glued together, while distinct tokens always end up separated — try it yourself
    with `"12+34"` and confirm the output is `12 34 +`, not `1234+` or `1 2 3 4 +`.

## Postfix Expression Evaluation

Evaluating postfix is the payoff for doing the conversion: scan left to right, push every
**operand**, and whenever you see an **operator**, pop the top two operands, apply the
operator, and push the result back.

```cpp title="postfix_eval.cpp"
#include <iostream>
#include <stack>
#include <sstream>
using namespace std;

int evaluatePostfix(const string& postfix) {
    stack<int> values;
    istringstream tokens(postfix);
    string token;

    while (tokens >> token) {
        if (isdigit(token[0])) {
            values.push(stoi(token));
        } else {
            int b = values.top(); values.pop();
            int a = values.top(); values.pop();
            int result = 0;
            switch (token[0]) {
                case '+': result = a + b; break;
                case '-': result = a - b; break;
                case '*': result = a * b; break;
                case '/': result = a / b; break;
            }
            values.push(result);
        }
    }
    return values.top();
}

int main() {
    string postfixExpressions[] = {"3 4 2 * +", "3 4 + 2 *", "5 1 2 + 4 * + 3 -"};
    for (const string& expr : postfixExpressions) {
        cout << "Postfix: " << expr << "  =  " << evaluatePostfix(expr) << endl;
    }
    return 0;
}
```

```text
$ g++ -std=c++17 -o postfix_eval postfix_eval.cpp
$ ./postfix_eval
Postfix: 3 4 2 * +  =  11
Postfix: 3 4 + 2 *  =  14
Postfix: 5 1 2 + 4 * + 3 -  =  14
```

The last example, `5 1 2 + 4 * + 3 -`, corresponds to the infix expression
`5 + (1 + 2) * 4 - 3` — worth tracing by hand with the stack, one token at a time, to see
exactly how `(1 + 2) * 4` gets computed with no parentheses in sight at all.

## Try It Yourself

1. Trace `infix_to_postfix.cpp`'s algorithm by hand for `2^3^2`, one token at a time,
   writing down the stack's contents after each step. Confirm your trace matches the
   program's actual output, `2 3 ^ 2 ^` — and explain why right-associativity of `^` is
   what makes this particular result correct (rather than `2 2 3 ^ ^`, which would come from
   treating `^` as left-associative).
2. Extend `evaluatePostfix` to handle the `^` (exponent) operator using `pow()` from
   `<cmath>` (remember to cast the result back to `int`), and test it on `"2 3 ^"`.

## Key Takeaways

- **Prefix**, **infix**, and **postfix** are three ways to write the same expression,
  differing only in where the operator sits relative to its operands.
- **Postfix** can be evaluated left to right using only a stack, with no precedence rules
  or parentheses needed — which is exactly why compilers and calculators convert to it
  internally.
- Infix-to-postfix conversion works by holding operators on a stack until an operator of
  *lower or equal* precedence forces earlier ones to be output first.
- Postfix evaluation is the mirror operation: push operands, and whenever an operator
  appears, pop the two most recent operands, apply it, and push the result back.
