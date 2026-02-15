-- Разрешить обновление и удаление комментариев (проверка прав — в API)
create policy "Allow update blog_comments" on blog_comments for update using (true) with check (true);
create policy "Allow delete blog_comments" on blog_comments for delete using (true);

-- Разрешить обновление и удаление постов (проверка прав — в API)
create policy "Allow update blog_posts" on blog_posts for update using (true) with check (true);
create policy "Allow delete blog_posts" on blog_posts for delete using (true);
