CREATE TABLE IF NOT EXISTS wedding_attendance (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  side       text NOT NULL CHECK (side IN ('신랑', '신부')),
  attending  text NOT NULL CHECK (attending IN ('참석', '불참석')),
  meal       text NOT NULL CHECK (meal IN ('○', '×', '미정')),
  name       text NOT NULL,
  companion  text,
  message    text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE wedding_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert attendance" ON wedding_attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "admin read attendance" ON wedding_attendance FOR SELECT USING (true);
