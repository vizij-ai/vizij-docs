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

const skippedPrefixes = ["archive/"];
const markdownLinkPattern = /!?\[[^\]]*?\]\(([^)\s]+(?:\s+"[^"]*")?)\)/g;

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

function inScope(file) {
  const rel = path.relative(repoRoot, file);
  return !skippedPrefixes.some((prefix) => rel.startsWith(prefix));
}

function stripOptionalTitle(target) {
  const quoteIndex = target.indexOf(' "');
  return quoteIndex === -1 ? target : target.slice(0, quoteIndex);
}

function decodeTarget(target) {
  try {
    return decodeURIComponent(target);
  } catch {
    return target;
  }
}

function normalizeTarget(rawTarget) {
  return decodeTarget(stripOptionalTitle(rawTarget).trim());
}

function isExternalTarget(target) {
  return (
    target.startsWith("http://") ||
    target.startsWith("https://") ||
    target.startsWith("mailto:") ||
    target.startsWith("tel:") ||
    target.startsWith("data:") ||
    target.startsWith("javascript:")
  );
}

function targetExists(candidate) {
  if (fs.existsSync(candidate)) {
    return true;
  }
  if (candidate.endsWith("/")) {
    return fs.existsSync(path.join(candidate, "README.md"));
  }
  return fs.existsSync(path.join(candidate, "README.md"));
}

const files = scopeRoots.flatMap(walk).filter(inScope).sort();
const errors = [];

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const rel = path.relative(repoRoot, file);
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const match of line.matchAll(markdownLinkPattern)) {
      const rawTarget = match[1];
      const target = normalizeTarget(rawTarget);

      if (!target || target.startsWith("#") || isExternalTarget(target)) {
        continue;
      }

      const [filePart, fragment] = target.split("#", 2);
      if (!filePart) {
        continue;
      }

      const resolved = path.isAbsolute(filePart)
        ? path.normalize(filePart)
        : path.resolve(path.dirname(file), filePart);

      if (!path.isAbsolute(resolved)) {
        errors.push(`${rel}:${index + 1}: could not resolve target -> ${target}`);
        continue;
      }

      if (!targetExists(resolved)) {
        errors.push(`${rel}:${index + 1}: missing target -> ${target}`);
        continue;
      }

      if (fragment) {
        const actualFile = fs.statSync(resolved).isDirectory() ? path.join(resolved, "README.md") : resolved;
        if (actualFile.endsWith(".md")) {
          const body = fs.readFileSync(actualFile, "utf8");
          const slug = fragment
            .trim()
            .toLowerCase()
            .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
            .replace(/\s+/g, "-");
          if (slug && !body.toLowerCase().includes(`# ${fragment.toLowerCase()}`) && !body.toLowerCase().includes(`## ${fragment.toLowerCase()}`) && !body.toLowerCase().includes(`### ${fragment.toLowerCase()}`) && !body.toLowerCase().includes(`#### ${fragment.toLowerCase()}`) && !body.toLowerCase().includes(`##### ${fragment.toLowerCase()}`) && !body.toLowerCase().includes(`###### ${fragment.toLowerCase()}`) && !body.toLowerCase().includes(`id="${fragment.toLowerCase()}"`) && !body.toLowerCase().includes(`id='${fragment.toLowerCase()}'`) && !body.toLowerCase().includes(`(#${slug})`)) {
            const headings = body
              .split(/\r?\n/)
              .filter((entry) => /^#{1,6}\s+/.test(entry))
              .map((entry) =>
                entry
                  .replace(/^#{1,6}\s+/, "")
                  .trim()
                  .toLowerCase()
                  .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
                  .replace(/\s+/g, "-")
              );
            if (!headings.includes(slug)) {
              errors.push(`${rel}:${index + 1}: missing anchor -> ${target}`);
            }
          }
        }
      }
    }
  });
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated markdown links in ${files.length} maintained markdown files.`);
