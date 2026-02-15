-- Миграция: колонка для комментария эксперта при статусе "доработать"
-- Статусы заказа с проверкой эксперта:
--   in_review  — в работе (на проверке)
--   ready      — готов (можно скачать)
--   revision   — доработать (revision_comment обязателен)
alter table orders add column if not exists revision_comment text default '';
