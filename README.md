# rwight

Distraction-free writing. Cursor centers automatically. No punctuation. Pure flow.

## Deploy

1. Push to GitHub
2. Connect to Vercel
3. Add Neon Postgres integration
4. Run the SQL table creation in Neon

```sql
CREATE TABLE writings (
  id SERIAL PRIMARY KEY,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Live at rwight.com