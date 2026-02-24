-- Seed initial admin user
-- Password: changeme (PBKDF2 SHA-256, 100000 iterations)
-- IMPORTANT: Change this password immediately after first login
--
-- To generate a new hash, run the worker locally and use the login endpoint,
-- or use the following Node.js script:
--
--   const crypto = require('crypto');
--   const salt = crypto.randomBytes(16).toString('hex');
--   crypto.pbkdf2('YOUR_PASSWORD', salt, 100000, 64, 'sha256', (err, key) => {
--     console.log(salt + ':' + key.toString('hex'));
--   });

INSERT OR IGNORE INTO admin_users (id, email, password_hash, created_at)
VALUES (
  'admin-001',
  'admin@katlagroup.com',
  'REPLACE_WITH_GENERATED_HASH',
  datetime('now')
);
