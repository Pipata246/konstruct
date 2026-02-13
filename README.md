# Бот Конструкт

1. Подключи репо к Vercel, задеплой
2. В Vercel → Project Settings → Environment Variables добавь:
   - `BOT_TOKEN` = токен от @BotFather
   - `BASE_URL` = твой URL (например `https://oleg-konstrukt.vercel.app`)
3. Redeploy (чтобы переменные подтянулись)
4. Открой в браузере: `https://твой-проект.vercel.app/api/setup-webhook`
   — должен вернуть `{"ok":true,"webhook_url":"..."}`
5. Отправь /start боту
