-- ProfeFlow: private per-account snapshots with optimistic concurrency.
create table public.profeflow_state (
 user_id uuid primary key references auth.users(id) on delete cascade,
 revision bigint not null default 0 check (revision>=0),
 document jsonb not null check (jsonb_typeof(document)='object'),
 updated_at timestamptz not null default now()
);
alter table public.profeflow_state enable row level security;
revoke all on public.profeflow_state from anon;
grant select,insert,update on public.profeflow_state to authenticated;
create policy profeflow_owner_read on public.profeflow_state for select to authenticated using ((select auth.uid())=user_id);
create policy profeflow_owner_insert on public.profeflow_state for insert to authenticated with check ((select auth.uid())=user_id);
create policy profeflow_owner_update on public.profeflow_state for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create function public.profeflow_save(p_expected bigint,p_document jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare current_revision bigint; next_document jsonb;
begin
 if auth.uid() is null or p_expected is null or p_expected<0 then raise exception 'Authentication and revision required'; end if;
 if jsonb_typeof(p_document)<>'object' or (p_document->>'version') is distinct from '2' then raise exception 'Invalid document'; end if;
 insert into public.profeflow_state(user_id,revision,document) values(auth.uid(),0,'{}') on conflict do nothing;
 select revision into current_revision from public.profeflow_state where user_id=auth.uid() for update;
 if current_revision is distinct from p_expected then raise exception 'PROFEFLOW_CONFLICT: another device saved changes' using errcode='40001'; end if;
 next_document=jsonb_set(jsonb_set(p_document,'{revision}',to_jsonb(current_revision+1)),'{updatedAt}',to_jsonb(now()));
 update public.profeflow_state set document=next_document,revision=current_revision+1,updated_at=now() where user_id=auth.uid();
 return next_document;
end; $$;
revoke all on function public.profeflow_save(bigint,jsonb) from public,anon;
grant execute on function public.profeflow_save(bigint,jsonb) to authenticated;
create table public.profeflow_photos (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null check (id ~ '^[a-zA-Z0-9_-]+$'),
 mime_type text not null check(mime_type in ('image/jpeg','image/png','image/webp','image/heic','image/heif')),
 byte_size integer not null check(byte_size>0 and byte_size<=15728640),
 data_base64 text not null check(length(data_base64)<=20971520 and length(data_base64)=4*((byte_size+2)/3) and data_base64 ~ '^[A-Za-z0-9+/]*={0,2}$'),
 created_at timestamptz not null default now(),
 primary key(user_id,id)
);
alter table public.profeflow_photos enable row level security;
revoke all on public.profeflow_photos from anon;
grant select,insert on public.profeflow_photos to authenticated;
create policy profeflow_photo_owner_read on public.profeflow_photos for select to authenticated using ((select auth.uid())=user_id);
create policy profeflow_photo_owner_insert on public.profeflow_photos for insert to authenticated with check ((select auth.uid())=user_id);
