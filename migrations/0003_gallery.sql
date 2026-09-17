-- Galerie communautaire : morceaux publiés, lisibles par tous.
-- L'auteur affiché est le pseudo du compte (lu côté serveur), jamais l'e-mail.
create table if not exists shared_pieces (
  id         text primary key,
  user_id    text not null,
  title      text not null,
  author     text not null,
  genre      text,
  payload    jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists shared_pieces_created_idx on shared_pieces (created_at desc);
create index if not exists shared_pieces_user_idx on shared_pieces (user_id);
