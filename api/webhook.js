const BOT_TOKEN = process.env.BOT_TOKEN;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (!BOT_TOKEN) return res.status(500).json({ error: 'BOT_TOKEN not set' });

  try {
    const update = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const msg = update?.message;
    if (!msg || (msg.text || '').trim() !== '/start') {
      return res.status(200).json({ ok: true });
    }

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: msg.chat.id,
        text: 'Привет! 👋\n\nСервис «Конструкт» — помогаю собрать официальный запрос в управляющую компанию по 402-ФЗ. Открывай мини-приложение и заполняй форму по шагам: получишь черновик письма и готовый PDF.',
        parse_mode: 'HTML'
      })
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(200).json({ ok: true });
  }
};
