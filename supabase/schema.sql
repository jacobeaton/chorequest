-- ============================================================
-- ChoreQuest — Supabase Schema
-- Paste this entire file into the Supabase SQL Editor and run.
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Tables ───────────────────────────────────────────────────

-- Parent settings (one row per parent, created on first login)
create table public.parent_settings (
  parent_id   uuid primary key references auth.users(id) on delete cascade,
  pin         text    not null default '1234',
  sound_on    boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Kid profiles (many per parent)
create table public.kids (
  id                        uuid primary key default gen_random_uuid(),
  parent_id                 uuid not null references auth.users(id) on delete cascade,
  name                      text not null,
  total_xp_earned           integer not null default 0,
  coins                     integer not null default 0,
  account_level             integer not null default 0,
  active_character_id       text,
  current_streak            integer not null default 0,
  last_completion_date      date,
  last_photo_submission_date date,
  created_at                timestamptz not null default now()
);

-- Characters owned by a kid
create table public.kid_characters (
  id                   uuid primary key default gen_random_uuid(),
  kid_id               uuid not null references public.kids(id) on delete cascade,
  character_id         text not null,                          -- 'pyro', 'glacie', etc.
  level                integer not null default 1,
  xp                   integer not null default 0,
  evolution_stage      integer not null default 0,
  happiness            integer not null default 80,
  last_interaction_date date not null default current_date,
  nickname             text,
  created_at           timestamptz not null default now(),
  unique(kid_id, character_id)
);

-- Chores (shared across the family; assigned_kid_id = null means any kid can do it)
create table public.chores (
  id                 uuid primary key default gen_random_uuid(),
  parent_id          uuid not null references auth.users(id) on delete cascade,
  assigned_kid_id    uuid references public.kids(id) on delete set null,
  name               text not null,
  emoji              text not null,
  estimated_minutes  integer not null,
  points             integer not null,
  coins              integer not null,
  difficulty         text not null check (difficulty in ('easy','medium','hard')),
  created_by         text not null check (created_by in ('parent','kid')),
  created_at         timestamptz not null default now()
);

-- Pending completions (submitted by kid, awaiting parent approval)
create table public.pending_completions (
  id            uuid primary key default gen_random_uuid(),
  kid_id        uuid not null references public.kids(id) on delete cascade,
  chore_id      uuid references public.chores(id) on delete set null,
  chore_name    text not null,
  chore_emoji   text not null,
  character_id  text not null,
  time_taken    integer not null,                              -- seconds
  beat_timer    boolean not null default false,
  streak_active boolean not null default false,
  xp            integer not null,
  coins         integer not null,
  submitted_at  timestamptz not null default now(),
  status        text not null default 'pending'
                  check (status in ('pending','approved','rejected'))
);

-- Approved completions (permanent history)
create table public.completions (
  id            uuid primary key default gen_random_uuid(),
  kid_id        uuid not null references public.kids(id) on delete cascade,
  chore_id      uuid references public.chores(id) on delete set null,
  character_id  text not null,
  time_taken    integer not null,
  points_earned integer not null,
  coins_earned  integer not null,
  bonus_applied boolean not null default false,
  completed_at  timestamptz not null default now()
);

-- Photo queue (room-clean photos submitted for Lumin pulls)
create table public.photo_queue (
  id           uuid primary key default gen_random_uuid(),
  kid_id       uuid not null references public.kids(id) on delete cascade,
  photo_path   text,                                          -- storage path, nulled after deletion
  submitted_at timestamptz not null default now(),
  status       text not null default 'pending'
                 check (status in ('pending','approved','rejected')),
  pull_result  text,                                          -- character_id on win, null on miss
  claimed      boolean not null default false
);

-- Custom real-world rewards (set by parent)
create table public.custom_rewards (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  emoji       text not null,
  description text not null default '',
  coin_cost   integer not null,
  created_at  timestamptz not null default now()
);

-- Reward redemptions (kid buys a reward, parent fulfils it)
create table public.reward_redemptions (
  id                  uuid primary key default gen_random_uuid(),
  kid_id              uuid not null references public.kids(id) on delete cascade,
  reward_id           uuid references public.custom_rewards(id) on delete set null,
  reward_name         text not null,
  reward_emoji        text not null,
  reward_description  text not null default '',
  coin_cost           integer not null,
  purchased_at        timestamptz not null default now(),
  status              text not null default 'pending'
                        check (status in ('pending','fulfilled','rejected'))
);

-- Kid notifications (drives real-time updates on the kid device)
create table public.kid_notifications (
  id         uuid primary key default gen_random_uuid(),
  kid_id     uuid not null references public.kids(id) on delete cascade,
  type       text not null,                                   -- 'chore_approved' | 'chore_rejected' | 'reward_fulfilled' | 'reward_rejected' | 'photo_reviewed'
  payload    jsonb not null default '{}',
  dismissed  boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────

create index on public.kids (parent_id);
create index on public.kid_characters (kid_id);
create index on public.chores (parent_id);
create index on public.chores (assigned_kid_id);
create index on public.pending_completions (kid_id, status);
create index on public.completions (kid_id);
create index on public.photo_queue (kid_id, status);
create index on public.custom_rewards (parent_id);
create index on public.reward_redemptions (kid_id, status);
create index on public.kid_notifications (kid_id, dismissed);

-- ── Row Level Security ───────────────────────────────────────

alter table public.parent_settings      enable row level security;
alter table public.kids                 enable row level security;
alter table public.kid_characters       enable row level security;
alter table public.chores               enable row level security;
alter table public.pending_completions  enable row level security;
alter table public.completions          enable row level security;
alter table public.photo_queue          enable row level security;
alter table public.custom_rewards       enable row level security;
alter table public.reward_redemptions   enable row level security;
alter table public.kid_notifications    enable row level security;

-- Helper: is this kid owned by the authed parent?
create or replace function public.kid_belongs_to_me(p_kid_id uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from public.kids
    where id = p_kid_id and parent_id = auth.uid()
  );
$$;

-- parent_settings
create policy "parent_settings: own row" on public.parent_settings
  for all using (parent_id = auth.uid());

-- kids
create policy "kids: own kids" on public.kids
  for all using (parent_id = auth.uid());

-- kid_characters
create policy "kid_characters: via parent" on public.kid_characters
  for all using (public.kid_belongs_to_me(kid_id));

-- chores
create policy "chores: own chores" on public.chores
  for all using (parent_id = auth.uid());

-- pending_completions
create policy "pending_completions: via parent" on public.pending_completions
  for all using (public.kid_belongs_to_me(kid_id));

-- completions
create policy "completions: via parent" on public.completions
  for all using (public.kid_belongs_to_me(kid_id));

-- photo_queue
create policy "photo_queue: via parent" on public.photo_queue
  for all using (public.kid_belongs_to_me(kid_id));

-- custom_rewards
create policy "custom_rewards: own rewards" on public.custom_rewards
  for all using (parent_id = auth.uid());

-- reward_redemptions
create policy "reward_redemptions: via parent" on public.reward_redemptions
  for all using (public.kid_belongs_to_me(kid_id));

-- kid_notifications
create policy "kid_notifications: via parent" on public.kid_notifications
  for all using (public.kid_belongs_to_me(kid_id));

-- ── Storage bucket ───────────────────────────────────────────
-- Run this separately if the bucket doesn't already exist.

insert into storage.buckets (id, name, public)
values ('room-photos', 'room-photos', false)
on conflict do nothing;

-- Parents can upload photos for their kids
create policy "room-photos: parent upload"
  on storage.objects for insert
  with check (
    bucket_id = 'room-photos'
    and auth.uid() is not null
  );

-- Parents can read and delete photos in their folder
create policy "room-photos: parent read"
  on storage.objects for select
  using (bucket_id = 'room-photos' and auth.uid() is not null);

create policy "room-photos: parent delete"
  on storage.objects for delete
  using (bucket_id = 'room-photos' and auth.uid() is not null);
