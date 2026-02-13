module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const token = process.env.BOT_TOKEN;
  const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.URL;

  if (!token) return res.status(500).json({ error: 'BOT_TOKEN not set' });
  if (!base) return res.status(500).json({ error: 'URL not set' });

  const webhookUrl = `${base}/api/webhook`;
  const r = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl })
  });
  const data = await r.json();

  return res.status(200).json(data.ok ? { ok: true, webhook_url: webhookUrl } : data);
};
