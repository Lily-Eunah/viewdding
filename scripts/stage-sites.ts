import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "out");
const dist = path.join(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "client"), { recursive: true });
await mkdir(path.join(dist, "server"), { recursive: true });
await cp(output, path.join(dist, "client"), { recursive: true });
await cp(
  path.join(root, "worker", "static-site.js"),
  path.join(dist, "server", "index.js"),
);

console.log("Staged static export for Sites deployment.");
