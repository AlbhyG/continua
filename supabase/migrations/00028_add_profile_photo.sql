-- A small profile photo for the account's own "self" person, shown only to
-- that person (in the header). Stored inline as a resized JPEG data URL
-- (128 x 128, a few kilobytes), so no storage bucket is needed. Deleted with
-- the person record, and so with the account.
ALTER TABLE public.people
  ADD COLUMN IF NOT EXISTS photo TEXT
  CHECK (photo IS NULL OR (photo LIKE 'data:image/jpeg;base64,%' AND length(photo) <= 60000));
