CREATE TABLE IF NOT EXISTS wedding_config (
  id integer PRIMARY KEY DEFAULT 1,
  data jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE wedding_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read config" ON wedding_config FOR SELECT USING (true);
-- writes handled server-side via service_role key (bypasses RLS)
