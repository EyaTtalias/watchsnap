/**
 * Sets Vercel env vars cleanly via the REST API — avoids stdin newline issues.
 * Usage: node set-env.js <token>
 * Token comes from: node vercel-deploy.js whoami (reads ~/.local/share/com.vercel.cli/auth.json)
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const vars = [
  { key: 'NEXT_PUBLIC_PADDLE_ENV',                  value: 'production',                               type: 'plain', target: ['production','preview','development'] },
  { key: 'NEXT_PUBLIC_PADDLE_CLIENT_TOKEN',         value: 'live_cf504892502d94cbb21e2323aaa',         type: 'plain', target: ['production','preview','development'] },
  { key: 'NEXT_PUBLIC_PADDLE_MONTHLY_PRICE_ID',     value: 'pri_01krbgn8503wrkzgyya10t8e1j',           type: 'plain', target: ['production','preview','development'] },
  { key: 'NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID',      value: 'pri_01krbgxspzr5y9nkre3w9x0ryy',           type: 'plain', target: ['production','preview','development'] },
  { key: 'NEXT_PUBLIC_PADDLE_ANNUAL_PRICE_ID',      value: 'pri_01krbgxspzr5y9nkre3w9x0ryy',           type: 'plain',     target: ['production','preview','development'] },
  { key: 'PADDLE_WEBHOOK_SECRET',                   value: 'ntfset_01krbka1fch6v085d3hc2xk0sf',         type: 'encrypted', target: ['production','preview','development'] },
  { key: 'SUPABASE_SERVICE_ROLE_KEY',               value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpb2VmZWZ1Z3lna2psZGVxYm11Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODQzMDU3MiwiZXhwIjoyMDk0MDA2NTcyfQ.Ee90onf_BKxiZZE_AF8swr2TVCG-wD3rvWgeFRDkoUg', type: 'encrypted', target: ['production','preview','development'] },
];

// Read token from Vercel auth file
const authPaths = [
  path.join(process.env.APPDATA || '', 'xdg.data', 'com.vercel.cli', 'auth.json'),
  path.join(process.env.APPDATA || '', 'com.vercel.cli', 'auth.json'),
  path.join(process.env.LOCALAPPDATA || '', 'com.vercel.cli', 'auth.json'),
  path.join(process.env.HOME || '', '.local', 'share', 'com.vercel.cli', 'auth.json'),
];

let token = null;
for (const p of authPaths) {
  if (fs.existsSync(p)) {
    try { token = JSON.parse(fs.readFileSync(p, 'utf8')).token; break; } catch {}
  }
}

if (!token) {
  // Try reading from vercel config dir on Windows
  const confPath = path.join(process.env.APPDATA || '', 'Vercel', 'auth.json');
  if (fs.existsSync(confPath)) {
    try { token = JSON.parse(fs.readFileSync(confPath, 'utf8')).token; } catch {}
  }
}

if (!token) {
  console.error('Could not find Vercel token. Run: node vercel-deploy.js login first.');
  process.exit(1);
}

// Read project ID from .vercel/project.json
const projectJson = JSON.parse(fs.readFileSync('.vercel/project.json', 'utf8'));
const { projectId } = projectJson;

console.log(`Setting ${vars.length} env vars on project ${projectId}...`);

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.vercel.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  for (const v of vars) {
    const res = await apiRequest('POST', `/v10/projects/${projectId}/env?upsert=true`, {
      key: v.key,
      value: v.value,
      type: v.type,
      target: v.target,
    });
    if (res.status === 200 || res.status === 201) {
      console.log(`✓ ${v.key}`);
    } else {
      console.log(`✗ ${v.key} → ${res.status}: ${JSON.stringify(res.body).slice(0,120)}`);
    }
  }
  console.log('Done.');
})();
