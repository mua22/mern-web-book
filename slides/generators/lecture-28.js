const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-28";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 28: Hooks and State Management",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-28-Hooks-and-State-Management.pptx",
  slides: [
    { type: "title", lectureNo: 28, heading: "Hooks and\nState Management",
      sub: "Giving function components memory and side effects — and sharing that state across a whole app." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "The rules of hooks, and useState for local component state",
      "useEffect for side effects: the dependency array and cleanup functions",
      "useRef, useMemo, and useCallback for references and performance",
      "Lifting state up, the Context API and useContext, and custom hooks",
      "A conceptual overview of external state managers: Redux and Zustand",
    ] },

    { type: "bullets", kicker: "Hooks", heading: "The Rules of Hooks", items: [
      "Hooks are special functions that let a function component \"hook into\" React features like local memory and side effects",
      "Every built-in hook starts with use (useState, useEffect...) — custom hooks follow the same convention",
      "Rule 1: only call hooks at the top level — never in a loop, condition, or nested function",
      "Rule 2: only call hooks from React function components or other custom hooks",
    ] },

    { type: "code", kicker: "Hooks", heading: "Conditional Hook Calls Break the Rules",
      code: '// Wrong: hook called conditionally\nfunction Profile({ isLoggedIn }) {\n  if (isLoggedIn) {\n    const [name, setName] = useState("");\n  }\n}\n\n// Correct: always called\nfunction Profile({ isLoggedIn }) {\n  const [name, setName] = useState("");\n  if (!isLoggedIn) return null;\n}' },

    { type: "callout", kicker: "Hooks", heading: "Why This Rule Exists", kind: "warning", h: 2.0,
      text: "React tracks each hook call by the ORDER it was called in during a render, not by name. If a hook is skipped conditionally, the order shifts, and React can attach the wrong stored value to the wrong hook next render. Calling hooks unconditionally keeps that order stable every time." },

    { type: "bullets", kicker: "useState", heading: "Local Component State", items: [
      "State is data a component tracks over time that can change in response to user actions, triggering a re-render",
      "useState(initialValue) returns an array of exactly two elements: the current value and a setter function",
      "Destructured by convention as [thing, setThing]",
    ] },

    { type: "codeImageSide", kicker: "useState", heading: "A Counter",
      code: 'function Counter() {\n  const [count, setCount] =\n    useState(0);\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={\n        () => setCount(count + 1)\n      }>\n        +1\n      </button>\n    </div>\n  );\n}',
      img: `${IMG}/counter-demo.png` },

    { type: "callout", kicker: "useState", heading: "Never Mutate State Directly", kind: "warning", h: 1.9,
      text: "Writing count++ or items.push(newItem) will NOT trigger a re-render — React only detects a change when you call the setter with a new value. Always create a new value instead of mutating the old one." },

    { type: "code", kicker: "useState", heading: "Mutating vs. Replacing an Array",
      code: '// Wrong: mutates the existing array\nfunction addItem(item) {\n  items.push(item);\n  setItems(items);\n}\n\n// Correct: creates a new array\nfunction addItem(item) {\n  setItems([...items, item]);\n}',
      note: "When new state depends on old state inside a handler, pass a function to the setter instead: setCount((prev) => prev + 1)." },

    { type: "bullets", kicker: "useEffect", heading: "useEffect: Side Effects", items: [
      "A side effect reaches OUTSIDE of simply computing and returning JSX: fetching data, subscribing to a browser event, a timer, direct DOM manipulation",
      "useEffect(effectFn, dependencyArray) runs this code in response to rendering",
    ] },

    { type: "code", kicker: "useEffect", heading: "A Clock, With Cleanup",
      code: 'function Clock() {\n  const [time, setTime] =\n    useState(new Date());\n  useEffect(() => {\n    const id = setInterval(\n      () => setTime(new Date()),\n      1000\n    );\n    return () => clearInterval(id);\n  }, []);\n  return (\n    <p>\n      Current time:\n      {time.toLocaleTimeString()}\n    </p>\n  );\n}' },

    { type: "table", kicker: "useEffect", heading: "The Dependency Array Controls WHEN",
      header: ["Dependency Array", "Effect Runs"], colW: [4.2, 7.7], leftCol: 0, rowH: 0.85,
      rows: [
        ["Omitted entirely", "After every render"],
        ["[] (empty array)", "Only once, right after the first render"],
        ["[a, b]", "After the first render, and again whenever a or b changes"],
      ] },

    { type: "callout", kicker: "useEffect", heading: "Include Everything the Effect Uses", kind: "warning", h: 2.0,
      text: "Any prop or state variable the effect reads should generally be listed in the dependency array. Leaving one out is a common source of bugs where the effect keeps using a stale, outdated value — most ESLint React setups warn about this." },

    { type: "bullets", kicker: "Cleanup Functions", heading: "What Cleanup Functions Do", items: [
      "If the function passed to useEffect RETURNS another function, React treats it as a cleanup function",
      "React calls it right before running the effect again, and when the component unmounts",
      "Essential for anything that would otherwise leak: timers, subscriptions, event listeners",
    ] },

    { type: "code", kicker: "Cleanup Functions", heading: "Removing an Event Listener",
      code: 'useEffect(() => {\n  function handleResize() {\n    console.log("window resized");\n  }\n  window.addEventListener(\n    "resize", handleResize\n  );\n  return () => window.removeEventListener(\n    "resize", handleResize\n  );\n}, []);' },

    { type: "diagram", kicker: "Cleanup Functions", heading: "The Mount / Effect / Cleanup Lifecycle",
      nodes: [
        { x: 0.9, y: 2.3, w: 2.5, h: 0.65, text: "Mounted\n(first render)", fill: "2B2B7A", fontSize: 12 },
        { x: 3.8, y: 2.3, w: 2.9, h: 0.65, text: "useEffect callback\nruns", fill: "3A3A78", fontSize: 12 },
        { x: 7.1, y: 2.3, w: 2.1, h: 0.65, text: "Idle\n(waiting)", fill: "3A3A78", fontSize: 12 },
        { x: 6.7, y: 4.05, w: 2.9, h: 0.65, text: "Cleanup runs\n(deps changed)", fill: "FF8A3D", fontSize: 12 },
        { x: 9.9, y: 4.05, w: 2.3, h: 0.65, text: "Unmounted\n(cleanup runs once more)", fill: "8A3A12", fontSize: 10.5 },
      ],
      edges: [
        { x1: 3.4, y1: 2.625, x2: 3.8, y2: 2.625 },
        { x1: 6.7, y1: 2.625, x2: 7.1, y2: 2.625 },
        { x1: 8.1, y1: 2.95, x2: 8.1, y2: 4.05, label: "deps changed" },
        { x1: 6.7, y1: 4.15, x2: 5.2, y2: 2.95, label: "effect re-runs" },
        { x1: 9.2, y1: 2.95, x2: 10.9, y2: 4.05, label: "unmounts" },
      ],
      caption: "React calls cleanup before every subsequent effect run AND once more when the component unmounts — the same function handles both cases." },

    { type: "bullets", kicker: "useRef", heading: "useRef: A Value That Survives, Silently", items: [
      "Creates a mutable object that persists across renders WITHOUT causing a re-render when it changes",
      "Has one property, .current, freely readable and writable",
      "Two common uses: (1) accessing a real DOM element directly, (2) storing a mutable value that shouldn't trigger a render, like a timer ID",
    ] },

    { type: "codeImageSide", kicker: "useRef", heading: "Auto-Focusing an Input",
      code: 'function AutoFocusInput() {\n  const inputRef = useRef(null);\n\n  useEffect(() => {\n    inputRef.current.focus();\n  }, []);\n\n  return (\n    <input ref={inputRef} />\n  );\n}',
      img: `${IMG}/autofocus-input-demo.png` },

    { type: "bullets", kicker: "Memoization", heading: "useMemo and useCallback", items: [
      "Both avoid unnecessary, expensive recalculation on every render — a technique called memoization",
      "useMemo caches the RESULT of a calculation, recomputing only when a listed dependency changes",
      "useCallback does the same for FUNCTIONS — it returns the same function reference between renders unless its dependencies change",
    ] },

    { type: "code", kicker: "useMemo", heading: "Caching a Filtered List",
      code: 'function ProductList({ products, searchTerm }) {\n  const filtered = useMemo(() => {\n    return products.filter((p) =>\n      p.name.toLowerCase()\n        .includes(searchTerm.toLowerCase())\n    );\n  }, [products, searchTerm]);\n\n  return (\n    <ul>\n      {filtered.map((p) => (\n        <li key={p.id}>{p.name}</li>\n      ))}\n    </ul>\n  );\n}' },

    { type: "code", kicker: "useCallback", heading: "A Stable Function Reference",
      code: 'function ProductList({ products, onAddToCart }) {\n  const handleAdd = useCallback(\n    (id) => {\n      onAddToCart(id);\n    },\n    [onAddToCart]\n  );\n  // same reference between renders\n  // unless onAddToCart changes\n}',
      note: "Matters mainly when passing a callback to a child optimized with React.memo — a brand-new reference every render would defeat that optimization." },

    { type: "callout", kicker: "Memoization", heading: "Don't Over-Optimize", kind: "tip", h: 1.9,
      text: "useMemo and useCallback are optimization tools, not something you need on every value or function — they add a small overhead themselves. Reach for them for a genuinely expensive calculation or a measured performance problem, not by default." },

    { type: "bullets", kicker: "Lifting State Up", heading: "Sharing State Between Siblings", items: [
      "Moving a piece of state from a child component up to their closest common PARENT",
      "Lets multiple sibling components share and stay in sync with the same data",
      "Neither sibling owns the state itself — the shared parent does",
    ] },

    { type: "codeImageSide", kicker: "Lifting State Up", heading: "A Shared celsius Value",
      code: 'function TemperatureConverter() {\n  const [celsius, setCelsius] =\n    useState(0);\n  return (\n    <div>\n      <CelsiusInput\n        value={celsius}\n        onChange={setCelsius}\n      />\n      <FahrenheitDisplay\n        celsius={celsius}\n      />\n    </div>\n  );\n}',
      img: `${IMG}/temperature-converter-demo.png` },

    { type: "bullets", kicker: "Context API", heading: "Solving Prop Drilling", items: [
      "Lifting state up works well for a few levels; deeply nested trees make prop drilling (Lecture 27) painful",
      "The Context API lets a parent make a value available to ANY descendant, no matter how deeply nested",
      "Three steps: createContext, provide a value with <Context.Provider>, consume it anywhere below with useContext",
    ] },

    { type: "code", kicker: "Context API", heading: "Skipping Straight to the Data",
      code: 'const UserContext = createContext(null);\nfunction App() {\n  const [user] = useState({ name: "Ayesha" });\n  return (\n    <UserContext.Provider value={user}>\n      <Page />\n    </UserContext.Provider>\n  );\n}\nfunction UserBadge() {\n  const user = useContext(UserContext);\n  return <p>Logged in as {user.name}</p>;\n}',
      intro: "UserBadge reads user directly with useContext -- completely skipping Page and Sidebar, no matter how deep." },

    { type: "bullets", kicker: "Custom Hooks", heading: "Extracting Reusable Stateful Logic", items: [
      "A custom hook is a JavaScript function whose name starts with use and that calls other hooks inside it",
      "Lets you extract and reuse stateful logic between components, the same way a regular function reuses plain logic",
    ] },

    { type: "code", kicker: "Custom Hooks", heading: "useWindowWidth",
      code: 'function useWindowWidth() {\n  const [width, setWidth] =\n    useState(window.innerWidth);\n  useEffect(() => {\n    function onResize() {\n      setWidth(window.innerWidth);\n    }\n    window.addEventListener("resize", onResize);\n    return () =>\n      window.removeEventListener("resize", onResize);\n  }, []);\n  return width;\n}\nfunction ResponsiveMessage() {\n  const width = useWindowWidth();\n  return <p>{width < 600 ? "Mobile" : "Desktop"}</p>;\n}' },

    { type: "table", kicker: "External State Managers", heading: "Redux vs. Zustand, Conceptually",
      header: ["", "Redux", "Zustand"], colW: [2.6, 4.7, 4.6], leftCol: 0, rowH: 0.85,
      rows: [
        ["Store", "One single global store object", "A small, hook-based store"],
        ["State changes via", "Actions processed by reducers", "Direct function calls"],
        ["Boilerplate", "More — powerful and predictable", "Very little"],
        ["Setup", "Wraps the app in a <Provider>", "No Provider needed — used as a hook"],
      ] },

    { type: "callout", kicker: "External State Managers", heading: "You Do Not Need These Yet", kind: "note", h: 2.0,
      text: "This course does not require Redux or Zustand -- useState, lifting state up, and the Context API are enough for everything you build here. Still worth knowing these names, since you will very likely meet them in real codebases and the advanced course." },

    { type: "closing", heading: "Lecture 28 in Six Points", items: [
      "Hooks must be called unconditionally, at the top level of a function component or custom hook — never in loops or conditions.",
      "useState gives a component memory across renders; always update state through its setter, never by mutating the previous value.",
      "useEffect runs side effects after rendering; its dependency array controls timing, and a returned cleanup function prevents leaks.",
      "useRef persists a value or DOM reference without triggering a render; useMemo/useCallback memoize values and functions.",
      "Lifting state up shares state via a common parent; the Context API with useContext avoids deep prop drilling.",
      "Custom hooks (functions starting with use) let you extract and reuse stateful logic; Redux and Zustand centralize state at scale.",
    ] },
  ],
});
