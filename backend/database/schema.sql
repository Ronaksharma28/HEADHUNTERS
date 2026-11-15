-- 1. Master Investigations Table (Powering Experiment Leaderboard & Investigation Cards)
CREATE TABLE investigations (
    id TEXT PRIMARY KEY,                      -- e.g., 'BASS', 'BASS-II', 'FLEX', 'CFI', 'SAFFIRE-I', 'SAFFIRE-II', 'SAFFIRE-III', 'SAFFIRE-IV', 'SAFFIRE-V', 'SAME'
    family TEXT NOT NULL,                     -- e.g., 'BASS Family', 'Saffire Series', 'Droplet Combustion', 'Aerosol'
    full_name TEXT NOT NULL,
    program TEXT NOT NULL,                    -- e.g., 'Spacecraft Fire Safety', 'Burning and Suppression of Solids'
    platform TEXT NOT NULL,                   -- e.g., 'ISS · MSG', 'ISS · CIR', 'Cygnus OA-6 (uncrewed)'
    years TEXT NOT NULL,                      -- e.g., '2016', '2012–2021', '2009–2014'
    fuel_summary TEXT NOT NULL,               -- e.g., 'SIBAL cotton-fiberglass, PMMA, Nomex'
    si_score INTEGER NOT NULL CHECK (si_score BETWEEN 0 AND 100),
    destinations TEXT[] NOT NULL,             -- e.g., ARRAY['ISS', 'Moon', 'Mars']
    tags TEXT[] NOT NULL,                     -- e.g., ARRAY['Large-scale', 'Flame spread', 'Cabin']
    primary_focus TEXT NOT NULL,
    summary_plain_english TEXT NOT NULL,      -- Simplified explanation for normal users
    key_safety_takeaway TEXT NOT NULL,
    psi_url TEXT,
    ntrs_citation TEXT
);

-- 2. Individual Experimental Runs / Test Points (Verified from NASA PSI & NTRS Briefs)
CREATE TABLE experiment_runs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    investigation_id TEXT REFERENCES investigations(id) ON DELETE CASCADE,
    run_code TEXT NOT NULL,                   -- e.g., 'R377', 'I-1', 'II-1', 'III-1', 'IV-1', 'V-2'
    fuel_material TEXT NOT NULL,              -- e.g., 'SIBAL Cotton-Fiberglass', 'PMMA (Acrylic)', 'n-Decane', 'Silicone', 'Teflon'
    fuel_category TEXT NOT NULL,              -- 'Thin Solid', 'Thick Solid', 'Liquid Droplet', 'Gas', 'Aerosol/Overheated Material'
    sample_geometry TEXT,                     -- e.g., '94cm x 40.6cm sheet (0.37mm)', 'Droplet D0=4.03mm', 'Ribbed 10mm slab'
    
    -- Standardized Environmental Conditions (NULL = Not Reported; never zeroed)
    oxygen_percent NUMERIC(5,2),              -- mol% or vol%
    pressure_kpa NUMERIC(6,2),                -- Standardized to kPa (1 atm = 101.325 kPa)
    airflow_cm_s NUMERIC(6,2),                -- cm/s (0 = quiescent)
    diluent_gas TEXT,                         -- e.g., 'N2', 'CO2', 'He'
    flow_direction TEXT,                      -- 'Concurrent', 'Opposed', 'Quiescent/Radial'
    
    -- Refined Outcomes & Measurements
    flame_spread_rate_mm_s NUMERIC(8,3),
    steady_flame_size_cm NUMERIC(6,2),
    max_flame_size_cm NUMERIC(6,2),
    burn_duration_s NUMERIC(8,2),
    hot_flame_k_mm2_s NUMERIC(6,3),           -- Droplet burning-rate constant (Hot)
    cool_flame_k_mm2_s NUMERIC(6,3),          -- Droplet burning-rate constant (Cool)
    avg_heat_release_w NUMERIC(8,2),
    co2_increase_ppm NUMERIC(8,2),
    co_increase_ppm NUMERIC(8,2),
    limiting_oxygen_index NUMERIC(5,3),       -- LOI fraction (e.g., 0.150)
    
    -- Human-Readable Interpretation & Provenance
    plain_english_outcome TEXT NOT NULL,
    risk_level TEXT CHECK (risk_level IN ('Low', 'Moderate', 'High', 'Critical')),
    instrument_source TEXT,
    source_reference TEXT NOT NULL,
    
    UNIQUE(investigation_id, run_code)
);

-- 3. Time-Series & Graph Points (For Spread Charts, Cool-Flame Transitions, Particle Distributions)
CREATE TABLE experiment_timeseries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    run_id UUID REFERENCES experiment_runs(id) ON DELETE CASCADE,
    chart_group TEXT NOT NULL,                -- 'airflow_vs_flame_size', 'droplet_d2_decay', 'spread_vs_oxygen', 'spread_vs_gravity'
    x_label TEXT NOT NULL,
    x_value NUMERIC(10,3) NOT NULL,
    y_label TEXT NOT NULL,
    y_value NUMERIC(10,3) NOT NULL,
    series_key TEXT,                          -- e.g., 'pmma', 'cotton', 'nomex', 'steady', 'peak'
    regime_tag TEXT,
    unit_note TEXT
);

-- 4. Habitat Fire Risk Matrix (Powering habitat-radar.tsx)
CREATE TABLE habitat_risk_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    factor TEXT UNIQUE NOT NULL,
    iss INTEGER NOT NULL CHECK (iss BETWEEN 0 AND 100),
    gateway INTEGER NOT NULL CHECK (gateway BETWEEN 0 AND 100),
    lunar INTEGER NOT NULL CHECK (lunar BETWEEN 0 AND 100),
    mars INTEGER NOT NULL CHECK (mars BETWEEN 0 AND 100),
    scientific_basis TEXT NOT NULL
);

-- 5. Curated Q&A Knowledge Base (Powering si-assistant.tsx)
CREATE TABLE si_knowledge_qa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT UNIQUE NOT NULL,
    answer TEXT NOT NULL,
    source_citations TEXT NOT NULL
);

-- Enable Public Read Access (Row Level Security)
ALTER TABLE investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_timeseries ENABLE ROW LEVEL SECURITY;
ALTER TABLE habitat_risk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE si_knowledge_qa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read investigations" ON investigations FOR SELECT USING (true);
CREATE POLICY "Allow public read runs" ON experiment_runs FOR SELECT USING (true);
CREATE POLICY "Allow public read timeseries" ON experiment_timeseries FOR SELECT USING (true);
CREATE POLICY "Allow public read habitat_risk" ON habitat_risk_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read si_qa" ON si_knowledge_qa FOR SELECT USING (true);
