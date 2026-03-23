import { Pool } from "pg"

declare global {
  var postgresPool: Pool | undefined
}

export function getDbPool() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }

  if (!globalThis.postgresPool) {
    globalThis.postgresPool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : undefined,
    })
  }

  return globalThis.postgresPool
}
