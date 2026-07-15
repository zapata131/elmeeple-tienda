-- Create role type enum
create type public.role_type as enum ('player', 'partner', 'admin');

-- Create profiles table (extends auth.users)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text not null,
    role public.role_type not null default 'player',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Allow public read access to profiles"
    on public.profiles for select
    using (true);

create policy "Allow users to update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- Create profiles trigger function
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, role)
    values (new.id, new.email, 'player');
    return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute on auth.users insert
create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();


-- Create stores table
create table public.stores (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    slug text not null unique,
    logo_url text,
    base_url text not null,
    google_shopping_feed_url text,
    feed_status text default 'Offline'::text not null,
    feed_last_processed_count integer default 0 not null,
    feed_last_matched_count integer default 0 not null,
    feed_last_unmatched_count integer default 0 not null,
    owner_email text not null,
    verified boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on stores
alter table public.stores enable row level security;

create policy "Allow public read access to stores"
    on public.stores for select
    using (true);

create policy "Allow store owners to update their own store"
    on public.stores for update
    using (auth.jwt() ->> 'email' = owner_email);

create policy "Allow store owners to insert their own store"
    on public.stores for insert
    with check (auth.jwt() ->> 'email' = owner_email);


-- Create shipping_rates table
create table public.shipping_rates (
    id uuid default gen_random_uuid() primary key,
    store_id uuid references public.stores(id) on delete cascade not null,
    destination_country text not null, -- ISO-2 code (e.g. 'ES', 'PT', 'MX')
    flat_rate numeric not null,
    free_shipping_threshold numeric,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (store_id, destination_country)
);

-- Enable RLS on shipping_rates
alter table public.shipping_rates enable row level security;

create policy "Allow public read access to shipping_rates"
    on public.shipping_rates for select
    using (true);

create policy "Allow owners to manage shipping rates"
    on public.shipping_rates for all
    using (
        exists (
            select 1 from public.stores
            where id = shipping_rates.store_id
            and owner_email = auth.jwt() ->> 'email'
        )
    );


-- Create bgg_games_cache table
create table public.bgg_games_cache (
    bgg_id integer primary key,
    name text not null,
    thumbnail text,
    weight numeric,
    min_players integer,
    max_players integer,
    playing_time integer,
    alternate_names text[], -- array of alt names
    categories text[], -- array of BGG categories/mechanics
    ean text, -- EAN/UPC barcode
    parent_bgg_id integer references public.bgg_games_cache(bgg_id) on delete set null,
    last_updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on bgg_games_cache
alter table public.bgg_games_cache enable row level security;

create policy "Allow public read access to bgg_games_cache"
    on public.bgg_games_cache for select
    using (true);

create policy "Allow admin/system to manage bgg_games_cache"
    on public.bgg_games_cache for all
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid()
            and role = 'admin'
        )
    );


-- Create store_games table
create table public.store_games (
    id uuid default gen_random_uuid() primary key,
    store_id uuid references public.stores(id) on delete cascade not null,
    bgg_id integer references public.bgg_games_cache(bgg_id) on delete cascade not null,
    store_product_url text not null,
    price numeric not null,
    stock integer not null default 0, -- inventory quantity
    edition_language text not null check (edition_language in ('es', 'pt', 'en')),
    last_updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (store_id, bgg_id)
);

-- Index for speedy lookups
create index store_games_bgg_id_idx on public.store_games(bgg_id);

-- Enable RLS on store_games
alter table public.store_games enable row level security;

create policy "Allow public read access to store_games"
    on public.store_games for select
    using (true);

create policy "Allow owners to manage store_games"
    on public.store_games for all
    using (
        exists (
            select 1 from public.stores
            where id = store_games.store_id
            and owner_email = auth.jwt() ->> 'email'
        )
    );


-- Create price_alerts table
create table public.price_alerts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    bgg_id integer references public.bgg_games_cache(bgg_id) on delete cascade not null,
    target_price numeric not null check (target_price > 0),
    currency text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on price_alerts
alter table public.price_alerts enable row level security;

create policy "Allow users to manage their own price alerts"
    on public.price_alerts for all
    using (auth.uid() = user_id);


-- Create exchange_rates table
create table public.exchange_rates (
    currency text primary key, -- ISO-3 currency code (e.g. 'MXN', 'BRL')
    rate numeric not null, -- relative to EUR
    enabled boolean default true not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed default initial exchange rates relative to EUR (Base 1.0)
insert into public.exchange_rates (currency, rate, enabled) values
    ('EUR', 1.0, true),
    ('USD', 1.08, true),
    ('MXN', 21.50, true),
    ('BRL', 6.05, true),
    ('ARS', 1050.0, true),
    ('COP', 4400.0, true),
    ('CLP', 1020.0, true),
    ('PEN', 4.05, true)
on conflict (currency) do nothing;

-- Enable RLS on exchange_rates
alter table public.exchange_rates enable row level security;

create policy "Allow public read access to exchange_rates"
    on public.exchange_rates for select
    using (true);

create policy "Allow admin/system to manage exchange_rates"
    on public.exchange_rates for all
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid()
            and role = 'admin'
        )
    );


-- Create price_history table
create table public.price_history (
    bgg_id integer references public.bgg_games_cache(bgg_id) on delete cascade not null,
    min_price numeric not null,
    recorded_at date default current_date not null,
    primary key (bgg_id, recorded_at)
);

-- Index for date queries
create index price_history_bgg_id_recorded_at_idx on public.price_history(bgg_id, recorded_at);

-- Enable RLS on price_history
alter table public.price_history enable row level security;

create policy "Allow public read access to price_history"
    on public.price_history for select
    using (true);

create policy "Allow admin/system to manage price_history"
    on public.price_history for all
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid()
            and role = 'admin'
        )
    );


-- Create clicks table
create table public.clicks (
    id uuid default gen_random_uuid() primary key,
    store_id uuid references public.stores(id) on delete cascade not null,
    bgg_id integer references public.bgg_games_cache(bgg_id) on delete cascade not null,
    ip_address text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for analytics
create index clicks_store_id_created_at_idx on public.clicks(store_id, created_at);

-- Enable RLS on clicks
alter table public.clicks enable row level security;

create policy "Allow store owners to view clicks"
    on public.clicks for select
    using (
        exists (
            select 1 from public.stores
            where id = clicks.store_id
            and owner_email = auth.jwt() ->> 'email'
        )
    );

create policy "Allow system/anon to insert clicks"
    on public.clicks for insert
    with check (true);


-- Create bgg_metadata_queue table for unmapped merchant items awaiting BGG API resolution
create table public.bgg_metadata_queue (
    id uuid default gen_random_uuid() primary key,
    store_id uuid references public.stores(id) on delete cascade not null,
    ean text,
    title text not null,
    store_product_url text not null,
    status text default 'pending'::text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (store_id, store_product_url)
);

create index bgg_metadata_queue_status_idx on public.bgg_metadata_queue(status);

-- Enable RLS on bgg_metadata_queue
alter table public.bgg_metadata_queue enable row level security;

create policy "Allow admin/system to manage bgg_metadata_queue"
    on public.bgg_metadata_queue for all
    using (true);
