#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const repoRoot = "/home/chris/Code/Semio/vizij_ws/vizij-docs";
const scope = [
  `${repoRoot}/current_documentation`,
  `${repoRoot}/backlog`,
];

const checks = [
  {
    description: "legacy unnamespaced /standard/... examples outside approved canonical forms",
    args: [
      "-n",
      "-P",
      "/standard/(?!vizij|\\{standard_namespace\\})",
      ...scope,
      "-g",
      "*.md",
    ],
  },
  {
    description: "runtime path examples missing the standard namespace segment",
    args: [
      "-n",
      "-P",
      "rig/\\{face(?:Id)?\\}/standard/(?!vizij|\\{standard_namespace\\})|rig/<face>/standard/(?!vizij)",
      ...scope,
      "-g",
      "*.md",
    ],
  },
];

const exceptions = [
  {
    path: `${repoRoot}/current_documentation/concepts/deeper_exploration/STANDARD_INPUTS.md`,
    textIncludes: "Legacy unnamespaced `/standard/...` examples may still appear",
  },
];

const failures = [];

for (const check of checks) {
  let output = "";
  try {
    output = execFileSync("rg", check.args, { encoding: "utf8" });
  } catch (error) {
    if (typeof error.stdout === "string") {
      output = error.stdout;
    }
    if (error.status !== 1) {
      throw error;
    }
  }

  const hits = output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => {
      const match = line.match(/^(.*?):(\d+):(.*)$/);
      if (!match) return true;

      const [, path, , text] = match;
      return !exceptions.some(
        (exception) =>
          exception.path === path && text.includes(exception.textIncludes),
      );
    });

  if (hits.length > 0) {
    failures.push(`${check.description}\n${hits.join("\n")}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n\n"));
  process.exit(1);
}

console.log("Validated standard-path examples in maintained docs.");
console.log(
  `Allowed legacy exception: ${exceptions[0].path} (${exceptions[0].textIncludes})`,
);
