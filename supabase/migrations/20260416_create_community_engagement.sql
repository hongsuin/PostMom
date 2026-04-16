create table if not exists public.community_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  browser_id text null,
  author text not null default '익명',
  user_type text null check (user_type in ('student', 'parent', 'academy')),
  content text not null check (char_length(btrim(content)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists community_post_comments_post_id_idx
  on public.community_post_comments (post_id, created_at asc);

alter table public.community_post_comments enable row level security;

drop policy if exists "Community comments are viewable by everyone" on public.community_post_comments;
create policy "Community comments are viewable by everyone"
  on public.community_post_comments
  for select
  using (true);

drop policy if exists "Anyone can create community comments" on public.community_post_comments;
create policy "Anyone can create community comments"
  on public.community_post_comments
  for insert
  with check (true);

create table if not exists public.community_post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  browser_id text null,
  created_at timestamptz not null default now()
);

create unique index if not exists community_post_likes_user_unique_idx
  on public.community_post_likes (post_id, user_id)
  where user_id is not null;

create unique index if not exists community_post_likes_browser_unique_idx
  on public.community_post_likes (post_id, browser_id)
  where browser_id is not null;

create index if not exists community_post_likes_post_id_idx
  on public.community_post_likes (post_id);

alter table public.community_post_likes enable row level security;

drop policy if exists "Community likes are viewable by everyone" on public.community_post_likes;
create policy "Community likes are viewable by everyone"
  on public.community_post_likes
  for select
  using (true);

drop policy if exists "Anyone can create community likes" on public.community_post_likes;
create policy "Anyone can create community likes"
  on public.community_post_likes
  for insert
  with check (true);

drop policy if exists "Anyone can delete community likes" on public.community_post_likes;
create policy "Anyone can delete community likes"
  on public.community_post_likes
  for delete
  using (true);
