-- Progression Diapason par utilisateur (sync multi-appareils).
-- Une ligne par user_id : blob JSON last-write-wins via data.updatedAt.
create table if not exists user_progress (
  user_id    text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);
