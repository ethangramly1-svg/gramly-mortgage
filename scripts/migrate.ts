/* eslint-disable no-console */
import { createClient } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");

  const db = createClient({ url, authToken });

  await db.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const dir = path.join(process.cwd(), "migrations");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const applied = await db.execute("SELECT name FROM _migrations");
  const appliedSet = new Set(applied.rows.map((r) => r.name as string));

  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`  · ${file}  (skipped — already applied)`);
      continue;
    }

    const rawSql = fs.readFileSync(path.join(dir, file), "utf8");
    // Strip `--` line comments before splitting on `;` — otherwise a `;`
    // inside a comment turns one comment into two "statements" and the
    // parser chokes on the orphaned fragment.
    const sql = rawSql
      .split("\n")
      .map((line) => {
        const i = line.indexOf("--");
        return i === -1 ? line : line.slice(0, i);
      })
      .join("\n");
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      await db.execute(stmt);
    }
    await db.execute({
      sql: "INSERT INTO _migrations (name) VALUES (?)",
      args: [file],
    });
    console.log(`  ✓ ${file}`);
  }

  console.log(`\nMigrations applied. ${files.length} file(s) on disk; ${appliedSet.size + files.filter((f) => !appliedSet.has(f)).length} recorded.`);
}

main().catch((e) => {
  console.error("\nmigration failed:");
  console.error(e);
  process.exit(1);
});
