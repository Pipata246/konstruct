const { createClient } = require('@supabase/supabase-js');

// Публичный конфиг для фронта (Supabase anon key безопасен для клиента)
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const SUPABASE_URL = process.env.SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

  // Короткий кеш: шаблоны должны обновляться быстро
  res.setHeader('Cache-Control', 'public, max-age=300');

  let templates = [];
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data } = await supabase
        .from('templates')
        .select('id, name, description, content, sort_order, is_active')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
      templates = data || [];
    } catch {
      templates = [];
    }
  }

  res.json({
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
    templates,
  });
};
