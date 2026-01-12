-- Create a secure function to submit tickets
-- This function runs with "SECURITY DEFINER" which means it bypasses 
-- the RLS policies of the invoker and uses the admin's privileges.

create or replace function submit_ticket(
  name text,
  email text,
  message text,
  user_id uuid default null
)
returns uuid
language plpgsql
security definer -- <--- This is the magic key.
as $$
declare
  new_id uuid;
begin
  insert into support_tickets (name, email, message, user_id)
  values (submit_ticket.name, submit_ticket.email, submit_ticket.message, submit_ticket.user_id)
  returning id into new_id;
  
  return new_id;
end;
$$;

-- Grant execute permission to everyone (anon + authenticated)
grant execute on function submit_ticket to anon;
grant execute on function submit_ticket to authenticated;
grant execute on function submit_ticket to service_role;
