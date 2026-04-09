-- Add per-axis score columns to quiz_results
ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS scores JSONB;
-- scores format: {"empathy": 5.2, "self_orientation": 3.8, "social_attunement": 7.1, "conscientiousness": 6.4, "agency": 4.5, "reactivity": 8.0}
