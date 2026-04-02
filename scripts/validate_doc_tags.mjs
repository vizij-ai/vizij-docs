#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const repoRoot = "/home/chris/Code/Semio/vizij_ws/vizij-docs";
const scopeRoots = [
  path.join(repoRoot, "README.md"),
  path.join(repoRoot, "AGENTS.md"),
  path.join(repoRoot, "project_documenting_guide.md"),
  path.join(repoRoot, "active_projects"),
  path.join(repoRoot, "backlog"),
  path.join(repoRoot, "current_documentation"),
  path.join(repoRoot, "workshops"),
];

const allowed = {
  project_status: new Set(["proposal", "planning", "tracking", "blocked", "completed", "archived"]),
  editorial_status: new Set(["seeded", "mapped", "drafting", "completed"]),
  publication_status: new Set(["planned", "live", "retired"]),
  workshop_kind: new Set(["reusable", "production", "evidence"]),
  workshop_status: new Set(["drafting", "ready", "delivered", "archived"]),
};

const lastUpdatedPattern = /^> \*\*Last updated:\*\* \d{4}-\d{2}-\d{2}$/;

function walk(entry) {
  const stat = fs.statSync(entry);
  if (stat.isFile()) {
    return entry.endsWith(".md") ? [entry] : [];
  }
  const out = [];
  for (const child of fs.readdirSync(entry)) {
    out.push(...walk(path.join(entry, child)));
  }
  return out;
}

function expectedFamily(file) {
  const rel = path.relative(repoRoot, file);
  if (rel.startsWith("current_documentation/guidebook/")) {
    return "guidebook";
  }
  if (rel.startsWith("workshops/")) {
    return "workshop";
  }
  if (rel.startsWith("current_documentation/")) {
    return "reference";
  }
  if (rel.startsWith("active_projects/") || rel.startsWith("backlog/")) {
    return "project";
  }
  if (rel === "README.md" || rel === "AGENTS.md" || rel === "project_documenting_guide.md") {
    return "reference";
  }
  return null;
}

function parseTags(line) {
  const match = line.match(/^<!-- tags:\s*(.*?)\s*-->$/);
  if (!match) {
    return null;
  }
  const tags = {};
  for (const segment of match[1].split(";")) {
    const trimmed = segment.trim();
    if (!trimmed) continue;
    const [key, ...rest] = trimmed.split("=");
    tags[key.trim()] = rest.join("=").trim();
  }
  return tags;
}

const files = scopeRoots.flatMap(walk).sort();
const errors = [];

for (const file of files) {
  const rel = path.relative(repoRoot, file);
  const family = expectedFamily(file);
  if (!family) continue;

  const content = fs.readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);
  const firstLines = lines.slice(0, 4);
  const tagLine = firstLines.find((line) => line.startsWith("<!-- tags:"));

  if (!tagLine) {
    errors.push(`${rel}: missing top-level tag comment`);
    continue;
  }

  const tags = parseTags(tagLine);
  if (!tags) {
    errors.push(`${rel}: malformed tag comment`);
    continue;
  }

  if ("status" in tags) {
    errors.push(`${rel}: generic status= is not allowed`);
  }

  for (const field of ["family", "type", "topics"]) {
    if (!tags[field]) {
      errors.push(`${rel}: missing required ${field}=`);
    }
  }

  if (tags.family && tags.family !== family) {
    errors.push(`${rel}: expected family=${family}, found family=${tags.family}`);
  }

  if (family === "project") {
    if (!tags.project_status) {
      errors.push(`${rel}: missing required project_status=`);
    } else if (!allowed.project_status.has(tags.project_status)) {
      errors.push(`${rel}: invalid project_status=${tags.project_status}`);
    }
  }

  if (family === "guidebook") {
    if (!tags.editorial_status) {
      errors.push(`${rel}: missing required editorial_status=`);
    } else if (!allowed.editorial_status.has(tags.editorial_status)) {
      errors.push(`${rel}: invalid editorial_status=${tags.editorial_status}`);
    }
    if (!tags.publication_status) {
      errors.push(`${rel}: missing required publication_status=`);
    } else if (!allowed.publication_status.has(tags.publication_status)) {
      errors.push(`${rel}: invalid publication_status=${tags.publication_status}`);
    }
  }

  if (family === "reference") {
    for (const disallowed of ["project_status", "editorial_status", "publication_status", "workshop_kind", "workshop_status"]) {
      if (tags[disallowed]) {
        errors.push(`${rel}: ${disallowed}= is not valid for family=reference`);
      }
    }
  }

  if (family === "workshop") {
    if (!tags.workshop_kind) {
      errors.push(`${rel}: missing required workshop_kind=`);
    } else if (!allowed.workshop_kind.has(tags.workshop_kind)) {
      errors.push(`${rel}: invalid workshop_kind=${tags.workshop_kind}`);
    }
    if (!tags.workshop_status) {
      errors.push(`${rel}: missing required workshop_status=`);
    } else if (!allowed.workshop_status.has(tags.workshop_status)) {
      errors.push(`${rel}: invalid workshop_status=${tags.workshop_status}`);
    }
  }

  const lastUpdatedIndex = lines.findIndex((line, index) => index < 20 && lastUpdatedPattern.test(line.trim()));
  if (lastUpdatedIndex === -1) {
    errors.push(`${rel}: missing standardized > **Last updated:** YYYY-MM-DD line near top of file`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${files.length} markdown files in scope.`);
