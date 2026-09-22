const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-29";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 29: Routing and API Integration",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-29-Routing-and-API-Integration.pptx",
  slides: [
    { type: "title", lectureNo: 29, heading: "Routing and\nAPI Integration",
      sub: "Giving a single-page app multiple \"pages\" — and connecting it to the real REST API you built in Express." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "Client-side routing with React Router: routes, Link, and route parameters",
      "Nested routes, shared layouts, a not-found route, programmatic navigation, and protected routes",
      "Fetching data with fetch or axios inside useEffect, and building a custom data hook",
      "Handling loading and error states while consuming your REST API",
    ] },

    { type: "bullets", kicker: "Client-Side Routing", heading: "React Router: Different URLs, No Reload", items: [
      "An SPA still needs multiple \"pages\" -- a home page, product details, a login page -- and real server data",
      "Client-side routing makes URLs like /, /products, /products/12 show different content WITHOUT a new server request each time",
      "Install with: npm install react-router-dom",
    ] },

    { type: "code", kicker: "Client-Side Routing", heading: "Setting Up Routes",
      code: 'import { BrowserRouter, Routes, Route }\n  from "react-router-dom";\ncreateRoot(root).render(\n  <BrowserRouter>\n    <Routes>\n      <Route path="/" element={<App />}>\n        <Route index element={<Home />} />\n        <Route path="products"\n          element={<Products />} />\n        <Route path="products/:id"\n          element={<ProductDetails />} />\n        <Route path="*" element={<NotFound />} />\n      </Route>\n    </Routes>\n  </BrowserRouter>\n);',
      note: "Each <Route> maps a URL path to the component (element) that renders there -- React Router reads the current URL and renders only the match." },

    { type: "bullets", kicker: "The Link Component", heading: "Never Use a Plain <a> Inside the App", items: [
      "A plain <a href=\"/products\"> triggers a full browser page reload, defeating the purpose of an SPA",
      "React Router's Link updates the URL and swaps content using JavaScript instead",
    ] },

    { type: "codeImageSide", kicker: "The Link Component", heading: "A Navbar with Link",
      code: 'import { Link } from "react-router-dom";\nfunction Navbar() {\n  return (\n    <nav>\n      <Link to="/">Home</Link>\n      <Link to="/products">\n        Products\n      </Link>\n    </nav>\n  );\n}',
      img: `${IMG}/navbar-demo.png` },

    { type: "callout", kicker: "The Link Component", heading: "NavLink for Active-Link Styling", kind: "tip", h: 1.9,
      text: "NavLink behaves like Link but automatically adds an active CSS class (or lets you compute a class/style) when its to path matches the current URL -- handy for highlighting the current page in a navbar." },

    { type: "bullets", kicker: "Route Parameters", heading: "Dynamic URL Segments", items: [
      "A route parameter is a dynamic segment written with a leading colon, like :id in products/:id",
      "Read it inside the matching component with the useParams hook",
      "Route params are always strings -- convert with Number(id) if you need a number",
    ] },

    { type: "code", kicker: "Route Parameters", heading: "Reading :id with useParams",
      code: 'import { useParams } from "react-router-dom";\n\nfunction ProductDetails() {\n  const { id } = useParams();\n  return <p>Showing details for #{id}</p>;\n}',
      note: "Visiting /products/12 renders ProductDetails with id equal to the string \"12\"." },

    { type: "table", kicker: "Reference", heading: "React Router API at a Glance",
      header: ["API", "Purpose"], colW: [3.6, 8.3], leftCol: 0, rowH: 0.72,
      rows: [
        ["<Link to=\"...\">", "Client-side navigation, no page reload"],
        ["<NavLink to=\"...\">", "Like Link, plus an automatic \"active\" class"],
        ["useParams()", "Reads dynamic route segments like :id"],
        ["useNavigate()", "Triggers navigation from inside your own code"],
        ["<Navigate to=\"...\" />", "Redirects declaratively (e.g. from a protected route)"],
        ["<Outlet />", "Renders the matching nested route inside a layout"],
      ] },

    { type: "bullets", kicker: "Nested Routes", heading: "A Shared Layout via <Outlet />", items: [
      "Home, Products, and ProductDetails are declared INSIDE the / route for App -- a nested route",
      "App acts as a shared layout component (Navbar + Footer), rendering its nested route's content wherever it places an <Outlet />",
      "This avoids repeating shared UI in every single page component",
    ] },

    { type: "code", kicker: "Nested Routes", heading: "App as a Layout Component",
      code: 'import { Outlet } from "react-router-dom";\n\nfunction App() {\n  return (\n    <div>\n      <Navbar />\n      <main>\n        <Outlet />\n      </main>\n      <Footer />\n    </div>\n  );\n}' },

    { type: "diagram", kicker: "Nested Routes", heading: "How One URL Tree Maps to Components",
      nodes: [
        { x: 4.5, y: 2.3, w: 4.3, h: 0.75, text: "/  ->  App\n(layout: Navbar + Outlet + Footer)", fill: "2B2B7A", fontSize: 11.5 },
        { x: 0.7, y: 4.1, w: 2.6, h: 0.65, text: "index -> Home", fill: "3A3A78", fontSize: 11.5 },
        { x: 3.6, y: 4.1, w: 2.9, h: 0.65, text: "/products ->\nProducts", fill: "3A3A78", fontSize: 11.5 },
        { x: 6.8, y: 4.1, w: 3.1, h: 0.65, text: "/products/:id ->\nProductDetails", fill: "3A3A78", fontSize: 10.5 },
        { x: 10.2, y: 4.1, w: 2.2, h: 0.65, text: "* -> NotFound", fill: "8A3A12", fontSize: 11.5 },
      ],
      edges: [
        { x1: 5.5, y1: 3.05, x2: 2.0, y2: 4.1 },
        { x1: 6.2, y1: 3.05, x2: 5.05, y2: 4.1 },
        { x1: 6.8, y1: 3.05, x2: 8.35, y2: 4.1 },
        { x1: 7.2, y1: 3.05, x2: 11.3, y2: 4.1 },
      ],
      caption: "Navbar and Footer render on every page; <Outlet /> is replaced with Home, Products, or ProductDetails depending on the current URL." },

    { type: "code", kicker: "Not Found", heading: "A Catch-All 404 Route",
      code: 'function NotFound() {\n  return <h1>404 -- Page not found</h1>;\n}\n\n// Placed LAST in the route list:\n<Route path="*" element={<NotFound />} />',
      note: "The special path \"*\" matches any URL that didn't match an earlier route -- placing it last ensures it only catches what's left." },

    { type: "bullets", kicker: "Programmatic Navigation", heading: "Navigating From Code, Not a Click", items: [
      "Sometimes you need to navigate in response to code -- e.g. redirecting after a successful form submission",
      "The useNavigate hook returns a function you call for this",
    ] },

    { type: "code", kicker: "Programmatic Navigation", heading: "Redirecting After Login",
      code: 'import { useNavigate } from "react-router-dom";\n\nfunction LoginForm() {\n  const navigate = useNavigate();\n\n  async function handleSubmit(e) {\n    e.preventDefault();\n    // ...perform login...\n    navigate("/dashboard");\n  }\n\n  return <form onSubmit={handleSubmit}>...</form>;\n}' },

    { type: "bullets", kicker: "Protected Routes", heading: "Gating Content Behind Login", items: [
      "A protected route only renders its content for authenticated users, redirecting anyone else",
      "A common pattern: a small wrapper component checking an auth hook/context",
    ] },

    { type: "code", kicker: "Protected Routes", heading: "A ProtectedRoute Wrapper",
      code: 'function ProtectedRoute({ children }) {\n  const { user } = useAuth();\n  if (!user) {\n    return <Navigate to="/login" replace />;\n  }\n  return children;\n}',
      note: "Wrap any route needing login: element={<ProtectedRoute><Dashboard /></ProtectedRoute>}. replace keeps the blocked page out of browser history." },

    { type: "bullets", kicker: "Fetching Data", heading: "Data Fetching Is a Side Effect", items: [
      "In Lecture 25 you built a REST API with Express -- e.g. GET /api/products and GET /api/products/:id",
      "Calling that API reaches OUTSIDE the component, so it belongs inside useEffect (Lecture 28)",
    ] },

    { type: "code", kicker: "Fetching Data", heading: "Using fetch",
      code: 'function Products() {\n  const [products, setProducts] =\n    useState([]);\n  useEffect(() => {\n    fetch("/api/products")\n      .then((res) => res.json())\n      .then((data) => setProducts(data));\n  }, []);\n  return (\n    <ul>\n      {products.map((p) => (\n        <li key={p._id}>{p.name}</li>\n      ))}\n    </ul>\n  );\n}' },

    { type: "code", kicker: "Fetching Data", heading: "Using axios",
      code: 'import axios from "axios";\nfunction Products() {\n  const [products, setProducts] =\n    useState([]);\n  useEffect(() => {\n    axios.get("/api/products")\n      .then((res) => setProducts(res.data));\n  }, []);\n  return (\n    <ul>\n      {products.map((p) => (\n        <li key={p._id}>{p.name}</li>\n      ))}\n    </ul>\n  );\n}' },

    { type: "bullets", kicker: "Fetching Data", heading: "Why axios Is Often Preferred", items: [
      "Automatically parses JSON responses -- no manual res.json() step",
      "A slightly simpler API for the common GET/POST/etc. calls",
      "More consistent error handling: network AND non-2xx errors both land in .catch, unlike fetch (where a 404/500 still resolves and must be checked manually)",
    ] },

    { type: "bullets", kicker: "Loading and Error States", heading: "Track Three Pieces of State, Not One", items: [
      "A real request takes time and can fail -- from a network problem or a server error status",
      "Track the data itself, a loading flag, and an error, and reflect all three in the UI",
    ] },

    { type: "code", kicker: "Loading and Error States", heading: "Products, Fully Handled",
      code: 'function Products() {\n  const [products, setProducts] = useState([]);\n  const [isLoading, setIsLoading] = useState(true);\n  const [error, setError] = useState(null);\n  useEffect(() => {\n    axios.get("/api/products")\n      .then((res) => setProducts(res.data))\n      .catch(() => setError("Could not load."))\n      .finally(() => setIsLoading(false));\n  }, []);\n  if (isLoading) return <p>Loading...</p>;\n  if (error) return <p role="alert">{error}</p>;\n  return <ul>{/* render products */}</ul>;\n}' },

    { type: "imagePair", kicker: "Loading and Error States", heading: "Two States, Rendered",
      left: { img: `${IMG}/products-loading-demo.png`, label: "isLoading: true" },
      right: { img: `${IMG}/products-error-demo.png`, label: "error: set" } },

    { type: "image", kicker: "Loading and Error States", heading: "The Success State, Rendered",
      intro: "Once the request resolves and isLoading is false with no error, the real list renders.",
      img: `${IMG}/products-loaded-demo.png` },

    { type: "diagram", kicker: "Loading and Error States", heading: "The Full Request Lifecycle",
      nodes: [
        { x: 0.7, y: 2.3, w: 3.1, h: 0.65, text: "Component mounts\neffect runs ([] deps)", fill: "2B2B7A", fontSize: 11 },
        { x: 4.3, y: 2.3, w: 3.4, h: 0.65, text: "setIsLoading(true)\nGET /api/products", fill: "3A3A78", fontSize: 11.5 },
        { x: 1.1, y: 4.0, w: 4.0, h: 0.65, text: "200 OK\nsetProducts(data)", fill: "3FA66B", fontSize: 12 },
        { x: 7.4, y: 4.0, w: 4.4, h: 0.65, text: "Network error or non-2xx\nsetError(message)", fill: "E67528", fontSize: 11 },
        { x: 4.1, y: 5.6, w: 4.4, h: 0.65, text: "setIsLoading(false)\nre-renders, shows result", fill: "2B2B7A", fontSize: 11.5 },
      ],
      edges: [
        { x1: 3.8, y1: 2.625, x2: 4.3, y2: 2.625 },
        { x1: 5.2, y1: 2.95, x2: 3.3, y2: 4.0, label: "succeeds" },
        { x1: 6.8, y1: 2.95, x2: 9.2, y2: 4.0, label: "fails" },
        { x1: 3.3, y1: 4.65, x2: 5.0, y2: 5.6 },
        { x1: 9.2, y1: 4.65, x2: 7.2, y2: 5.6 },
      ],
      caption: "Both branches funnel through the same finally: setIsLoading(false) always runs, so the UI never gets stuck showing \"Loading...\"." },

    { type: "bullets", kicker: "Custom Data Hook", heading: "\"Loading, Error, Data\" Shows Up Everywhere", items: [
      "This exact pattern repeats in almost every component that talks to an API",
      "A great candidate for a custom hook (Lecture 28), so the logic isn't rewritten each time",
    ] },

    { type: "code", kicker: "Custom Data Hook", heading: "useFetch.js",
      code: 'function useFetch(url) {\n  const [data, setData] = useState(null);\n  const [isLoading, setIsLoading] = useState(true);\n  const [error, setError] = useState(null);\n  useEffect(() => {\n    let ignore = false;\n    axios.get(url)\n      .then((res) => { if (!ignore) setData(res.data); })\n      .catch(() => { if (!ignore) setError("Failed."); })\n      .finally(() => { if (!ignore) setIsLoading(false); });\n    return () => { ignore = true; };\n  }, [url]);\n  return { data, isLoading, error };\n}',
      note: "The ignore flag inside cleanup avoids updating state from a late response after the component has already unmounted." },

    { type: "code", kicker: "Custom Data Hook", heading: "Any Endpoint, One Line",
      code: 'function Products() {\n  const { data, isLoading, error } =\n    useFetch("/api/products");\n  if (isLoading) return <p>Loading...</p>;\n  if (error) return <p role="alert">{error}</p>;\n  return <ul>{/* data.map(...) */}</ul>;\n}\nfunction ProductDetails() {\n  const { id } = useParams();\n  const { data, isLoading, error } =\n    useFetch(`/api/products/${id}`);\n  if (isLoading) return <p>Loading...</p>;\n  if (error) return <p role="alert">{error}</p>;\n  return <h1>{data.name}</h1>;\n}',
      note: "Combining route parameters (useParams) with useFetch is exactly how a real product-details page, backed by GET /api/products/:id, gets built." },

    { type: "callout", kicker: "Local Development", heading: "CORS During Local Development", kind: "warning", h: 2.1,
      text: "If your Express API (e.g. localhost:5000) and your Vite dev server (e.g. localhost:5173) run on different ports, the browser treats them as different origins. Make sure Express uses the cors middleware (Lecture 25) so the browser allows these requests during development." },

    { type: "closing", heading: "Lecture 29 in Seven Points", items: [
      "React Router enables client-side routing: URLs map to components without a full page reload; use Link, never <a>, for in-app navigation.",
      "Route parameters (:id) capture dynamic URL segments, read with useParams.",
      "Nested routes with <Outlet /> share a layout (navbar, footer) across pages; a path=\"*\" route provides a not-found page.",
      "useNavigate triggers navigation from code; protected routes redirect unauthenticated users away with <Navigate replace />.",
      "Data fetching (fetch or axios) belongs inside useEffect, since it is a side effect; axios adds automatic JSON parsing and simpler error handling.",
      "Always track loading and error state alongside your data, and show the user feedback for every case, not just success.",
      "A custom useFetch hook removes repetition when many components need to load data from your REST API.",
    ] },
  ],
});
