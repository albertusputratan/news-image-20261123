// Monday 23 November 2026 — copy the rendered plate; do not rebuild it.
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const destDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
await mkdir(destDir, { recursive: true });
await copyFile(join(here, "entry.png"), join(destDir, "entry.png"));
