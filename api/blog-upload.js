const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const BUCKET = 'blog-media';

function verifyInitData(initData) {
  if (!initData || !BOT_TOKEN) return false;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return false;
  params.delete('hash');
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const calculated = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  return calculated === hash;
}

function parseUserFromInitData(initData) {
  const params = new URLSearchParams(initData);
  const userStr = params.get('user');
  if (!userStr) return null;
  try {
    return JSON.parse(decodeURIComponent(userStr));
  } catch {
    return null;
  }
}

function verifySessionToken(token) {
  if (!token || !BOT_TOKEN) return null;
  try {
    const [headerB64, payloadB64, sig] = token.split('.');
    if (!headerB64 || !payloadB64 || !sig) return null;
    const expected = crypto.createHmac('sha256', BOT_TOKEN).update(`${headerB64}.${payloadB64}`).digest('base64url');
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload.sub;
  } catch {
    return null;
  }
}

async function resolveUserId(req) {
  const body = req.body || {};
  const initData = body.initData;
  const authHeader = req.headers?.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (initData && verifyInitData(initData)) {
    const tgUser = parseUserFromInitData(initData);
    if (!tgUser?.id) return null;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data } = await supabase.from('users').select('id').eq('telegram_id', tgUser.id).single();
    return data?.id ?? null;
  }
  if (token) return verifySessionToken(token);
  return null;
}

async function isAdmin(supabase, userId) {
  if (!userId) return false;
  const { data } = await supabase.from('users').select('administrator').eq('id', userId).single();
  return !!data?.administrator;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return res.status(500).json({ error: 'Server config error' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const userId = await resolveUserId({ body, headers: req.headers });
    if (!userId) return res.status(401).json({ error: 'Необходима авторизация' });
    if (!(await isAdmin(supabase, userId))) return res.status(403).json({ error: 'Только админ может загружать медиа' });

    const base64 = body.file;
    const filename = body.filename || 'file';
    const type = body.type || 'photo';
    if (!base64) return res.status(400).json({ error: 'Файл не указан' });

    const buf = Buffer.from(base64, 'base64');
    const ext = filename.split('.').pop() || (type === 'video' ? 'mp4' : 'jpg');
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data: upload, error } = await supabase.storage.from(BUCKET).upload(path, buf, {
      contentType: type === 'video' ? `video/${ext}` : `image/${ext}`,
      upsert: true,
    });
    if (error) {
      console.error('blog-upload error:', error);
      return res.status(500).json({ error: error.message || 'Ошибка загрузки' });
    }
    const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(upload.path);
    return res.status(200).json({ url: publicUrl.publicUrl, type });
  } catch (err) {
    console.error('blog-upload error:', err);
    return res.status(500).json({ error: err.message });
  }
};
