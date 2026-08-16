#!/usr/bin/env bash
set -euo pipefail

BRANCH="feat/complete-app"
BASE="main"
REMOTE="origin"
CREATE_PR=${1:-"yes"} # pass "no" to skip automatic PR creation

# Safety: require clean working tree
if [ -n "$(git status --porcelain)" ]; then
  echo "Your working tree is not clean. Please commit/stash changes before running this script."
  git status --porcelain
  exit 1
fi

echo "Fetching remote..."
git fetch ${REMOTE} --prune

if git ls-remote --exit-code --heads ${REMOTE} ${BRANCH} >/dev/null 2>&1; then
  echo "Checking out remote branch ${BRANCH}..."
  git checkout -B ${BRANCH} ${REMOTE}/${BRANCH}
else
  echo "Creating branch ${BRANCH} from ${BASE}..."
  git checkout ${BASE}
  git pull ${REMOTE} ${BASE} || true
  git checkout -b ${BRANCH}
fi

echo "Writing files..."

# Ensure directories exist
mkdir -p src/api src/components src/routes api/director api/projects tmp .github/workflows tests/unit tests/e2e

cat > src/api/client.ts <<'EOF'
const API_BASE = "/api";

async function request(path, opts = {}) {
  const res = await fetch(API_BASE + path, Object.assign({ headers: { "Content-Type": "application/json" } }, opts));
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API ${path} error: ${res.status} ${txt}`);
  }
  return res.json().catch(() => null);
}

export default {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
};
EOF

cat > src/components/TimelineStore.tsx <<'EOF'
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";
import mockTimeline from "../data/mock-timeline";

const TimelineContext = createContext<any>(null);
export function useTimeline() { return useContext(TimelineContext); }

export default function TimelineStore({ children, projectId = "demo" }: any) {
  const [project, setProject] = useState<any>(null);
  const [patches, setPatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      try {
        const projectResp = await api.get(`/projects/${projectId}`).catch(() => null);
        const patchesResp = await api.get(`/projects/${projectId}/patches`).catch(() => ({ patches: [] }));
        if (!alive) return;
        setProject(projectResp?.project || mockTimeline);
        setPatches(patchesResp?.patches || []);
      } catch (e) {
        console.error("TimelineStore load error", e);
        setProject(mockTimeline);
        setPatches([]);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [projectId]);

  async function applyPatch(patch: any) {
    setPatches((p) => [patch, ...p]);
    try {
      await api.post(`/projects/${projectId}/patches`, { patch }).catch(() => null);
    } catch (e) {
      console.error("persist patch failed", e);
    }
  }

  async function clearPatches() {
    setPatches([]);
  }

  return (
    <TimelineContext.Provider value={{ project, patches, applyPatch, setProject, loading, clearPatches }}>
      {children}
    </TimelineContext.Provider>
  );
}
EOF

cat > src/components/ChangePatchEngine.tsx <<'EOF'
type Subscriber = () => void;

class ChangePatchEngine {
  private applied: any[] = [];
  private history: any[] = [];
  private subs: Subscriber[] = [];

  apply(patch: any) {
    this.applied.unshift(patch);
    this.history.push({ action: "apply", patch });
    this.emit();
    return patch;
  }

  getApplied() {
    return this.applied.slice();
  }

  undo() {
    const entry = this.history.pop();
    if (!entry) return null;
    if (entry.action === "apply") {
      const idx = this.applied.findIndex((p) => p.id === entry.patch.id);
      if (idx >= 0) this.applied.splice(idx, 1);
      this.emit();
      return entry.patch;
    }
    return null;
  }

  clear() {
    this.applied = [];
    this.history = [];
    this.emit();
  }

  subscribe(cb: Subscriber) {
    this.subs.push(cb);
    return () => this.unsubscribe(cb);
  }

  unsubscribe(cb: Subscriber) {
    this.subs = this.subs.filter((s) => s !== cb);
  }

  private emit() {
    for (const s of this.subs) s();
  }
}

export default ChangePatchEngine;
EOF

cat > src/routes/director-demo.tsx <<'EOF'
import React, { useState } from "react";
import DirectorModal from "../components/DirectorModal";
import TimelineDemo from "./timeline-demo";
import TimelineStore, { useTimeline } from "../components/TimelineStore";
import "../styles/director.css";

function DirectorDemoInner() {
  const { patches, applyPatch, clearPatches } = useTimeline();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0 }}>Director Prototype — Demo (Integrated)</h2>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>Open the modal to explore variant suggestions, preview and apply.</div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn" onClick={() => setOpen(true)}>Open Director</button>
          <button className="btn" onClick={() => clearPatches()}>Clear Applied</button>
        </div>
      </div>

      <TimelineDemo />

      <div style={{ marginTop: 24 }}>
        <h3>Applied patches (persisted)</h3>
        <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
          {patches.length === 0 && <div style={{ color: "var(--muted)" }}>No applied patches yet</div>}
          {patches.map((p: any) => (
            <div key={p.id} style={{ background: "rgba(255,255,255,0.02)", padding: 8, borderRadius: 8 }}>
              <div style={{ fontWeight: 700 }}>{p.name}</div>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>Applied at: {p.appliedAt}</div>
              <pre style={{ marginTop: 8 }}>{JSON.stringify(p.proposal, null, 2)}</pre>
            </div>
          ))}
        </div>
      </div>

      <DirectorModal open={open} onClose={() => setOpen(false)} context={{ location: "director-demo" }} onApplyPatch={(patch: any) => applyPatch(patch)} />
    </div>
  );
}

export default function DirectorDemoRoute() {
  return (
    <TimelineStore>
      <DirectorDemoInner />
    </TimelineStore>
  );
}
EOF

cat > api/director/analyze.js <<'EOF'
const fs = require("fs");

// Simple demo analysis endpoint.
module.exports = (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const { context } = req.body || {};
  const prompt = (context && context.prompt) || "";
  const base = prompt.substring(0, 60);
  const variants = [
    { id: "conservative", name: "Conservative", summary: "Small edits", proposal: { pacing: "+5%", color: "subtle warmth", sound: "dialogue +2dB" }, planJson: {} },
    { id: "cinematic", name: "Cinematic", summary: "Cinematic grade", proposal: { pacing: "+18%", color: "lift -6, gamma +4, gain +8", sound: "reduce music -6dB on speech" }, planJson: {} },
    { id: "high-energy", name: "High-energy", summary: "Aggressive cuts", proposal: { pacing: "+35%", color: "high saturation", sound: "music +4dB, sidechain on dialogue" }, planJson: {} },
  ];

  res.setHeader("Content-Type", "application/json");
  return res.status(200).send(JSON.stringify({ variants, meta: { promptSnippet: base, generatedAt: new Date().toISOString() } }));
};
EOF

cat > api/projects/[projectId]/patches.js <<'EOF'
const fs = require("fs");
const path = require("path");
const STORE = path.resolve(process.cwd(), "tmp/patch-store.json");

function load() {
  try {
    if (!fs.existsSync(STORE)) fs.writeFileSync(STORE, JSON.stringify({}));
    const raw = fs.readFileSync(STORE, "utf8");
    return JSON.parse(raw || "{}");
  } catch (e) {
    console.error(e);
    return {};
  }
}

function save(data) {
  fs.writeFileSync(STORE, JSON.stringify(data, null, 2));
}

module.exports = (req, res) => {
  const projectId = req.query && req.query.projectId ? req.query.projectId : (req.params && req.params.projectId) || "demo";
  if (req.method === "GET") {
    const all = load();
    return res.json({ patches: all[projectId] || [] });
  }

  if (req.method === "POST") {
    const { patch } = req.body || {};
    const all = load();
    all[projectId] = all[projectId] || [];
    all[projectId].unshift(patch);
    save(all);
    return res.json({ success: true, patch });
  }

  return res.status(405).end();
};
EOF

cat > tmp/patch-store.json <<'EOF'
{}
EOF

cat > .github/workflows/ci.yml <<'EOF'
name: CI
on:
  push:
    branches: [ main, feat/* ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install
        run: |
          npm ci
      - name: Lint (if configured)
        run: |
          npm run lint --if-present
      - name: Test
        run: |
          npm test --if-present
      - name: Build
        run: |
          npm run build --if-present
EOF

cat > tests/unit/changePatchEngine.test.js <<'EOF'
const assert = require('assert');
const ChangePatchEngine = require('../../src/components/ChangePatchEngine').default || require('../../src/components/ChangePatchEngine');

describe('ChangePatchEngine', () => {
  it('applies and undoes patches', () => {
    const engine = new ChangePatchEngine();
    const patch = { id: 'p1', name: 'test' };
    engine.apply(patch);
    const applied = engine.getApplied();
    assert.strictEqual(applied.length, 1);
    assert.strictEqual(applied[0].id, 'p1');

    const undone = engine.undo();
    assert.strictEqual(undone.id, 'p1');
    assert.strictEqual(engine.getApplied().length, 0);
  });
});
EOF

cat > tests/e2e/director.spec.js <<'EOF'
const { test, expect } = require('@playwright/test');

test('director demo flow', async ({ page }) => {
  await page.goto('http://localhost:5173/director-demo');
  await page.click('text=Open Director');
  await page.waitForSelector('.director-modal');
  await page.click('text=Apply');
  await expect(page.locator('text=Applied patches (persisted)')).toBeVisible();
});
EOF

echo "Staging files..."
git add -A
git commit -m "feat(complete): add timeline store, api client, serverless demo endpoints, enhanced patch engine, CI and tests stubs"

echo "Pushing branch ${BRANCH}..."
git push ${REMOTE} ${BRANCH} --set-upstream

if [ "${CREATE_PR}" = "yes" ]; then
  if command -v gh >/dev/null 2>&1; then
    echo "Creating PR with gh..."
    gh pr create --base ${BASE} --head ${BRANCH} --title "feat(complete): integrate Director, timeline persistence, API & CI" --body "$(cat PR_DIRECTOR_PROTOTYPE.md 2>/dev/null || echo 'Director complete app work')"
    echo "PR created (if gh authenticated)."
  else
    echo "'gh' CLI not found; please create a PR manually or install GitHub CLI."
    echo "To create PR manually: visit:"
    echo "https://github.com/$(git remote get-url origin | sed -E 's/.*github.com[:/](.*)\\.git/\\1/'):compare/${BASE}...${BRANCH}"
  fi
fi

echo "Done."
