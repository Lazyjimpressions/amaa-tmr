-- =============================================================================
-- AM&AA TMR – Initial Schema (auth.uid()-anchored RLS)
-- Safe to re-run; uses IF NOT EXISTS and guarded drops.
-- =============================================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";
create extension if not exists "vector";  -- for future embeddings/search

-- ---------- Helper: set search_path to public so names are unambiguous ----------
set search_path = public;

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Users/members joined to Supabase Auth (auth.users)
create table if not exists public.members (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid,                                 -- FK -> auth.users.id
  email             text unique not null,
  is_member         boolean default false,
  membership_level  text,
  hubspot_vid       text,
  company           text,
  created_at        timestamptz default now()
);

-- Link to auth.users (nullable so we can backfill progressively)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'members_user_id_fkey'
  ) then
    alter table public.members
      add constraint members_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete set null;
  end if;
end $$;

create index if not exists idx_members_user_id     on public.members(user_id);
create index if not exists idx_members_email_lower on public.members((lower(email)));

-- Survey containers (each reporting period)
create table if not exists public.surveys (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,               -- e.g. '2024-q3'
  title         text not null,
  year          int  not null,
  period_start  date,
  period_end    date,
  status        text not null default 'draft',      -- draft|open|closed|archived
  created_at    timestamptz default now(),
  constraint surveys_status_chk
    check (status in ('draft','open','closed','archived'))
);

-- Questions (versioned by stable "code")
create table if not exists public.survey_questions (
  id         uuid primary key default gen_random_uuid(),
  survey_id  uuid references public.surveys(id) on delete cascade,
  code       text not null,                -- stable key, e.g. DEAL_VOLUME
  version    int  not null default 1,      -- bump when wording/options change
  text       text not null,
  type       text not null,                -- single|multi|number|text
  options    jsonb,                        -- for single/multi (array of {key,label})
  section    text,
  "order"    int  default 0,
  created_at timestamptz default now(),
  unique (survey_id, code, version)
);

create index if not exists idx_questions_survey on public.survey_questions(survey_id);

-- One respondent submission (draft or final)
create table if not exists public.survey_responses (
  id            uuid primary key default gen_random_uuid(),
  survey_id     uuid references public.surveys(id) on delete cascade,
  user_id       uuid,                                     -- FK -> auth.users.id (respondent)
  respondent_hash text,                                   -- optional: hash(email+period)
  submitted_at  timestamptz,
  created_at    timestamptz default now(),
  source        text default 'web',                       -- web|import|api
  constraint responses_source_chk check (source in ('web','import','api'))
);

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'survey_responses_user_id_fkey'
  ) then
    alter table public.survey_responses
      add constraint survey_responses_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete set null;
  end if;
end $$;

create index if not exists idx_responses_survey  on public.survey_responses(survey_id);
create index if not exists idx_responses_user    on public.survey_responses(user_id);

-- Answers: one per (response, question)
create table if not exists public.survey_answers (
  id           uuid primary key default gen_random_uuid(),
  response_id  uuid references public.survey_responses(id) on delete cascade,
  question_id  uuid references public.survey_questions(id) on delete cascade,
  user_id      uuid,                                     -- shadow of owner, optional
  value_text   text,
  value_num    numeric,
  value_options jsonb,                                   -- array of option keys (for multi)
  created_at   timestamptz default now(),
  unique (response_id, question_id)
);

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'survey_answers_user_id_fkey'
  ) then
    alter table public.survey_answers
      add constraint survey_answers_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete set null;
  end if;
end $$;

create index if not exists idx_answers_response on public.survey_answers(response_id);
create index if not exists idx_answers_question on public.survey_answers(question_id);

-- AI Briefs saved for a member
create table if not exists public.ai_briefs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid,                                     -- FK -> auth.users.id (owner)
  member_email  text,                                     -- keep for HubSpot UX, not for RLS
  survey_id     uuid references public.surveys(id) on delete cascade,
  filters       jsonb,
  brief_md      text,
  created_at    timestamptz default now()
);

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'ai_briefs_user_id_fkey'
  ) then
    alter table public.ai_briefs
      add constraint ai_briefs_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

create index if not exists idx_ai_briefs_user    on public.ai_briefs(user_id);
create index if not exists idx_ai_briefs_email_l on public.ai_briefs((lower(member_email)));

-- Optional: embeddings for questions/sections (for RAG)
create table if not exists public.question_embeddings (
  id           uuid primary key default gen_random_uuid(),
  survey_id    uuid references public.surveys(id) on delete cascade,
  question_id  uuid references public.survey_questions(id) on delete cascade,
  embedding    vector(1536),
  meta         jsonb,
  created_at   timestamptz default now()
);

create index if not exists idx_qemb_survey on public.question_embeddings(survey_id);
create index if not exists idx_qemb_qid    on public.question_embeddings(question_id);

-- =============================================================================
-- RLS (Row-Level Security)
-- =============================================================================
alter table public.members          enable row level security;
alter table public.surveys          enable row level security;
alter table public.survey_questions enable row level security;
alter table public.survey_responses enable row level security;
alter table public.survey_answers   enable row level security;
alter table public.ai_briefs        enable row level security;
alter table public.question_embeddings enable row level security;

-- Drop any policies we might have created earlier (ignore if absent)
do $$
begin
  -- members
  begin execute 'drop policy "members_self_read_by_uid" on public.members'; exception when others then null; end;
  begin execute 'drop policy "members_read_all_auth" on public.members'; exception when others then null; end;

  -- surveys & questions
  begin execute 'drop policy "surveys_read_auth" on public.surveys'; exception when others then null; end;
  begin execute 'drop policy "questions_read_auth" on public.survey_questions'; exception when others then null; end;

  -- responses & answers
  begin execute 'drop policy "survey_responses_deny" on public.survey_responses'; exception when others then null; end;
  begin execute 'drop policy "survey_answers_deny" on public.survey_answers'; exception when others then null; end;

  -- ai_briefs
  begin execute 'drop policy "ai_briefs_self_select" on public.ai_briefs'; exception when others then null; end;
  begin execute 'drop policy "ai_briefs_self_insert" on public.ai_briefs'; exception when others then null; end;
  begin execute 'drop policy "ai_briefs_self_update" on public.ai_briefs'; exception when others then null; end;
  begin execute 'drop policy "ai_briefs_self_delete" on public.ai_briefs'; exception when others then null; end;

  -- embeddings (server-only)
  begin execute 'drop policy "qemb_deny" on public.question_embeddings'; exception when others then null; end;
end $$;

-- ---------- MEMBERS ----------
-- Users can read their own member row (when user_id is linked).
create policy "members_self_read_by_uid" on public.members
  for select
  using (user_id = auth.uid());

-- If you want admins/service role to write, do it via Edge Functions (service role bypasses RLS).

-- ---------- SURVEYS / QUESTIONS ----------
-- Allow any authenticated user to read survey meta and question text.
create policy "surveys_read_auth" on public.surveys
  for select
  using (auth.uid() is not null);

create policy "questions_read_auth" on public.survey_questions
  for select
  using (auth.uid() is not null);

-- ---------- RESPONSES / ANSWERS (server-only, never direct from client) ----------
-- Hard deny for clients; Edge Functions with service role perform writes/reads.
create policy "survey_responses_deny" on public.survey_responses
  for all using (false) with check (false);

create policy "survey_answers_deny" on public.survey_answers
  for all using (false) with check (false);

-- ---------- AI BRIEFS (user-owned) ----------
create policy "ai_briefs_self_select" on public.ai_briefs
  for select
  using (user_id = auth.uid());

create policy "ai_briefs_self_insert" on public.ai_briefs
  for insert
  with check (user_id = auth.uid());

create policy "ai_briefs_self_update" on public.ai_briefs
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "ai_briefs_self_delete" on public.ai_briefs
  for delete
  using (user_id = auth.uid());

-- ---------- QUESTION EMBEDDINGS (server-only) ----------
create policy "qemb_deny" on public.question_embeddings
  for all using (false) with check (false);

-- =============================================================================
-- TRIGGERS (auto-stamp user_id from JWT where client inserts are allowed)
-- =============================================================================

create or replace function public.set_auth_user_id()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;

-- We only allow client inserts on ai_briefs (others are server-only).
drop trigger if exists trg_ai_briefs_set_uid on public.ai_briefs;
create trigger trg_ai_briefs_set_uid
  before insert on public.ai_briefs
  for each row execute procedure public.set_auth_user_id();

-- =============================================================================
-- (Optional) RPCs for charts and "who am I"
-- =============================================================================

-- Who am I (by uid) – handy for quick checks (service role bypasses RLS anyway)
create or replace function public.me_rpc()
returns table(user_id uuid, email text, is_member boolean, membership_level text)
language sql
security definer
set search_path = public
as $$
  select m.user_id, m.email, m.is_member, coalesce(m.membership_level,'')::text
  from public.members m
  where m.user_id = auth.uid()
  limit 1;
$$;

-- Example aggregate for charts (adjust to your schema as needed)
create or replace function public.query_deal_counts(year_from int, year_to int)
returns table(yr int, deals int)
language sql
security definer
set search_path = public
as $$
  select extract(year from coalesce(sr.submitted_at, sr.created_at))::int as yr,
         count(*)::int as deals
  from public.survey_responses sr
  where extract(year from coalesce(sr.submitted_at, sr.created_at)) between year_from and year_to
  group by 1
  order by 1;
$$;

-- =============================================================================
-- Seed helpers (optional)
-- =============================================================================
-- insert into public.surveys(slug, title, year, period_start, period_end, status)
-- values ('2024-q4','2024 Q4 Market Survey', 2024, '2024-10-01','2024-12-31','open')
-- on conflict (slug) do nothing;

-- =============================================================================
-- End
-- =============================================================================
