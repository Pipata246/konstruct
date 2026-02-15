-- Bucket для медиа блога (фото, видео в постах)
insert into storage.buckets (id, name, public)
values ('blog-media', 'blog-media', true)
on conflict (id) do update set public = true;

create policy "Allow insert blog-media" on storage.objects
for insert with check (bucket_id = 'blog-media');

create policy "Allow read blog-media" on storage.objects
for select using (bucket_id = 'blog-media');
