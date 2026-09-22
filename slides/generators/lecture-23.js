const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-23";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 23: Object Relational Mapping (ORM / ODM)",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-23-Object-Relational-Mapping.pptx",
  slides: [
    { type: "title", lectureNo: 23, heading: "Object Relational\nMapping (ORM / ODM)",
      sub: "Trading raw driver calls for objects and methods — Mongoose, schemas, and the queries that write themselves." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "What \"object-relational mapping\" means and why ORMs/ODMs exist",
      "Defining models, schemas, fields, and data types with Mongoose",
      "CRUD through an ORM/ODM: queries, filtering, projection, pagination",
      "Associations: population in Mongoose, joins/associations in SQL ORMs",
      "Migrations, seeding, and the trade-offs of using an ORM/ODM",
    ] },

    { type: "bullets", kicker: "The Big Idea", heading: "What Is an ORM/ODM?", items: [
      "ORM (Object-Relational Mapping): interact with a relational database using objects and methods instead of raw SQL",
      "ODM (Object-Document Mapper): the same idea for document databases like MongoDB",
      "Write User.find(...) instead of hand-rolled driver calls",
      "Mongoose is the most widely used ODM for MongoDB in Node.js; Sequelize and Prisma are popular SQL ORMs",
    ] },

    { type: "flow", kicker: "The Big Idea", heading: "Where the ORM/ODM Sits",
      steps: [
        { label: "Your JS Code\nUser.find(),\npost.save()" },
        { label: "ORM / ODM\ne.g. Mongoose,\nSequelize" },
        { label: "Database\nDriver" },
        { label: "Database\nMongoDB /\nPostgreSQL" },
      ],
      caption: "The ORM/ODM sits between your application code and the raw database driver, translating object method calls into the queries the driver actually sends." },

    { type: "cards", kicker: "The Big Idea", heading: "Why Bother With the Extra Layer?", cards: [
      { heading: "Less Code, More Structure", accent: "2B2B7A", body: [
        "Common operations (find, save, update, delete) become one-line calls",
        "Data validation built into the model definition, checked automatically",
        "A schema structure even for MongoDB, which enforces none itself",
      ] },
      { heading: "Relationships & Portability", accent: "E67528", body: [
        "Relationships are easier to define and query (population, associations)",
        "A consistent API means switching databases needs smaller code changes",
      ] },
    ] },

    { type: "callout", kicker: "Terminology", heading: "\"ORM\" vs. \"ODM\"", kind: "note", h: 1.9,
      text: "\"Object-relational mapping\" comes from the relational-database world. When people say \"ORM\" loosely today, they often mean any object-mapping tool, including document-database ODMs like Mongoose. This course uses \"ORM/ODM\" to be precise, but expect to see \"ORM\" used for both." },

    { type: "bullets", kicker: "Schemas & Models", heading: "Schema In, Model Out", items: [
      "A schema describes what fields a document should have and what type each field is",
      "You compile a schema into a model — the object you actually use to query and save data",
      "npm install mongoose to get started",
    ] },

    { type: "code", kicker: "Schemas & Models", heading: "Connecting Mongoose",
      code: 'const mongoose = require("mongoose");\nrequire("dotenv").config();\n\nmongoose.connect(process.env.MONGO_URI)\n  .then(() => console.log("Connected to MongoDB via Mongoose"))\n  .catch((err) => console.error("Connection error:", err));' },

    { type: "code", kicker: "Schemas & Models", heading: "Defining a Schema and Model",
      code: 'const { Schema, model } = require("mongoose");\n\nconst userSchema = new Schema({\n  name: { type: String, required: true, trim: true },\n  email: { type: String, required: true, unique: true, lowercase: true },\n  age: { type: Number, min: 0, max: 120 },\n  role: { type: String, enum: ["student", "instructor", "admin"], default: "student" },\n  createdAt: { type: Date, default: Date.now },\n});\n\nconst User = model("User", userSchema);' },

    { type: "bullets", kicker: "Schemas & Models", heading: "What Each Field Defines", items: [
      "type — the data type (String, Number, Boolean, Date, Array, Schema.Types.ObjectId, ...)",
      "Validation rules — required, min/max, enum (a fixed list of allowed values), or a custom validate function",
      "Defaults — a value used automatically if none is provided",
    ] },

    { type: "callout", kicker: "Schemas & Models", heading: "Validation Runs Automatically", kind: "tip", h: 1.7,
      text: "Mongoose checks these rules every time you save() or create() a document, and throws a ValidationError if something doesn't match — free validation, no if statements needed for every field." },

    { type: "code", kicker: "Comparison", heading: "The Same Idea in Sequelize (SQL ORM)",
      code: 'const { DataTypes } = require("sequelize");\n\nconst User = sequelize.define("User", {\n  name: { type: DataTypes.STRING, allowNull: false },\n  email: { type: DataTypes.STRING, allowNull: false, unique: true },\n  age: { type: DataTypes.INTEGER },\n});',
      note: "The concepts map closely: a Mongoose \"schema\" is roughly Sequelize's \"model definition\" — both compile down to an object you use to run queries." },

    { type: "code", kicker: "CRUD: Create", heading: "Creating a Document",
      code: 'const newUser = await User.create({\n  name: "Bilal",\n  email: "bilal@email.com",\n  age: 20,\n});' },

    { type: "code", kicker: "CRUD: Read", heading: "Queries and Filtering",
      code: '// Find all users matching a filter\nconst students = await User.find({ role: "student" });\n\n// Find one user\nconst user = await User.findOne({ email: "bilal@email.com" });\n\n// Find by ID (Mongoose\'s built-in shortcut for _id)\nconst oneUser = await User.findById("64f1a2b3c4d5e6f7a8b9c0d1");\n\n// Filtering with operators\nconst adults = await User.find({ age: { $gte: 18 } });' },

    { type: "code", kicker: "CRUD: Read", heading: "Projection: Choosing Fields",
      code: '// Only return name and email\nconst emailsOnly = await User.find({}, "name email");\n// or: User.find().select("name email")',
      note: "Projection asks the database to return only specific fields — good for performance, and for avoiding sending sensitive fields (like a hashed password) to the client by accident." },

    { type: "code", kicker: "CRUD: Read", heading: "Pagination",
      code: 'async function getUsersPage(pageNumber, pageSize = 10) {\n  const skip = (pageNumber - 1) * pageSize;\n  const users = await User.find()\n    .sort({ createdAt: -1 })\n    .skip(skip)\n    .limit(pageSize);\n  const total = await User.countDocuments();\n  return { users, total, page: pageNumber, totalPages: Math.ceil(total / pageSize) };\n}',
      note: ".skip() jumps over already-seen documents; .limit() caps how many come back — together they fetch page 2, page 3, and so on." },

    { type: "code", kicker: "CRUD: Update", heading: "Updating Documents",
      code: '// Update one document and get the updated version back\nconst updated = await User.findByIdAndUpdate(\n  "64f1a2b3c4d5e6f7a8b9c0d1",\n  { age: 23 },\n  { new: true, runValidators: true }\n);\n\n// Update many at once\nawait User.updateMany({ role: "student" }, { $set: { active: true } });' },

    { type: "callout", kicker: "CRUD: Update", heading: "Validators Are Opt-In on Update", kind: "warning", h: 1.9,
      text: "By default, findByIdAndUpdate does NOT run your schema's validation rules. Always pass { runValidators: true } if you want Mongoose to check required or enum fields during an update, not just during creation." },

    { type: "code", kicker: "CRUD: Delete", heading: "Deleting Documents",
      code: 'await User.findByIdAndDelete("64f1a2b3c4d5e6f7a8b9c0d1");\nawait User.deleteMany({ role: "guest" });' },

    { type: "bullets", kicker: "Associations", heading: "Population in Mongoose", items: [
      "MongoDB documents can embed related data directly — but a Post shouldn't embed a full copy of its author",
      "Instead, reference another document by its _id, then populate that reference to pull in the full related document",
      "Conceptually similar to a SQL JOIN, though implemented as a separate query behind the scenes",
    ] },

    { type: "code", kicker: "Associations", heading: "Referencing and Populating",
      code: 'const postSchema = new Schema({\n  title: { type: String, required: true },\n  content: String,\n  author: { type: Schema.Types.ObjectId, ref: "User" },\n});\nconst Post = model("Post", postSchema);\n\n// Fetch the post WITH the full author document\nconst post = await Post.findOne({ title: "Learning Mongoose" })\n  .populate("author");\nconsole.log(post.author.name); // "Bilal"' },

    { type: "diagram", kicker: "Associations", heading: "A User Referenced by Many Posts",
      nodes: [
        { x: 1.5, y: 2.6, w: 3.6, h: 2.4, text: "USER\n\n_id: ObjectId\nname: String\nemail: String", fill: "2B2B7A", fontSize: 13 },
        { x: 8.2, y: 2.6, w: 3.6, h: 2.4, text: "POST\n\n_id: ObjectId\ntitle: String\nauthor: ObjectId\n(references User._id)", fill: "E67528", fontSize: 13 },
      ],
      edges: [
        { x1: 5.1, y1: 3.8, x2: 8.2, y2: 3.8, label: "author of\n(1 : many)" },
      ],
      caption: "post.author stores just a User's ObjectId. .populate(\"author\") runs a second query and swaps that ID for the full User document." },

    { type: "callout", kicker: "Associations", heading: "The SQL Equivalent: Associations", kind: "note", h: 1.9,
      text: "In a SQL ORM like Sequelize, the equivalent idea is called an association (User.hasMany(Post), Post.belongsTo(User)), and behind the scenes it generates actual SQL JOIN queries." },

    { type: "bullets", kicker: "Migrations & Seeding", heading: "Migrations", items: [
      "A migration is a versioned, scripted change to your database's structure (adding a column, renaming a table)",
      "Migrations can be applied — and ideally reversed — so every environment stays in sync over time",
      "Central to SQL ORMs like Sequelize; MongoDB's flexible documents mean Mongoose doesn't require them formally",
      "Larger MongoDB projects often still use a dedicated tool (like migrate-mongo) for one-off schema-evolution scripts",
    ] },

    { type: "code", kicker: "Migrations & Seeding", heading: "Running a Sequelize Migration",
      code: 'npx sequelize-cli migration:generate --name add-age-to-users\nnpx sequelize-cli db:migrate' },

    { type: "code", kicker: "Migrations & Seeding", heading: "Seeding: Loading Sample Data",
      code: '// seed.js\nasync function seed() {\n  await mongoose.connect(process.env.MONGO_URI);\n  await User.deleteMany({}); // clear existing data\n  await User.insertMany([\n    { name: "Ayesha", email: "ayesha@email.com", role: "admin" },\n    { name: "Bilal", email: "bilal@email.com", role: "student" },\n  ]);\n  console.log("Database seeded!");\n  await mongoose.disconnect();\n}\nseed();' },

    { type: "table", kicker: "Trade-Offs", heading: "Convenience vs. Control",
      header: ["Benefit", "Cost"], colW: [5.9, 5.9], rowH: 0.85,
      rows: [
        ["Less boilerplate, faster development", "An extra layer to learn, on top of the database itself"],
        ["Built-in validation and structure", "Generated queries can be less efficient for complex cases"],
        ["Easier to reason about relationships", "\"Magic\" behavior can hide what's really happening"],
        ["Consistent patterns across a codebase", "Sometimes you still need raw queries the ORM doesn't expose"],
      ] },

    { type: "callout", kicker: "Trade-Offs", heading: "You Don't Have to Pick One Approach", kind: "tip", h: 1.9,
      text: "Most ORMs/ODMs, including Mongoose, let you drop to raw queries when you need to (.aggregate() for MongoDB's pipeline, for example). Use the ORM for everyday CRUD and drop to raw queries for the rare complex case." },

    { type: "closing", heading: "Lecture 23 in Six Points", items: [
      "An ORM (relational) or ODM (document, e.g. Mongoose) maps your database's data onto objects and methods, cutting repetitive query-writing.",
      "Mongoose schemas define fields, data types, validation rules, and defaults; a model compiled from a schema is what you actually query with.",
      "CRUD through Mongoose uses create, find, findByIdAndUpdate, and findByIdAndDelete, plus filtering, projection, and pagination.",
      "Population (.populate()) resolves a referenced ObjectId into the full related document — Mongoose's answer to SQL joins.",
      "Migrations version your database structure over time (central to SQL ORMs like Sequelize); seeding loads initial or sample data.",
      "ORMs/ODMs trade some control and query efficiency for convenience, validation, and consistency — and you can still write raw queries when needed.",
    ] },
  ],
});
