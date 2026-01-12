create table if not exists support_tickets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  name text,
  email text,
  message text,
  status text default 'open',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Allow anyone to create a ticket (so the form works)
alter table support_tickets enable row level security;

create policy "Enable insert for everyone" 
on support_tickets for insert 
with check (true);

-- Allow users to see only their own tickets
create policy "Users can see own tickets" 
on support_tickets for select 
using (auth.uid() = user_id);
