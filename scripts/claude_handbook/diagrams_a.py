"""Diagrams for Parts 1-2: orientation, fundamentals, extensions."""
from svgkit import Svg


def series_map():
    s = Svg(760, 250, "How this handbook maps to the video series",
            "Nine video sections, each paired with a handbook part")
    parts = [
        ("1", "Welcome", "orient", "plain"), ("2", "Basics", "tools, habits", "teal"),
        ("3", "Plan", "scope, setup", "purple"), ("4", "Auth", "plus tests", "orange"),
        ("5", "CRUD", "users", "teal"), ("6", "Tickets", "features", "purple"),
        ("7", "AI", "LLM features", "orange"), ("8", "Email", "integration", "teal"),
        ("9", "Ship", "deploy, CI", "purple"),
    ]
    x0, w, gap = 24, 74, 6.5
    for i, (n, t, sub, col) in enumerate(parts):
        x = x0 + i * (w + gap)
        s.node(x, 70, w, 92, t, sub, col, size=12.5)
        s.badge(x + w / 2, 70, n, col)
    s.line(20, 30, 740, 30, sw=2)
    s.text(20, 22, "VIDEO SERIES  →", 10.5, 800, anchor="start", fill="var(--cu-faint)")
    s.text(740, 22, "same order in this book", 10.5, 800, anchor="end", fill="var(--cu-faint)")
    s.rect(16, 190, 728, 44, r=12, fill="var(--cu-teal)", stroke="var(--cu-teal)", sw=1.2, opacity=0.1)
    s.text(380, 217, "Each part: concept  →  worked example  →  common mistakes  →  checklist", 13, 600)
    return s.render()


def agent_loop():
    s = Svg(760, 310, "The agent loop",
            "A coding agent gathers context, acts, verifies, and repeats until the goal is met")
    s.node(20, 100, 130, 70, "Your goal", "plain English", "plain")
    s.node(190, 100, 150, 70, "1 · Gather", "read, search, ask", "teal")
    s.node(380, 100, 150, 70, "2 · Act", "edit files, run", "purple")
    s.node(570, 100, 150, 70, "3 · Verify", "tests, lint, build", "orange")
    s.arrow([(150, 135), (186, 135)], "plain")
    s.arrow([(340, 135), (376, 135)], "plain")
    s.arrow([(530, 135), (566, 135)], "plain")
    s.arrow([(645, 100), (645, 52), (265, 52), (265, 96)], "orange", "not done yet → loop again", 455, 44, dash="6 4")
    s.node(570, 228, 150, 56, "Report back", "summary of changes", "teal")
    s.arrow([(645, 170), (645, 224)], "teal", "done", 668, 202)
    s.text(190, 214, "TOOLS THE AGENT CALLS", 10.5, 800, anchor="start", fill="var(--cu-faint)")
    for i, t in enumerate(["Read", "Grep", "Edit", "Bash", "Git"]):
        s.pill(190 + i * 70, 224, 62, t, "plain", mono=True)
    s.text(190, 268, "You stay in control: risky tool calls ask first.", 12, 500, anchor="start", fill="var(--cu-muted)")
    return s.render()


def chat_vs_agent():
    s = Svg(760, 340, "Chat assistant versus coding agent",
            "A chat assistant returns text you paste yourself; an agent acts directly in your project")
    s.group(16, 14, 350, 312, "Chat assistant", "plain")
    s.node(110, 52, 160, 44, "You ask a question", None, "plain")
    s.arrow([(190, 96), (190, 126)], "plain")
    s.node(110, 126, 160, 44, "Model answers in text", None, "plain")
    s.arrow([(190, 170), (190, 200)], "plain")
    s.node(110, 200, 160, 52, "You copy-paste", "and run it yourself", "orange")
    s.arrow([(190, 252), (190, 280)], "plain")
    s.node(110, 280, 160, 34, "Your code", None, "plain")
    s.group(394, 14, 350, 312, "Coding agent", "teal")
    s.node(430, 52, 150, 44, "You state a goal", None, "teal")
    s.arrow([(505, 96), (505, 126)], "teal")
    s.node(430, 126, 150, 60, "Agent plans", "and takes actions", "teal")
    s.arrow([(505, 186), (505, 226)], "teal")
    s.node(430, 226, 150, 60, "Change in your repo", "tested and diffable", "purple")
    for i, t in enumerate(["Files", "Shell", "Git", "Tests"]):
        s.pill(630, 114 + i * 34, 82, t, "teal", mono=True)
    s.line(580, 156, 626, 156, "var(--cu-teal)", 1.4)
    s.line(626, 126, 626, 228, "var(--cu-teal)", 1.4)
    return s.render()


def context_window():
    s = Svg(760, 280, "What fills the context window",
            "System prompt, tools, memory, skills and the conversation share one fixed token budget")
    x, y, w, h = 30, 70, 700, 52
    segs = [("System", 0.05, "plain"), ("Tools", 0.08, "purple"), ("CLAUDE.md", 0.04, "teal"),
            ("Skills", 0.04, "orange"), ("Conversation + files + results", 0.46, "teal")]
    cx = x
    for label, frac, col in segs:
        sw = w * frac
        s.parts.append(f'<rect x="{cx}" y="{y}" width="{sw}" height="{h}" fill="{__import__("svgkit").ACCENTS[col]}" fill-opacity="0.22" stroke="{__import__("svgkit").ACCENTS[col]}" stroke-width="1.4"/>')
        if sw > 110:
            s.text(cx + sw / 2, y + 31, label, 12.5, 700)
        cx += sw
    s.rect(cx, y, x + w - cx, h, r=0, fill="none", stroke="var(--cu-border-soft)", dash="4 4")
    s.text(cx + (x + w - cx) / 2, y + 31, "Free space", 12.5, 600, fill="var(--cu-muted)")
    s.rect(x, y, w, h, r=6, fill="none", stroke="var(--cu-border-soft)", sw=1.8)
    # small labels for narrow segments
    cx = x
    for i, (label, frac, col) in enumerate(segs[:4]):
        sw = w * frac
        mid = cx + sw / 2
        ty = y - 34 if i % 2 else y - 12  # stagger so neighbouring labels never collide
        s.text(mid, ty, label, 10.5, 700, fill="var(--cu-muted)")
        if i % 2:
            s.line(mid, ty + 4, mid, y, "var(--cu-faint)", 1)
        cx += sw
    s.text(x, 150, "0 tokens", 11, 600, anchor="start", fill="var(--cu-faint)")
    s.text(x + w, 150, "≈ 200,000 tokens", 11, 600, anchor="end", fill="var(--cu-faint)")
    s.text(380, 25, "Illustrative proportions — run /context to see your real numbers", 11.5, 500, fill="var(--cu-faint)")
    s.node(30, 178, 215, 70, "/compact", "summarise history, keep the thread", "teal", mono=True)
    s.node(272, 178, 215, 70, "/clear", "start fresh for a new task", "purple", mono=True)
    s.node(514, 178, 216, 70, "Auto-compact", "triggers near the limit", "orange")
    return s.render()


def memory_loading():
    s = Svg(760, 300, "What Claude loads, and when",
            "Memory and tools load every session; skills and files load on demand; subagents are isolated")
    cols = [("Always loaded", "teal", ["System prompt", "Tool definitions", "CLAUDE.md memory", "MCP tool names"]),
            ("Loaded on demand", "purple", ["Skill body (when relevant)", "Files you @-mention", "Tool results", "Command output"]),
            ("Isolated", "orange", ["Subagent context", "Its own tools", "Returns a summary only", "Your chat stays small"])]
    for i, (title, col, items) in enumerate(cols):
        x = 18 + i * 246
        s.group(x, 16, 230, 268, title, col)
        for j, it in enumerate(items):
            s.node(x + 16, 46 + j * 58, 198, 46, it, None, col, size=12.5)
    return s.render()


def extension_map():
    s = Svg(760, 400, "Ways to extend Claude Code", "Tools, MCP, skills, subagents, hooks and slash commands around the core agent")
    s.circle(380, 200, 70, fill="var(--cu-teal)", stroke="var(--cu-teal)")
    s.parts[-1] = s.parts[-1].replace('fill="var(--cu-teal)"', 'fill="var(--cu-teal)" fill-opacity="0.16"')
    s.text(380, 196, "Claude Code", 15, 800)
    s.text(380, 216, "the agent loop", 11.5, 500, fill="var(--cu-muted)")
    items = [
        (20, 20, "Built-in tools", "Read · Edit · Bash · Grep", "plain", (170, 78)),
        (290, 10, "MCP servers", "connect external systems", "purple", None),
        (550, 20, "Skills", "reusable playbooks", "teal", (590, 78)),
        (20, 306, "Hooks", "run commands on events", "orange", (170, 322)),
        (290, 330, "Subagents", "delegated specialists", "purple", None),
        (550, 306, "Slash commands", "saved prompts", "plain", (590, 322)),
    ]
    for x, y, t, sub, col, _ in items:
        s.node(x, y, 190, 64, t, sub, col)
    for (x, y, *_), tgt in zip(items, [(318, 160), (380, 130), (442, 160), (318, 240), (380, 270), (442, 240)]):
        sx = x + 95
        sy = y + 64 if y < 150 else y
        s.arrow([(sx, sy), tgt], "plain", sw=1.4, dash="5 4")
    return s.render()


def permission_flow():
    s = Svg(760, 330, "How a permission decision is made", "A tool call is checked against deny rules, then allow rules, then the user is asked")
    s.node(20, 130, 150, 60, "Claude wants to", "run a tool", "plain")
    s.node(215, 130, 140, 60, "Deny rule?", "settings.json", "orange")
    s.node(400, 130, 140, 60, "Allow rule?", "settings.json", "teal")
    s.node(585, 130, 155, 60, "Ask you", "1 yes · 2 always · 3 no", "purple", size=12.5)
    s.arrow([(170, 160), (211, 160)], "plain")
    s.arrow([(355, 160), (396, 160)], "plain", "no", 376, 150)
    s.arrow([(540, 160), (581, 160)], "plain", "no", 561, 150)
    s.node(215, 38, 140, 50, "Blocked", "never runs", "red")
    s.arrow([(285, 130), (285, 92)], "red", "yes", 300, 114)
    s.node(400, 250, 140, 50, "Runs silently", None, "teal")
    s.arrow([(470, 190), (470, 246)], "teal", "yes", 486, 224)
    s.node(585, 250, 155, 50, "Runs once / saved", None, "purple")
    s.arrow([(662, 190), (662, 246)], "purple")
    s.text(20, 290, "Deny always wins over allow.", 12, 600, anchor="start", fill="var(--cu-muted)")
    return s.render()


def hooks_lifecycle():
    s = Svg(760, 250, "Hook lifecycle", "Hooks run shell commands before or after tool calls")
    s.node(20, 80, 130, 64, "Prompt", "you ask", "plain")
    s.node(190, 80, 150, 64, "PreToolUse", "can block the call", "orange", mono=True, size=12.5)
    s.node(380, 80, 120, 64, "Tool runs", "Edit / Bash", "teal")
    s.node(540, 80, 150, 64, "PostToolUse", "format, test, lint", "purple", mono=True, size=12.5)
    for a, b in [(150, 186), (340, 376), (500, 536)]:
        s.arrow([(a, 112), (b, 112)], "plain")
    s.arrow([(265, 144), (265, 196), (396, 196)], "red", "exit code 2", 330, 188, dash="5 4")
    s.node(400, 172, 290, 48, "Call blocked", "Claude is told why and adapts", "red", size=12.5)
    s.text(20, 30, "Hooks are deterministic: they always run, unlike an instruction in CLAUDE.md.", 12.5, 600, anchor="start", fill="var(--cu-muted)")
    return s.render()


def plan_mode():
    s = Svg(760, 230, "Plan mode workflow", "Explore read-only, draft a plan, review, approve, execute, verify")
    steps = [("Explore", "read-only", "teal"), ("Draft plan", "steps + files", "teal"), ("You review", "edit or reject", "orange"),
             ("Approve", "leave plan mode", "purple"), ("Execute", "edits allowed", "purple"), ("Verify", "run tests", "teal")]
    for i, (t, sub, col) in enumerate(steps):
        x = 14 + i * 124
        s.node(x, 70, 100, 70, t, sub, col, size=12.5)
        if i:
            s.arrow([(x - 22, 105), (x - 3, 105)], "plain")
    s.arrow([(446, 140), (446, 180), (194, 180), (194, 144)], "orange", "plan not right? revise before any code is written", 320, 200, dash="5 4")
    s.text(14, 38, "Use for multi-file changes, unfamiliar code, or anything you would not want to undo.", 12.5, 600, anchor="start", fill="var(--cu-muted)")
    return s.render()


def subagents():
    s = Svg(760, 330, "Subagents", "The main agent delegates to specialists that work in isolated contexts")
    s.node(280, 20, 200, 64, "Main conversation", "your context stays small", "teal")
    names = [("explorer", "maps the code", "purple"), ("tester", "writes + runs tests", "orange"), ("reviewer", "reads the diff", "teal")]
    for i, (t, sub, col) in enumerate(names):
        x = 40 + i * 240
        s.group(x - 14, 138, 218, 130, "own context", col)
        s.node(x, 168, 190, 62, t, sub, col, mono=True)
        s.arrow([(380, 84), (380, 112), (x + 95, 112), (x + 95, 134)], "plain", sw=1.6)
    s.text(380, 304, "Each returns only a summary, so long searches never clutter your main context.", 12.5, 600, fill="var(--cu-muted)")
    return s.render()


def checkpoints():
    s = Svg(760, 260, "Checkpoints and rewinding", "Claude Code saves checkpoints automatically; git commits make permanent ones")
    s.line(40, 110, 720, 110, "var(--cu-border-soft)", 3)
    pts = [(80, "start", "plain"), (230, "prompt 1", "teal"), (380, "prompt 2", "teal"), (530, "prompt 3", "orange"), (680, "now", "red")]
    for x, lab, col in pts:
        s.circle(x, 110, 11, fill="var(--cu-bg)", stroke={"plain": "var(--cu-faint)", "teal": "var(--cu-teal)", "orange": "var(--cu-orange)", "red": "#E5484D"}[col], sw=3)
        s.text(x, 90, lab, 12, 700)
    s.arrow([(680, 130), (680, 170), (380, 170), (380, 128)], "orange", "rewind", 530, 190, dash="6 4")
    s.pill(330, 205, 100, "code + chat", "teal")
    s.text(40, 40, "Rewind restores code, conversation, or both — it cannot undo what happened outside your files.", 12.5, 600, anchor="start", fill="var(--cu-muted)")
    s.node(500, 205, 220, 40, "git commit = permanent safety", None, "purple", size=12)
    return s.render()


ALL = {
    "series-map": series_map, "agent-loop": agent_loop, "chat-vs-agent": chat_vs_agent,
    "context-window": context_window, "memory-loading": memory_loading, "extension-map": extension_map,
    "permission-flow": permission_flow, "hooks-lifecycle": hooks_lifecycle, "plan-mode": plan_mode,
    "subagents": subagents, "checkpoints": checkpoints,
}
