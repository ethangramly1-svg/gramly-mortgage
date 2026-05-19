import { createClient, type Client, type InValue, type Row } from "@libsql/client";

/**
 * Lazy libSQL singleton wrapped in a `prepare(sql).bind(...).first/.all/.run`
 * shape that mirrors the Cloudflare D1 binding API. Route handlers can be
 * portable across the two backends without conditional code.
 */

let _client: Client | null = null;

function getClient(): Client {
  if (_client) return _client;
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");
  _client = createClient({ url, authToken });
  return _client;
}

type Stmt = {
  bind: (...args: InValue[]) => BoundStmt;
};

type BoundStmt = {
  first<T = Row>(): Promise<T | null>;
  all<T = Row>(): Promise<{ results: T[] }>;
  run(): Promise<{ meta: { last_row_id: number | bigint; rows_written: number } }>;
};

function bindAndRun(sql: string, args: InValue[]): BoundStmt {
  const client = getClient();
  return {
    async first<T>() {
      const res = await client.execute({ sql, args });
      return (res.rows[0] as T | undefined) ?? null;
    },
    async all<T>() {
      const res = await client.execute({ sql, args });
      return { results: res.rows as T[] };
    },
    async run() {
      const res = await client.execute({ sql, args });
      return {
        meta: {
          last_row_id: res.lastInsertRowid ?? 0,
          rows_written: res.rowsAffected,
        },
      };
    },
  };
}

export function getDB() {
  return {
    prepare(sql: string): Stmt {
      return { bind: (...args: InValue[]) => bindAndRun(sql, args) };
    },
  };
}
