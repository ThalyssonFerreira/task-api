import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { query } from '../../src/config/db.js';

function arg(name, fallback) {
  const key = `--${name}=`;
  const found = process.argv.find(a => a.startsWith(key));
  if (found) return found.slice(key.length);
  return process.env[name.toUpperCase().replace(/-/g, '_')] ?? fallback;
}

const mode = process.argv[2] ?? 'up'; // up | down
const adminEmail = arg('admin-email', 'admin@example.com');
const adminPass  = arg('admin-pass', 'Admin123!');
const adminName  = arg('admin-name', 'Admin');
const demo       = (arg('demo', 'false') + '').toLowerCase() === 'true';

async function ensureAdmin() {
  const password = await bcrypt.hash(adminPass, 10);
  const upsertSql = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, 'admin')
    ON CONFLICT (email)
    DO UPDATE SET role = EXCLUDED.role
    RETURNING id, email, role
  `;
  const { rows } = await query(upsertSql, [adminName, adminEmail, password]);
  return rows[0];
}

async function seedDemoTasks(adminId) {
  // cria 2 tasks de exemplo para o admin
  const sql = `
    INSERT INTO tasks (user_id, title, description, status)
    VALUES
      ($1, 'Configurar CI', 'Rodar lint e testes no GitHub Actions', 'in_progress'),
      ($1, 'Escrever documentação', 'Swagger/OpenAPI', 'pending')
    RETURNING id
  `;
  await query(sql, [adminId]);
}

async function removeAdmin() {
  await query('DELETE FROM users WHERE email = $1', [adminEmail]);
}

(async function main() {
  try {
    if (mode === 'down') {
      await removeAdmin();
      console.log(`✅ Admin removido: ${adminEmail}`);
      process.exit(0);
    }

    const admin = await ensureAdmin();
    console.log(`✅ Admin ok: ${admin.email} (id=${admin.id})`);

    if (demo) {
      await seedDemoTasks(admin.id);
      console.log('✅ Demo tasks criadas para o admin');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed falhou:', err);
    process.exit(1);
  }
})();
