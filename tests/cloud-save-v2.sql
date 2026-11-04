begin;
-- Requires cloud-save-v2.sql. All fixture writes roll back.
insert into auth.users(id) values ('f0000000-0000-4000-8000-0000000000a1');
set local role authenticated;
select set_config('request.jwt.claim.sub','f0000000-0000-4000-8000-0000000000a1',true);
do $test$ declare receipt jsonb; repeated jsonb; failed boolean:=false; begin
 receipt=public.profeflow_save_v2(0,jsonb_build_object('version',2,'fixture',repeat('x',4200000)),'f0000000-0000-4000-8000-0000000000b1');
 if receipt->>'revision'<>'1' or length(receipt::text)>300 or receipt?'document' then raise exception 'Bad compact receipt';end if;
 repeated=public.profeflow_save_v2(0,jsonb_build_object('version',2,'fixture',repeat('x',4200000)),'f0000000-0000-4000-8000-0000000000b1');
 if repeated<>receipt then raise exception 'Retry not idempotent';end if;
 begin perform public.profeflow_save_v2(0,'{"version":2}'::jsonb,'f0000000-0000-4000-8000-0000000000b2'); exception when serialization_failure then failed=true;end;
 if not failed then raise exception 'Stale write accepted';end if;
 perform public.profeflow_save(1,'{"version":2,"fixture":"legacy-client"}'::jsonb);
 if (select revision from public.profeflow_state where user_id=auth.uid())<>2 then raise exception 'Legacy client failed';end if;
 failed=false;
 begin perform public.profeflow_save_v2(0,'{"version":2}'::jsonb,'f0000000-0000-4000-8000-0000000000b1');exception when serialization_failure then failed=true;end;
 if not failed then raise exception 'Legacy write was confused with old receipt';end if;
end $test$;
select set_config('request.jwt.claim.sub','f0000000-0000-4000-8000-0000000000a2',true);
do $test$ begin if exists(select 1 from public.profeflow_state where user_id='f0000000-0000-4000-8000-0000000000a1') then raise exception 'RLS owner leak';end if;end $test$;
reset role;
select not has_function_privilege('anon','public.profeflow_save_v2(bigint,jsonb,uuid)','execute') as anonymous_blocked,not prosecdef as invoker_security from pg_proc where oid='public.profeflow_save_v2(bigint,jsonb,uuid)'::regprocedure;
rollback;
