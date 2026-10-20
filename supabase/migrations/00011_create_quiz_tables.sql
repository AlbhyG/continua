-- Quiz assessment tables for the Empathy-Detachment axis questionnaire

CREATE TABLE IF NOT EXISTS quiz_users (
  id BIGSERIAL PRIMARY KEY,
  anonymous_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_results (
  id BIGSERIAL PRIMARY KEY,
  anonymous_token TEXT NOT NULL REFERENCES quiz_users(anonymous_token),
  questionnaire_id INTEGER NOT NULL,
  score REAL NOT NULL,
  taken_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_token ON quiz_results(anonymous_token);

-- RLS policies
ALTER TABLE quiz_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts and reads (users are identified by token, not auth)
CREATE POLICY "Anyone can create quiz users" ON quiz_users
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anyone can read quiz users" ON quiz_users
  FOR SELECT TO anon USING (true);

CREATE POLICY "Anyone can insert quiz results" ON quiz_results
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anyone can read quiz results" ON quiz_results
  FOR SELECT TO anon USING (true);
