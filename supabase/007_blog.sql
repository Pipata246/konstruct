-- Блог: посты (только админ) и комментарии (пользователи)
create table if not exists blog_posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references users(id) on delete set null,
  title_ru text not null default '',
  title_en text not null default '',
  body_ru text not null default '',
  body_en text not null default '',
  media jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists blog_posts_created_at_idx on blog_posts(created_at desc);

create table if not exists blog_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid not null references blog_posts(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  author_name text not null default '',
  text text not null default '',
  created_at timestamptz default now()
);

create index if not exists blog_comments_post_id_idx on blog_comments(post_id);

alter table blog_posts enable row level security;
alter table blog_comments enable row level security;

create policy "Allow read blog_posts" on blog_posts for select using (true);
create policy "Allow read blog_comments" on blog_comments for select using (true);
create policy "Allow insert blog_comments" on blog_comments for insert with check (true);
create policy "Allow insert blog_posts" on blog_posts for insert with check (true);
