const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-27";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 27: Components, Props and Event Handling",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-27-Components-Props-and-Events.pptx",
  slides: [
    { type: "title", lectureNo: 27, heading: "Components, Props\nand Event Handling",
      sub: "How components talk to each other, what makes them re-render, and how React handles user interaction." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "Function components, composition, and reusability",
      "Props, children, default props, and the \"prop drilling\" problem",
      "What triggers a component to re-render",
      "Handling events in React and understanding synthetic events",
      "Controlled components and building forms",
    ] },

    { type: "bullets", kicker: "Function Components", heading: "What Is a Function Component?", items: [
      "A JavaScript function that returns JSX describing a piece of UI",
      "Component names start with a CAPITAL LETTER — this is how JSX tells a custom component apart from a plain HTML tag",
      "Used in JSX just like an HTML tag, but capitalized: <Button />",
    ] },

    { type: "code", kicker: "Function Components", heading: "A Function Component",
      code: 'function Button() {\n  return <button>Click me</button>;\n}\n\nfunction App() {\n  return (\n    <div>\n      <Button />\n      <Button />\n    </div>\n  );\n}' },

    { type: "bullets", kicker: "Composition", heading: "Composition: Small Pieces, Combined", items: [
      "Build complex UIs by combining smaller, focused components — not one giant component that does everything",
      "The same idea as writing small, single-purpose functions in plain JavaScript",
      "Each component should ideally do one thing well",
    ] },

    { type: "code", kicker: "Composition", heading: "Header, ProductCard, Footer -> App",
      code: 'function ProductCard({ product }) {\n  return (\n    <div className="card">\n      <h3>{product.name}</h3>\n      <p>${product.price}</p>\n    </div>\n  );\n}\nfunction App() {\n  return (\n    <div>\n      <Header />\n      <ProductCard product={{ name: "Keyboard", price: 45 }} />\n      <ProductCard product={{ name: "Mouse", price: 20 }} />\n      <Footer />\n    </div>\n  );\n}' },

    { type: "image", kicker: "Composition", heading: "App, Composed and Rendered",
      intro: "App is composed of Header, two ProductCards (each fed different data), and Footer.",
      img: `${IMG}/composition-demo.png` },

    { type: "diagram", kicker: "Composition", heading: "The Component Tree",
      nodes: [
        { x: 5.0, y: 2.4, w: 3.3, h: 0.65, text: "App", fill: "2B2B7A", fontSize: 14 },
        { x: 1.0, y: 4.0, w: 2.6, h: 0.65, text: "Header", fill: "3A3A78" },
        { x: 3.9, y: 4.0, w: 2.8, h: 0.65, text: "ProductCard\n(Keyboard)", fill: "3A3A78", fontSize: 11.5 },
        { x: 7.0, y: 4.0, w: 2.8, h: 0.65, text: "ProductCard\n(Mouse)", fill: "3A3A78", fontSize: 11.5 },
        { x: 10.1, y: 4.0, w: 2.2, h: 0.65, text: "Footer", fill: "3A3A78" },
      ],
      edges: [
        { x1: 6.0, y1: 3.05, x2: 2.3, y2: 4.0 },
        { x1: 6.3, y1: 3.05, x2: 5.3, y2: 4.0 },
        { x1: 6.7, y1: 3.05, x2: 8.4, y2: 4.0 },
        { x1: 7.0, y1: 3.05, x2: 11.2, y2: 4.0 },
      ],
      caption: "Reusability: because ProductCard takes its data as a prop instead of hard-coding it, the same component renders any product." },

    { type: "bullets", kicker: "Props", heading: "Props: Passing Data Down", items: [
      "Props (\"properties\") let a parent component pass data down to a child",
      "Set the same way you would set HTML attributes",
      "Received by the component as a single object argument",
    ] },

    { type: "code", kicker: "Props", heading: "Receiving and Destructuring Props",
      code: '// Received as an object\nfunction Greeting(props) {\n  return <p>Hello, {props.name}!</p>;\n}\n\n// Destructured -- much more common\nfunction Greeting({ name }) {\n  return <p>Hello, {name}!</p>;\n}\n\n// Usage:\n<Greeting name="Ayesha" />' },

    { type: "callout", kicker: "Props", heading: "Props Are Read-Only", kind: "warning", h: 1.9,
      text: "A component must never modify the props it receives. Props flow one way: parent to child. If a child needs to trigger a change, the parent must pass down a FUNCTION as a prop that the child calls." },

    { type: "code", kicker: "The children Prop", heading: "Wrapping Arbitrary Content",
      code: 'function Card({ children }) {\n  return <div className="card">{children}</div>;\n}\n\nfunction App() {\n  return (\n    <Card>\n      <h3>Keyboard</h3>\n      <p>$45</p>\n    </Card>\n  );\n}' },

    { type: "image", kicker: "The children Prop", heading: "children, Rendered",
      intro: "Every component automatically receives children: whatever was placed between its opening and closing JSX tags.",
      img: `${IMG}/children-card-demo.png` },

    { type: "code", kicker: "Default Props", heading: "Fallback Values via Default Parameters",
      code: 'function Avatar({ src, alt = "User avatar", size = 40 }) {\n  return <img src={src} alt={alt}\n              width={size} height={size} />;\n}\n\n// <Avatar src="/me.png" /> -- size defaults to 40',
      note: "The component still works sensibly if the caller forgets to pass a prop." },

    { type: "bullets", kicker: "Prop Drilling", heading: "The Prop Drilling Problem", items: [
      "Happens when data must travel through several layers of components that don't actually use it themselves",
      "App -> Page -> Sidebar -> UserBadge: only UserBadge actually reads user",
      "Page and Sidebar just forward it along, purely so it can reach UserBadge",
    ] },

    { type: "code", kicker: "Prop Drilling", heading: "user Passed Through Two Layers That Don't Need It",
      code: 'function Page({ user }) {\n  // Page doesn\'t use `user` itself\n  return <Sidebar user={user} />;\n}\n\nfunction Sidebar({ user }) {\n  // neither does Sidebar\n  return <UserBadge user={user} />;\n}\n\nfunction UserBadge({ user }) {\n  return <p>Logged in as {user.name}</p>;\n}' },

    { type: "callout", kicker: "Prop Drilling", heading: "The Fix Comes Next Lecture", kind: "note", h: 1.9,
      text: "Prop drilling is exactly the problem the Context API (Lecture 28) is designed to solve -- it makes data available to a whole subtree without passing it through every level manually." },

    { type: "bullets", kicker: "Re-rendering", heading: "What Triggers a Re-render?", items: [
      "Its own state changes (via a state updater function -- Lecture 28)",
      "Its parent re-renders, which by default re-renders all of its children too",
      "The props it receives change (usually because a parent's state changed)",
      "A Context value it consumes changes (Lecture 28)",
    ] },

    { type: "callout", kicker: "Re-rendering", heading: "Re-render Does Not Mean \"DOM Changed\"", kind: "note", h: 1.9,
      text: "React first computes a new Virtual DOM tree and only updates the real DOM where the diff shows an actual difference (Lecture 26). Re-rendering only means React re-ran the function to see what it should currently render." },

    { type: "bullets", kicker: "Event Handling", heading: "Events Look Familiar, With Differences", items: [
      "Plain HTML: onclick=\"handleClick()\" -- a string, called immediately by the browser",
      "JSX: event names are camelCase (onClick), and you pass a FUNCTION REFERENCE in curly braces",
      "onClick={handleClick} runs on click; onClick={handleClick()} runs immediately while rendering",
    ] },

    { type: "code", kicker: "Event Handling", heading: "A Click Handler",
      code: 'function Button() {\n  function handleClick() {\n    alert("Button clicked!");\n  }\n\n  return <button onClick={handleClick}>\n    Click me\n  </button>;\n}' },

    { type: "callout", kicker: "Event Handling", heading: "Don't Call the Function Immediately", kind: "warning", h: 1.9,
      text: "Write onClick={handleClick}, NOT onClick={handleClick()}. The second form calls handleClick immediately while rendering, and passes whatever it RETURNS as the handler -- usually undefined, which does nothing on click." },

    { type: "code", kicker: "Event Handling", heading: "Passing Arguments: Wrap in an Arrow Function",
      code: 'function ProductList({ products, onAddToCart }) {\n  return (\n    <ul>\n      {products.map((product) => (\n        <li key={product.id}>\n          {product.name}\n          <button onClick={\n            () => onAddToCart(product.id)\n          }>\n            Add to cart\n          </button>\n        </li>\n      ))}\n    </ul>\n  );\n}' },

    { type: "bullets", kicker: "Synthetic Events", heading: "SyntheticEvent: A Consistent Wrapper", items: [
      "The event object your handler receives is NOT the browser's raw native event",
      "React wraps it in a SyntheticEvent, giving a consistent API across all browsers",
      "e.target, e.preventDefault(), e.stopPropagation() all work as expected",
      "React attaches one listener at the app root and routes events internally, not one native listener per element",
    ] },

    { type: "code", kicker: "Synthetic Events", heading: "preventDefault() in Practice",
      code: 'function LinkButton() {\n  function handleClick(e) {\n    e.preventDefault(); // stop default navigation\n    console.log("Link clicked, navigation prevented");\n  }\n\n  return (\n    <a href="https://example.com" onClick={handleClick}>\n      Click me\n    </a>\n  );\n}' },

    { type: "codeImageSide", kicker: "Controlled Components", heading: "A Controlled Text Input",
      code: 'function NameForm() {\n  const [name, setName] =\n    useState("");\n  return (\n    <form>\n      <label>Name:</label>\n      <input\n        value={name}\n        onChange={(e) =>\n          setName(e.target.value)}\n      />\n      <button type="submit">\n        Submit\n      </button>\n    </form>\n  );\n}',
      img: `${IMG}/controlled-form-demo.png` },

    { type: "bullets", kicker: "Controlled Components", heading: "What Makes an Input \"Controlled\"", items: [
      "Its value attribute is always set from React state -- state is the single source of truth",
      "Its onChange handler updates that state on every keystroke, using e.target.value",
      "State changes trigger a re-render, which recomputes value={name} -- a full, predictable loop",
    ] },

    { type: "flow", kicker: "Controlled Components", heading: "The Controlled-Input Loop",
      steps: [
        { label: "User types\na character" },
        { label: "onChange fires\nsetName(e.target.value)" },
        { label: "State updates,\ncomponent re-renders" },
        { label: "New value prop\npassed down" },
        { label: "Input displays\nupdated text" },
      ],
      caption: "Every keystroke runs this full loop -- the displayed text always matches state, never the DOM's own memory of what was typed." },

    { type: "callout", kicker: "Controlled Components", heading: "Uncontrolled Components Exist Too", kind: "tip", h: 2.1,
      text: "React also supports uncontrolled components, where the DOM itself tracks an input's value and you read it with a ref only when needed. Controlled components are usually preferred: React state always reflects what's on screen, which simplifies validation and syncing multiple fields." },

    { type: "codeImageSide", kicker: "Controlled Components", heading: "One Handler, Multiple Fields",
      code: 'function SignupForm() {\n  const [data, setData] =\n    useState({ email: "", password: "" });\n  function onEdit(e) {\n    const { name, value } = e.target;\n    setData({ ...data, [name]: value });\n  }\n  return (\n    <form>\n      <input name="email"\n        onChange={onEdit} />\n      <input name="password"\n        onChange={onEdit} />\n      <button>Sign up</button>\n    </form>\n  );\n}',
      img: `${IMG}/signup-form-demo.png` },

    { type: "closing", heading: "Lecture 27 in Six Points", items: [
      "Function components are just functions returning JSX; composition builds complex UIs from small, focused, reusable pieces.",
      "Props pass data one-way from parent to child and must never be mutated; children lets a component wrap arbitrary nested content.",
      "Prop drilling is the pain of passing data through components that don't need it -- solved by the Context API next lecture.",
      "A component re-renders when its own state changes, its parent re-renders, or its props/consumed context change.",
      "React events use camelCase names and SyntheticEvent objects; always pass a function reference to a handler, never a call.",
      "Controlled components keep form values in React state via value and onChange, making state the single source of truth.",
    ] },
  ],
});
