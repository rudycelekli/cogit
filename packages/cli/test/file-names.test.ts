import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../..", import.meta.url));

describe("source file names", () => {
  it("never differ only in case from a sibling module", () => {
    // macOS and Windows file systems ignore case, so `./graph.js` and `./Graph.js`
    // name one file there: TypeScript stops with TS1149/TS1261 and the bundler
    // picks either module. Git tracks both happily, so only a test catches it.
    const files = execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" })
      .split("\0")
      .filter((file) => /\.(c|m)?[jt]sx?$/.test(file));
    const seen = new Map<string, string>();
    const clashes: string[] = [];
    for (const file of files) {
      const key = file.replace(/\.(c|m)?[jt]sx?$/, "").toLowerCase();
      const other = seen.get(key);
      if (other !== undefined) clashes.push(`${other} <-> ${file}`);
      else seen.set(key, file);
    }
    expect(clashes).toEqual([]);
  });
});
