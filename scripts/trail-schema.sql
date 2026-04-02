-- Solana Trail Game Database Schema
-- Run this in Vercel Postgres dashboard (or via psql)

CREATE TABLE trail_games (
  id            SERIAL PRIMARY KEY,
  wallet        VARCHAR(44),
  twitter_handle VARCHAR(64),
  player_name   VARCHAR(64) NOT NULL,
  profession    VARCHAR(32) NOT NULL,
  multiplier    REAL NOT NULL DEFAULT 1,
  game_score    INTEGER NOT NULL,
  final_score   INTEGER NOT NULL,
  solana_score  INTEGER,
  hunt_score    INTEGER NOT NULL DEFAULT 0,
  survivors     INTEGER NOT NULL DEFAULT 0,
  party_size    INTEGER NOT NULL DEFAULT 3,
  events_log    JSONB DEFAULT '[]',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trail_games_wallet ON trail_games(wallet);
CREATE INDEX idx_trail_games_twitter ON trail_games(twitter_handle);
CREATE INDEX idx_trail_games_final_score ON trail_games(final_score DESC);
CREATE INDEX idx_trail_games_created ON trail_games(created_at DESC);

CREATE TABLE trail_kol_deaths (
  id            SERIAL PRIMARY KEY,
  game_id       INTEGER REFERENCES trail_games(id),
  kol_handle    VARCHAR(64) NOT NULL,
  death_message TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kol_deaths_handle ON trail_kol_deaths(kol_handle);
