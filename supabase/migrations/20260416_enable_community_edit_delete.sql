alter table public.community_posts
  add column if not exists browser_id text null;

drop policy if exists "Anyone can update community posts" on public.community_posts;
create policy "Anyone can update community posts"
  on public.community_posts
  for update
  using (true)
  with check (true);

drop policy if exists "Anyone can delete community posts" on public.community_posts;
create policy "Anyone can delete community posts"
  on public.community_posts
  for delete
  using (true);

drop policy if exists "Anyone can delete community comments" on public.community_post_comments;
create policy "Anyone can delete community comments"
  on public.community_post_comments
  for delete
  using (true);
