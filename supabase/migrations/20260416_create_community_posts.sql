create extension if not exists pgcrypto;

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  author text not null default '익명',
  user_type text null check (user_type in ('student', 'parent', 'academy')),
  region text not null check (region in ('위례', '태평')),
  title text not null check (char_length(btrim(title)) > 0),
  content text not null check (char_length(btrim(content)) > 0),
  tags text[] not null default '{}'::text[],
  mentioned_academies text[] not null default '{}'::text[],
  link_url text null,
  link_title text null,
  likes integer not null default 0,
  comments integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists community_posts_created_at_idx
  on public.community_posts (created_at desc);

alter table public.community_posts enable row level security;

drop policy if exists "Community posts are viewable by everyone" on public.community_posts;
create policy "Community posts are viewable by everyone"
  on public.community_posts
  for select
  using (true);

drop policy if exists "Anyone can create community posts" on public.community_posts;
create policy "Anyone can create community posts"
  on public.community_posts
  for insert
  with check (true);
