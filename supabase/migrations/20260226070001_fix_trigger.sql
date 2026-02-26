-- Drop the existing trigger and function, then recreate with proper handling
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();

-- Recreate with better null handling
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
exception when others then
  -- Don't block user creation if profile insert fails
  raise warning 'Failed to create profile for user %: %', new.id, sqlerrm;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
