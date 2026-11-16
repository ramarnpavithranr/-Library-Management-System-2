import { Pool, QueryResult, QueryResultRow } from 'pg';
import dns from 'dns';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (_) {}

let pool: Pool | null = null;

/**
 * Standard PostgreSQL Connection Pool
 * Note: Core application features communicate directly with Supabase via the official
 * @supabase/supabase-js HTTPS client to ensure maximum reliability and avoid serverless
 * TLS connection pool issues.
 */
export function getDbPool(): Pool {
  if (pool) return pool;

  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DIRECT_URL;

  if (connectionString) {
    pool = new Pool({
      connectionString,
      ssl: true,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  } else {
    pool = new Pool({
      host: process.env.PGHOST || process.env.DB_HOST || 'aws-0-ap-northeast-2.pooler.supabase.com',
      port: Number(process.env.PGPORT || process.env.DB_PORT || 5432),
      database: process.env.PGDATABASE || process.env.DB_NAME || 'postgres',
      user: process.env.PGUSER || process.env.DB_USER,
      password: process.env.PGPASSWORD || process.env.DB_PASSWORD,
      ssl: true,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }

  pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err);
  });

  return pool;
}

export async function query<R extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<R>> {
  const dbPool = getDbPool();
  return dbPool.query<R>(text, params);
}
