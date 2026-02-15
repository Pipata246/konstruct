-- Добавляем колонку administrator: true = админ, false = обычный пользователь
alter table users add column if not exists administrator boolean not null default false;

-- Назначить админом пользователя с telegram_id = 1940576257:
-- update users set administrator = true where telegram_id = 1940576257;
