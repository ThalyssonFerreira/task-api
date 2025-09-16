import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL ausente no .env');
}

export const pool = new Pool({ connectionString });

// helper simples
export async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}
