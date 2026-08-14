import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "apps/agios-command-center/src");
const output = resolve(root, "apps/agios-command-center/dist");
const checking = process.argv.includes("--check");
const targets = ["index.html", "assets/app.js", "assets/style.css", "assets/signal-room.css", "assets/app.css"];

async function produce(directory) {
  await mkdir(resolve(directory, "assets"), { recursive: true });
  await build({
    entryPoints: [resolve(source, "app.js")],
    absWorkingDir: root,
    outfile: resolve(directory, "assets/app.js"),
    bundle: true,
    preserveSymlinks: true,
    format: "esm",
    platform: "browser",
    target: ["es2022"],
    legalComments: "none",
  });
  await writeFile(resolve(directory, "assets/style.css"), await readFile(resolve(source, "style.css")));
  await writeFile(resolve(directory, "assets/signal-room.css"), await readFile(resolve(source, "signal-room.css")));
  await writeFile(resolve(directory, "index.html"), await readFile(resolve(source, "index.html")));
}

if (checking) {
  const temporary = resolve(root, ".agios-build-check");
  await rm(temporary, { recursive: true, force: true });
  await produce(temporary);
  for (const target of targets) {
    const expected = await readFile(resolve(output, target));
    const actual = await readFile(resolve(temporary, target));
    if (!expected.equals(actual)) throw new Error(`stale AGIOS frontend: ${target}`);
  }
  await rm(temporary, { recursive: true, force: true });
} else {
  await rm(output, { recursive: true, force: true });
  await produce(output);
}
