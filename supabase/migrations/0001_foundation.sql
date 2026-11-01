-- Apply once via Supabase SQL Editor or `supabase db push`.
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 nickname text not null default 'Member' check(length(nickname)<=60),
 bio text not null default '' check(length(bio)<=1000),
 public_statistics boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.trades (
 id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade,
 symbol text not null check(length(symbol) between 2 and 20),
 market text not null check(market in ('spot','linear')),
 direction text not null check(direction in ('long','short')),
 currency text not null default 'USD' check(currency='USD'),
 "enteredAt" timestamptz not null, "exitedAt" timestamptz,
 entry numeric(28,8) not null check(entry>0), exit numeric(28,8) check(exit>0),
 quantity numeric(28,8) not null check(quantity>0), fees numeric(28,8) not null default 0 check(fees>=0),
 funding numeric(28,8) not null default 0 check(funding>=0),
 status text not null check(status in ('open','closed')),
 strategy text not null default '', note text not null default '' check(length(note)<=2000),
 emotion text not null default 'Спокойствие' check(emotion in ('Спокойствие','Тревога','Эйфория')),
 tags text[] not null default '{}', created_at timestamptz not null default now(),
 check(market<>'spot' or direction='long'),
 check(status<>'closed' or (exit is not null and "exitedAt" is not null)),
 check("exitedAt" is null or "exitedAt">="enteredAt"),
 unique(id,user_id)
);
create index trades_user_date on public.trades(user_id,"enteredAt" desc);
create table public.strategies(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,name text not null,description text not null default '',entry_rules text not null default '',exit_rules text not null default '',risk_percent numeric(5,2) check(risk_percent between 0 and 100),invalidation text not null default '',unique(id,user_id));
create table public.trade_tags(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,trade_id uuid not null,label text not null,foreign key(trade_id,user_id) references public.trades(id,user_id) on delete cascade);
create table public.trade_attachments(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,trade_id uuid not null,storage_path text not null,foreign key(trade_id,user_id) references public.trades(id,user_id) on delete cascade);
create table public.trade_strategies(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,trade_id uuid not null,strategy_id uuid not null,foreign key(trade_id,user_id) references public.trades(id,user_id) on delete cascade,foreign key(strategy_id,user_id) references public.strategies(id,user_id) on delete cascade);
create table public.journal_insights(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,kind text not null,evidence jsonb not null default '[]',created_at timestamptz not null default now());
create table public.private_notes(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,body text not null,updated_at timestamptz not null default now());
create table public.educational_articles(id uuid primary key default gen_random_uuid(),title text not null,category text not null,body text not null,published boolean not null default false);
create table public.bookmarks(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,article_id uuid not null references public.educational_articles(id) on delete cascade,unique(user_id,article_id));
-- Public post content is explicitly separate from private trade records.
create table public.posts(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,body text not null check(length(body) between 1 and 3000),created_at timestamptz not null default now());
create table public.comments(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,post_id uuid not null references public.posts(id) on delete cascade,body text not null check(length(body) between 1 and 1000));
create table public.reactions(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,post_id uuid not null references public.posts(id) on delete cascade,unique(user_id,post_id));
create table public.follows(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,author_id uuid not null references auth.users(id) on delete cascade,unique(user_id,author_id),check(user_id<>author_id));
create table public.user_preferences(id uuid primary key default gen_random_uuid(),user_id uuid not null unique references auth.users(id) on delete cascade,locale text not null default 'ru',settings jsonb not null default '{}');
create table public.subscription_plans(id uuid primary key default gen_random_uuid(),name text not null,active boolean not null default false);
create table public.user_subscriptions(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,plan_id uuid references public.subscription_plans(id),status text not null default 'inactive');
create table public.support_requests(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,body text not null check(length(body) between 1 and 2000),status text not null default 'open' check(status='open'),admin_response text,created_at timestamptz not null default now(),check(admin_response is null));
-- Admin workflows are intentionally not exposed to ordinary users.
do $$ declare t text; begin
 foreach t in array array['trades','strategies','trade_tags','trade_attachments','trade_strategies','journal_insights','private_notes','bookmarks','user_preferences'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy owner_access on public.%I for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id)',t);
 execute format('create index on public.%I(user_id)',t);
 end loop;
 foreach t in array array['posts','comments','reactions','follows'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy public_read on public.%I for select to authenticated using (true)',t);
 execute format('create policy owner_write on public.%I for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id)',t);
 execute format('create index on public.%I(user_id)',t);
 end loop;
end $$;
alter table public.profiles enable row level security;
create policy owner_profile on public.profiles for all to authenticated using (auth.uid()=id) with check(auth.uid()=id);
alter table public.educational_articles enable row level security;
create policy published_articles on public.educational_articles for select using(published);
alter table public.subscription_plans enable row level security;
create policy active_plans on public.subscription_plans for select using(active);
alter table public.user_subscriptions enable row level security;
create policy read_own_subscription on public.user_subscriptions for select to authenticated using(auth.uid()=user_id);
alter table public.support_requests enable row level security;
create policy read_own_request on public.support_requests for select to authenticated using(auth.uid()=user_id);
create policy insert_own_request on public.support_requests for insert to authenticated with check(auth.uid()=user_id and status='open' and admin_response is null);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('trade-images','trade-images',false,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy own_trade_images on storage.objects for all to authenticated using(bucket_id='trade-images' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='trade-images' and (storage.foldername(name))[1]=auth.uid()::text);
