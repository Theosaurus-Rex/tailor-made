import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { format, resolveConfig } from "prettier";
import { buildSnapshots } from "../src/domain/fixtures/challenge-snapshots";

const target = fileURLToPath(new URL("../src/domain/fixtures/challenges-v1.json", import.meta.url));
const options = (await resolveConfig(target)) ?? {};
const json = await format(JSON.stringify(buildSnapshots(), null, 2), {
  ...options,
  filepath: target,
});
writeFileSync(target, json);
console.log(`wrote ${target}`);
