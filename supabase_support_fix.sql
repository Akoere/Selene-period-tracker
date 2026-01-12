-- 1. Create the table if it doesn't exist
create table if not exists support_tickets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  name text,
  email text,
  message text,
  status text default 'open',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. ENABLE Row Level Security (RLS)
alter table support_tickets enable row level security;

-- 3. DROP existing policies to avoid conflicts
drop policy if exists "Allow public inserts" on support_tickets;
drop policy if exists "Allow authenticated uploads" on support_tickets;

-- 4. CREATE the policy allowing ANYONE to submit a ticket
create policy "Allow public inserts" 
on support_tickets for insert 
with check (true);

-- 5. Optional: Allow users to view their own tickets (if needed later)
create policy "Users can view own tickets" 
on support_tickets for select 
using (auth.uid() = user_id);
