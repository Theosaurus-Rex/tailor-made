import { writeFileSync } from "node:fs";
import { buildSnapshots } from "../src/domain/fixtures/challenge-snapshots";

const target = new URL("../src/domain/fixtures/challenges-v1.json", import.meta.url);
writeFileSync(target, `${JSON.stringify(buildSnapshots(), null, 2)}\n`);
console.log(`wrote ${target.pathname}`);
