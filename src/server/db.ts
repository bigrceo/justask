import postgres from "postgres";

declare global {
  var __sql: postgres.Sql | undefined;
}

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";
export const sql = globalThis.__sql ?? postgres(url, { max: Number(process.env.DB_POOL_MAX ?? 5), idle_timeout: 20, connect_timeout: 10, prepare: false });
globalThis.__sql = sql;

export const hasDb = Boolean(url);

// Tables are prefixed ja_ so they can share a Neon database with other projects.
const SCHEMA = `
create table if not exists ja_pictures (
  id text primary key,
  url text not null,
  type text,
  data bytea,
  created_at timestamptz not null default now()
);
alter table ja_pictures add column if not exists type text;
alter table ja_pictures add column if not exists data bytea;
create table if not exists ja_coins (
  token text primary key,
  splitter text not null,
  pool_id text not null,
  name text not null,
  ticker text not null,
  image text not null,
  description text,
  x text,
  website text,
  wallet text,
  user_bps int not null,
  client text,
  ip text,
  tx text not null,
  last_swaps int not null default 0,
  paid_nvda numeric not null default 0,
  paid_usd numeric not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists ja_coins_created on ja_coins (created_at desc);
create table if not exists ja_prices (
  token text not null,
  mcap_usd numeric not null,
  at timestamptz not null default now()
);
create index if not exists ja_prices_token on ja_prices (token, at desc);
create table if not exists ja_reviews (
  id text primary key,
  args jsonb not null,
  image text,
  token text,
  created_at timestamptz not null default now()
);
create table if not exists ja_burns (
  tx text primary key,
  fees_nvda numeric not null,
  fees_usd numeric not null,
  burned numeric not null,
  at timestamptz not null default now()
);
create table if not exists ja_state (
  key text primary key,
  value text not null
);
`;

let ready: Promise<void> | undefined;
export function ensureSchema(): Promise<void> {
  ready ??= sql.unsafe(SCHEMA).then(() => undefined);
  return ready;
}
