import { rm } from "node:fs/promises";
import path from "node:path";

export default async function globalSetup() {
  const target = path.resolve(process.cwd(), ".e2e-data");
  if (path.basename(target) !== ".e2e-data" || path.dirname(target) !== process.cwd()) throw new Error("Répertoire E2E inattendu");
  await rm(target, { recursive: true, force: true });
}
