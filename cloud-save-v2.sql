-- Additive deployment: keep profeflow_save(bigint,jsonb) for existing clients.
alter table public.profeflow_state add column if not exists last_request_id uuid;
create or replace function public.profeflow_save_v2(p_expected bigint,p_document jsonb,p_request_id uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare current_revision bigint; current_request uuid; saved_at timestamptz;
begin
 if auth.uid() is null or p_expected is null or p_expected<0 or p_request_id is null then raise exception 'Authentication, revision and request required'; end if;
 if jsonb_typeof(p_document)<>'object' or (p_document->>'version') is distinct from '2' then raise exception 'Invalid document'; end if;
 insert into public.profeflow_state(user_id,revision,document) values(auth.uid(),0,'{}') on conflict do nothing;
 select revision,last_request_id,updated_at into current_revision,current_request,saved_at from public.profeflow_state where user_id=auth.uid() for update;
 if current_request=p_request_id and current_revision=p_expected+1 then
  return jsonb_build_object('revision',current_revision,'requestId',current_request,'updatedAt',saved_at);
 end if;
 if current_revision is distinct from p_expected then raise exception 'PROFEFLOW_CONFLICT: another device saved changes' using errcode='40001'; end if;
 saved_at=now();
 update public.profeflow_state set document=jsonb_set(jsonb_set(p_document,'{revision}',to_jsonb(current_revision+1)),'{updatedAt}',to_jsonb(saved_at)),revision=current_revision+1,updated_at=saved_at,last_request_id=p_request_id where user_id=auth.uid();
 return jsonb_build_object('revision',current_revision+1,'requestId',p_request_id,'updatedAt',saved_at);
end; $$;
revoke all on function public.profeflow_save_v2(bigint,jsonb,uuid) from public,anon;
grant execute on function public.profeflow_save_v2(bigint,jsonb,uuid) to authenticated;
