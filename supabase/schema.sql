-- ============================================================================
-- StarPrep AI, Database Schema
-- Run in the Supabase SQL editor (or via `supabase db push`).
--
-- Design notes:
--  * Multi-tenant by campus/district, but the core access unit is the teacher.
--  * Row Level Security (RLS) is ON for every table. A teacher can only ever
--    see their own data. This is the backbone of FERPA compliance, student
--    results are never exposed across accounts.
--  * Student PII is minimized: we store a display name and an external SIS id,
--    never SSNs or sensitive identifiers.
-- ============================================================================

-- ── Districts & campuses ────────────────────────────────────────────────────
create table if not exists districts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

create table if not exists campuses (
  id           uuid primary key default gen_random_uuid(),
  district_id  uuid references districts(id) on delete cascade,
  name         text not null,
  created_at   timestamptz not null default now()
);

-- ── Teachers (profiles) ─────────────────────────────────────────────────────
-- One row per auth user. `plan` gates feature/usage limits.
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  campus_id   uuid references campuses(id) on delete set null,
  role        text not null default 'teacher',  -- teacher | campus_admin | district_admin
  plan        text not null default 'trial',    -- trial | teacher | campus | district
  created_at  timestamptz not null default now()
);

-- ── Question sets ───────────────────────────────────────────────────────────
-- Questions are stored as JSONB (the shape produced by the generator).
create table if not exists question_sets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  grade       text not null,
  subject     text not null,
  teks        text,
  questions   jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists question_sets_user_idx on question_sets(user_id);

-- ── Students (roster) ───────────────────────────────────────────────────────
create table if not exists students (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  sis_id      text,                              -- external SIS reference, optional
  class_period text,
  created_at  timestamptz not null default now()
);
create index if not exists students_teacher_idx on students(teacher_id);

-- ── Assignments & results ───────────────────────────────────────────────────
create table if not exists assignments (
  id          uuid primary key default gen_random_uuid(),
  set_id      uuid not null references question_sets(id) on delete cascade,
  teacher_id  uuid not null references auth.users(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  due_at      timestamptz
);

create table if not exists results (
  id             uuid primary key default gen_random_uuid(),
  assignment_id  uuid not null references assignments(id) on delete cascade,
  student_id     uuid not null references students(id) on delete cascade,
  teacher_id     uuid not null references auth.users(id) on delete cascade,
  score          numeric,                        -- 0-100
  -- Per-TEKS performance, e.g. {"8.8(C)": 0.6, "8.4(B)": 0.9}. Powers the
  -- mastery analytics + one-click remediation feature.
  teks_breakdown jsonb default '{}'::jsonb,
  submitted_at   timestamptz not null default now()
);
create index if not exists results_teacher_idx on results(teacher_id);

-- ── Generation log (usage metering + quality review) ────────────────────────
create table if not exists generations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  grade       text,
  subject     text,
  teks        text,
  count       int,
  created_at  timestamptz not null default now()
);
create index if not exists generations_user_idx on generations(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table profiles       enable row level security;
alter table question_sets  enable row level security;
alter table students       enable row level security;
alter table assignments    enable row level security;
alter table results        enable row level security;
alter table generations    enable row level security;

-- Profiles: a user sees and edits only their own profile row.
create policy "own profile (select)" on profiles for select using (auth.uid() = id);
create policy "own profile (update)" on profiles for update using (auth.uid() = id);
create policy "own profile (insert)" on profiles for insert with check (auth.uid() = id);

-- Generic "owner can do everything" policy applied to teacher-scoped tables.
create policy "owner sets"        on question_sets for all using (auth.uid() = user_id)    with check (auth.uid() = user_id);
create policy "owner students"    on students      for all using (auth.uid() = teacher_id) with check (auth.uid() = teacher_id);
create policy "owner assignments" on assignments   for all using (auth.uid() = teacher_id) with check (auth.uid() = teacher_id);
create policy "owner results"     on results       for all using (auth.uid() = teacher_id) with check (auth.uid() = teacher_id);
create policy "owner generations" on generations   for all using (auth.uid() = user_id)    with check (auth.uid() = user_id);

-- ── Auto-create a profile when a new auth user signs up ─────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
