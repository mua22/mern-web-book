"""Diagrams for Parts 3-9 and appendices: planning, architecture, testing, features, shipping."""
from svgkit import Svg


def prompt_anatomy():
    s = Svg(760, 300, "Anatomy of a good prompt", "Goal, context, constraints and a definition of done")
    rows = [("Goal", "what outcome you want", "teal", "Add a stats endpoint"),
            ("Context", "where to look, what exists", "purple", "@src/store.js already has list()"),
            ("Constraints", "rules to respect", "orange", "no new dependencies"),
            ("Done when", "how to verify", "teal", "npm test passes + new test")]
    for i, (t, sub, col, ex) in enumerate(rows):
        y = 20 + i * 66
        s.node(20, y, 230, 52, t, sub, col, size=13)
        s.arrow([(250, y + 26), (290, y + 26)], "plain")
        s.rect(294, y, 446, 52, r=12, fill="var(--cu-bg)", stroke="var(--cu-border-soft)")
        s.text(312, y + 31, ex, 13, 600, anchor="start", mono=True)
    return s.render()


def review_loop():
    s = Svg(760, 215, "The human review loop", "Prompt, inspect the diff, give a follow-up, then commit")
    steps = [("Prompt", "one small task", "teal"), ("Diff", "read every change", "purple"), ("Judge", "right fix or symptom?", "orange"),
             ("Follow-up", "steer the design", "teal"), ("Commit", "save a checkpoint", "purple")]
    for i, (t, sub, col) in enumerate(steps):
        x = 14 + i * 148
        s.node(x, 80, 126, 70, t, sub, col, size=13)
        if i:
            s.arrow([(x - 20, 115), (x - 2, 115)], "plain")
    s.arrow([(470, 80), (470, 40), (225, 40), (225, 76)], "orange", "fix the cause, not the symptom", 348, 32, dash="5 4")
    s.text(14, 184, "Small steps + a commit after each good one = every mistake is cheap to undo.", 12.5, 600, anchor="start", fill="var(--cu-muted)")
    return s.render()


def project_funnel():
    s = Svg(760, 280, "From idea to a ready project", "Scope, requirements, MVP, stack, plan and setup")
    steps = ["Idea", "Scope", "Requirements", "MVP", "Tech stack", "Plan", "Set up"]
    cols = ["plain", "teal", "teal", "purple", "purple", "orange", "orange"]
    for i, (t, col) in enumerate(zip(steps, cols)):
        x = 16 + i * 106
        h = 120 - i * 6
        s.node(x, 60 + (120 - h) / 2, 88, h, t, None, col, size=12)
        if i:
            s.arrow([(x - 16, 120), (x - 2, 120)], "plain", sw=1.4)
    s.text(16, 36, "Each step narrows the problem. Ask Claude to interview you at every one.", 12.5, 600, anchor="start", fill="var(--cu-muted)")
    s.group(16, 205, 728, 56, "claude's role", "teal")
    s.text(380, 241, "asks questions  ·  proposes options with trade-offs  ·  writes the plan to a file you can edit", 12.5, 600, fill="var(--cu-text)")
    return s.render()


def shelf_architecture():
    s = Svg(760, 330, "Shelf architecture", "HTTP layer, validation, store; MCP server and tests share the same modules")
    s.node(20, 130, 110, 60, "HTTP client", "curl / browser", "plain")
    s.node(170, 130, 130, 60, "app.js", "routes + status codes", "teal", mono=True)
    s.node(340, 130, 130, 60, "validate.js", "rules, errors", "orange", mono=True)
    s.node(510, 130, 120, 60, "store.js", "data + queries", "purple", mono=True)
    s.node(660, 135, 84, 50, "data.json", None, "plain", mono=True, size=11)
    s.arrow([(130, 160), (166, 160)], "plain")
    s.arrow([(300, 160), (336, 160)], "plain")
    s.arrow([(470, 160), (506, 160)], "plain")
    s.arrow([(630, 160), (656, 160)], "plain")
    s.node(340, 20, 290, 56, "mcp/shelf-mcp.js", "lets Claude call the store as tools", "purple", mono=True)
    s.arrow([(570, 76), (570, 126)], "purple", dash="5 4")
    s.arrow([(430, 76), (430, 126)], "orange", dash="5 4")
    s.group(20, 232, 724, 80, "tests (node:test)", "teal")
    for i, t in enumerate(["validate.test.js", "api.test.js", "mcp.test.js"]):
        s.pill(40 + i * 236, 266, 200, t, "teal", mono=True)
    s.text(20, 52, "Rule: business rules never live in app.js", 12, 600, anchor="start", fill="var(--cu-muted)")
    return s.render()


def tdd_loop():
    s = Svg(760, 300, "Test-first loop with Claude", "Write a failing test, implement, run the suite, review, commit")
    pts = [("1 Write test", "describe behaviour", "teal", 270, 30), ("2 Watch it fail", "right reason?", "orange", 520, 90),
           ("3 Implement", "smallest change", "purple", 520, 190), ("4 Run suite", "all green?", "teal", 270, 220),
           ("5 Review diff", "you + reviewer agent", "orange", 20, 190), ("6 Commit", "checkpoint", "purple", 20, 90)]
    for t, sub, col, x, y in pts:
        s.node(x, y, 200, 56, t, sub, col, size=13)
    s.arrow([(470, 58), (520, 100)], "plain")
    s.arrow([(620, 146), (620, 186)], "plain")
    s.arrow([(520, 232), (474, 244)], "plain")
    s.arrow([(270, 244), (222, 232)], "plain")
    s.arrow([(120, 190), (120, 150)], "plain")
    s.arrow([(120, 90), (120, 58), (266, 58)], "plain")
    s.text(380, 150, "repeat per behaviour", 12, 700, fill="var(--cu-faint)")
    s.text(380, 168, "never edit a test just to turn it green", 11.5, 500, fill="var(--cu-muted)")
    return s.render()


def auth_flow():
    s = Svg(760, 360, "API key authentication", "Client sends a key; middleware resolves the owner; handlers see only that owner's data")
    cols = [("Client", 90, "plain"), ("auth middleware", 280, "orange"), ("handler", 470, "teal"), ("store", 650, "purple")]
    for name, x, col in cols:
        s.node(x - 70, 14, 140, 40, name, None, col, size=12.5, mono=(name != "Client"))
        s.line(x, 54, x, 340, "var(--cu-border-soft)", 1.4, "4 4")
    seq = [(90, 280, 94, "GET /books  (x-api-key: k_…)", "teal"), (280, 650, 134, "lookup key → owner", "orange"),
           (650, 280, 168, "owner: ada  /  null", "purple"), (280, 90, 212, "401 if null", "red"),
           (280, 470, 252, "req.owner = ada", "orange"), (470, 650, 288, "list(owner = ada)", "teal"),
           (650, 90, 326, "ada's books only", "purple")]
    for x1, x2, y, label, col in seq:
        d = 6 if x2 > x1 else -6
        s.arrow([(x1 + d, y), (x2 - d, y)], col)
        s.text((x1 + x2) / 2, y - 6, label, 11, 600, fill="var(--cu-muted)")
    return s.render()


def job_queue():
    s = Svg(760, 290, "Background jobs with retries", "Requests enqueue work; a worker retries with backoff and finally parks failures")
    s.node(20, 100, 120, 60, "Request", "returns 202 fast", "plain")
    s.node(180, 100, 120, 60, "Queue", "jobs wait here", "teal")
    s.node(340, 100, 120, 60, "Worker", "runs one job", "purple")
    s.node(520, 40, 130, 56, "Success", "mark done", "teal")
    s.node(520, 168, 130, 56, "Failure", "attempts < max?", "orange")
    s.node(520, 244, 130, 38, "Dead letter", None, "red", size=12)
    s.arrow([(140, 130), (176, 130)], "plain")
    s.arrow([(300, 130), (336, 130)], "plain")
    s.arrow([(460, 118), (516, 76)], "teal")
    s.arrow([(460, 142), (516, 190)], "orange")
    s.arrow([(520, 206), (390, 206), (260, 206), (240, 164)], "orange", "retry after backoff", 392, 198, dash="5 4")
    s.arrow([(585, 224), (585, 242)], "red", "no", 606, 238)
    s.text(662, 72, "result saved", 11.5, 600, anchor="start", fill="var(--cu-muted)")
    return s.render()


def email_flow():
    s = Svg(760, 330, "Email in and out", "Inbound mail reaches a webhook through a tunnel; outbound mail leaves via a provider")
    s.group(16, 16, 728, 140, "inbound", "teal")
    for i, (t, sub, col) in enumerate([("Sender", None, "plain"), ("Mail provider", "parses email", "purple"), ("Tunnel", "ngrok in dev", "orange"),
                                       ("POST /webhooks/email", "verify, parse, save", "teal")]):
        x = 36 + i * 178
        s.node(x, 54, 150 if i < 3 else 160, 64, t, sub, col, size=12.5, mono=(i == 3))
        if i:
            s.arrow([(x - 26, 86), (x - 3, 86)], "plain")
    s.group(16, 176, 728, 140, "outbound", "purple")
    for i, (t, sub, col) in enumerate([("Your app", "reply composed", "teal"), ("Mailer", "interface", "purple"),
                                       ("Provider API", "SendGrid etc.", "orange"), ("Recipient", None, "plain")]):
        x = 36 + i * 178
        s.node(x, 214, 150, 64, t, sub, col, size=12.5)
        if i:
            s.arrow([(x - 26, 246), (x - 3, 246)], "plain")
    return s.render()


def ai_feature():
    s = Svg(760, 300, "Adding an LLM feature safely", "Prompt in, validate the output, fall back when the model is unavailable")
    s.node(20, 110, 120, 64, "Your code", "needs a summary", "plain")
    s.node(180, 110, 140, 64, "ai.js", "builds the prompt", "teal", mono=True)
    s.node(360, 110, 130, 64, "Claude API", "Messages call", "purple")
    s.node(530, 110, 130, 64, "Validate", "shape, length, safety", "orange")
    s.node(690, 120, 56, 44, "UI", None, "teal", size=12)
    for a, b in [(140, 176), (320, 356), (490, 526), (660, 686)]:
        s.arrow([(a, 142), (b, 142)], "plain")
    s.arrow([(595, 174), (595, 236), (250, 236), (250, 178)], "orange", "bad output or API error → safe fallback + log", 420, 228, dash="5 4")
    s.text(20, 40, "Treat model output as untrusted input: validate it exactly like user input.", 12.5, 600, anchor="start", fill="var(--cu-muted)")
    s.text(20, 270, "Inject the client (ai.js takes a function) so tests never call the network.", 12, 500, anchor="start", fill="var(--cu-muted)")
    return s.render()


def ci_cd():
    s = Svg(760, 280, "CI/CD pipeline", "Push triggers tests, image build, deploy and a smoke test")
    steps = [("git push", None, "plain"), ("CI", "install, test", "teal"), ("Build", "Docker image", "purple"),
             ("Deploy", "to platform", "orange"), ("Smoke test", "GET /health", "teal")]
    for i, (t, sub, col) in enumerate(steps):
        x = 16 + i * 148
        s.node(x, 70, 126, 64, t, sub, col, size=13)
        if i:
            s.arrow([(x - 20, 102), (x - 2, 102)], "plain")
    s.arrow([(227, 134), (227, 190)], "red", "red test = stop", 300, 168, dash="5 4")
    s.group(16, 190, 728, 76, "fail fast", "red")
    s.text(380, 226, "A red test stops the pipeline before anything reaches users.", 13, 600)
    s.text(380, 248, "Secrets live in the platform's settings, never in git.", 12, 500, fill="var(--cu-muted)")
    return s.render()


def claude_actions():
    s = Svg(760, 230, "Claude Code in GitHub Actions", "Mention Claude on an issue or PR; it works in a runner and opens a pull request")
    steps = [("Issue / PR", "@claude fix this", "plain"), ("Workflow", "claude-code-action", "teal"), ("Runner", "checks out repo", "purple"),
             ("Claude", "edits, tests", "orange"), ("Pull request", "you review + merge", "teal")]
    for i, (t, sub, col) in enumerate(steps):
        x = 16 + i * 148
        s.node(x, 80, 126, 70, t, sub, col, size=12.5)
        if i:
            s.arrow([(x - 20, 115), (x - 2, 115)], "plain")
    s.text(16, 36, "Same agent, same CLAUDE.md, same permissions model — just triggered by an event.", 12.5, 600, anchor="start", fill="var(--cu-muted)")
    s.text(16, 200, "Store the API key as a repository secret. Review every PR it opens.", 12.5, 600, anchor="start", fill="var(--cu-muted)")
    return s.render()


def troubleshooting_tree():
    s = Svg(760, 300, "When Claude gets it wrong", "A decision path for common failure modes")
    s.node(280, 14, 200, 44, "Output is wrong", None, "red")
    s.arrow([(380, 58), (380, 84)], "plain")
    s.node(280, 84, 200, 44, "Was the prompt clear?", None, "orange")
    s.arrow([(280, 106), (140, 106), (140, 150)], "plain", "no", 200, 98)
    s.node(40, 150, 200, 56, "Rewrite: goal, context,", "constraints, done-when", "teal", size=12.5)
    s.arrow([(480, 106), (620, 106), (620, 150)], "plain", "yes", 560, 98)
    s.node(520, 150, 200, 44, "Is the context bloated?", None, "orange")
    s.arrow([(520, 172), (400, 172), (400, 226)], "plain", "yes", 460, 164)
    s.node(300, 226, 200, 56, "/compact or /clear,", "then restate the task", "purple", size=12.5)
    s.arrow([(720, 172), (734, 172), (734, 222)], "plain", "no", 748, 200)
    s.node(580, 226, 164, 56, "Rewind, split the", "task, use plan mode", "purple", size=12)
    return s.render()


ALL = {
    "prompt-anatomy": prompt_anatomy, "review-loop": review_loop, "project-funnel": project_funnel,
    "shelf-architecture": shelf_architecture, "tdd-loop": tdd_loop, "auth-flow": auth_flow,
    "job-queue": job_queue, "email-flow": email_flow, "ai-feature": ai_feature, "ci-cd": ci_cd,
    "claude-actions": claude_actions, "troubleshooting-tree": troubleshooting_tree,
}
