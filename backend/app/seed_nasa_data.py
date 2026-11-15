from supabase import create_client
from app.config import settings
from app.cleaner import atm_to_kpa, generate_risk_assessment

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

# Separate investigations matching every research brief (BASS, BASS-II, FLEX, CFI, Saffire I-V, SAME)
INVESTIGATIONS = [
    {
        "id": "BASS",
        "family": "BASS Family",
        "full_name": "Burning and Suppression of Solids (BASS)",
        "program": "Burning and Suppression of Solids",
        "platform": "ISS · MSG (Modified SPICE)",
        "years": "2012–2013",
        "fuel_summary": "41 samples: SIBAL cotton-fiberglass, Nomex, Ultem, PMMA spheres & candles",
        "si_score": 86,
        "destinations": ["ISS", "Moon", "Mars"],
        "tags": ["Solids", "Nitrogen suppression", "ISS MSG"],
        "primary_focus": "Solid Flammability & Nitrogen Suppression",
        "summary_plain_english": "Tested 41 solid samples across 89 planned test points in the ISS Microgravity Science Glovebox to see how solid fuels ignite and respond to nitrogen fire suppression.",
        "key_safety_takeaway": "A nitrogen suppressant jet can fail or entrain surrounding oxygen and sustain burning depending on nozzle angle and flame geometry.",
        "psi_url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-25",
        "ntrs_citation": "NASA BASS Overview (2025) / PSI-25"
    },
    {
        "id": "BASS-II",
        "family": "BASS Family",
        "full_name": "Burning and Suppression of Solids II (BASS-II)",
        "program": "Burning and Suppression of Solids",
        "platform": "ISS · MSG",
        "years": "2014–2016",
        "fuel_summary": "100 samples: thin acrylic films, PMMA rods, large-sphere section",
        "si_score": 89,
        "destinations": ["ISS", "Moon", "Mars"],
        "tags": ["Solids", "Material testing", "Suppression"],
        "primary_focus": "Solid Flame Spread, Fuel Regression & Quenching Limits",
        "summary_plain_english": "Expanded BASS to 100 fuel samples across ISS Expeditions 37–47+, revealing that flames in low-speed ventilation behave differently than Earth screening predicts.",
        "key_safety_takeaway": "Flames in microgravity are highly sensitive to low-speed airflow changes; a sudden airflow increase can cause a dim stable flame to flare up.",
        "psi_url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-25",
        "ntrs_citation": "NTRS 20210011385 / NTRS 20160000593"
    },
    {
        "id": "FLEX",
        "family": "Droplet Combustion",
        "full_name": "Flame Extinguishment Experiment (FLEX & FLEX-2)",
        "program": "Flame Extinguishment",
        "platform": "ISS · CIR (MDCA)",
        "years": "2009–2017",
        "fuel_summary": "Heptane, methanol, n-octane, n-decane & n-dodecane droplets",
        "si_score": 91,
        "destinations": ["ISS", "Mars"],
        "tags": ["Droplets", "Inert suppressants", "LOI"],
        "primary_focus": "Liquid Droplet Flammability Limits & CO₂/He Suppressants",
        "summary_plain_english": "Conducted over 300 droplet combustion tests in a 95-litre chamber to measure how CO₂ and helium suppressants shift the Limiting Oxygen Index (LOI).",
        "key_safety_takeaway": "Flammability limits are lower in microgravity than on Earth, meaning terrestrial inert-gas suppressant standards offer a smaller safety margin in space.",
        "psi_url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-98",
        "ntrs_citation": "NASA/TP-2015-216046 / NTRS 20150023456"
    },
    {
        "id": "CFI",
        "family": "Droplet Combustion",
        "full_name": "Cool Flames Investigation (CFI & CFI-G)",
        "program": "Cool Flames Investigation",
        "platform": "ISS · CIR (MDCA & ACME)",
        "years": "2012–2021",
        "fuel_summary": "n-Alkane droplets (heptane, octane, decane, dodecane) & gaseous fuels (ethane, propane, butane)",
        "si_score": 93,
        "destinations": ["ISS", "Mars"],
        "tags": ["Cool flames", "Invisible combustion", "Radiometers"],
        "primary_focus": "Low-Temperature Invisible Cool-Flame Chemistry",
        "summary_plain_english": "Discovered that after a visible hot flame goes out in microgravity, liquid droplets and gases continue burning with a faint, invisible low-temperature 'cool flame'.",
        "key_safety_takeaway": "Standard cameras miss cool flames completely; spacecraft fire detection needs UV/formaldehyde filters or broadband radiometers.",
        "psi_url": "https://psi.nasa.gov/",
        "ntrs_citation": "NTRS 20140006750 / NTRS 20210021781"
    },
    {
        "id": "SAFFIRE-I",
        "family": "Saffire Series",
        "full_name": "Spacecraft Fire Experiment I (Saffire-I)",
        "program": "Spacecraft Fire Safety",
        "platform": "Cygnus OA-6 (uncrewed)",
        "years": "2016",
        "fuel_summary": "Large SIBAL cotton-fiberglass fabric (94 cm x 40.6 cm, 0.37 mm)",
        "si_score": 90,
        "destinations": ["ISS", "Moon", "Mars"],
        "tags": ["Large-scale", "Flame spread", "Baseline"],
        "primary_focus": "First Large-Scale Orbit Fire & Boundary-Layer Overshoot",
        "summary_plain_english": "Ignited the largest spacecraft fire test to date inside an uncrewed Cygnus cargo ship at 20 cm/s airflow, proving large microgravity flames settle to a bounded size.",
        "key_safety_takeaway": "Unlike upward fires on Earth that accelerate endlessly, the concurrent microgravity flame peaked at 6.2 cm (30% overshoot) and settled at 4.0 cm.",
        "psi_url": "https://psi.nasa.gov/",
        "ntrs_citation": "NTRS 20170008805 / NTRS 20180005168"
    },
    {
        "id": "SAFFIRE-II",
        "family": "Saffire Series",
        "full_name": "Spacecraft Fire Experiment II (Saffire-II)",
        "program": "Spacecraft Fire Safety",
        "platform": "Cygnus OA-5 (uncrewed)",
        "years": "2016",
        "fuel_summary": "9-sample array: PMMA (flat & grooved), Silicone (4 thicknesses), SIBAL, Nomex",
        "si_score": 88,
        "destinations": ["ISS", "Moon", "Mars"],
        "tags": ["Material screening", "NASA-STD-6001", "9-sample array"],
        "primary_focus": "Multi-Material Oxygen Flammability Limits vs. NASA-STD-6001",
        "summary_plain_english": "Burned a 3x3 array of 9 spacecraft materials to test whether Earth's standard NASA-STD-6001 Test 1 screening holds in low gravity.",
        "key_safety_takeaway": "Materials passing Earth's 1-g screening test can still burn in low gravity; material thickness and oxygen level jointly control flammability.",
        "psi_url": "https://psi.nasa.gov/",
        "ntrs_citation": "NTRS 20180005168 / ICES-2021-266"
    },
    {
        "id": "SAFFIRE-III",
        "family": "Saffire Series",
        "full_name": "Spacecraft Fire Experiment III (Saffire-III)",
        "program": "Spacecraft Fire Safety",
        "platform": "Cygnus OA-7 (uncrewed)",
        "years": "2017",
        "fuel_summary": "Large SIBAL cotton-fiberglass fabric (94 cm x 40.6 cm) at 25 cm/s flow",
        "si_score": 92,
        "destinations": ["ISS", "Moon", "Mars"],
        "tags": ["Ventilation control", "Airflow speed", "Paired test"],
        "primary_focus": "Effect of Higher Ventilation Speed (25 vs 20 cm/s) on Large Fires",
        "summary_plain_english": "Repeated Saffire-I with identical hardware and fabric but increased fan speed from 20 to 25 cm/s to isolate how ventilation velocity drives fire growth.",
        "key_safety_takeaway": "Faster airflow enlarged steady flame size from 4 cm to 5 cm (peak 8.2 cm) and cut total burn time from 400 s to 320 s.",
        "psi_url": "https://psi.nasa.gov/",
        "ntrs_citation": "NTRS 20180005168 / ICES-2021-266"
    },
    {
        "id": "SAFFIRE-IV",
        "family": "Saffire Series",
        "full_name": "Spacecraft Fire Experiment IV (Saffire-IV)",
        "program": "Spacecraft Fire Safety",
        "platform": "Cygnus NG-13 (uncrewed)",
        "years": "2020",
        "fuel_summary": "SIBAL cloth (50 cm) & 2-sided PMMA (18 cm) in 30 cm duct + Far-Field Diagnostics",
        "si_score": 96,
        "destinations": ["ISS", "Moon", "Mars"],
        "tags": ["Large-scale", "Cabin gases", "Deflagration risk"],
        "primary_focus": "Vehicle Cabin Consequences, Heat Release & Low-Flow Hazards",
        "summary_plain_english": "Added cabin-wide CO₂, CO, smoke, and post-fire cleanup sensors inside Cygnus, measuring 3,150 W heat release and +1,390 ppm CO₂ rise.",
        "key_safety_takeaway": "Dropping ventilation to 5 cm/s allowed unburned fuel vapours to accumulate, causing a rapid deflagration within 267 ms.",
        "psi_url": "https://psi.nasa.gov/",
        "ntrs_citation": "ICES-2021-266 / ICES-2024-365"
    },
    {
        "id": "SAFFIRE-V",
        "family": "Saffire Series",
        "full_name": "Spacecraft Fire Experiment V (Saffire-V)",
        "program": "Spacecraft Fire Safety",
        "platform": "Cygnus NG-14 (uncrewed)",
        "years": "2021",
        "fuel_summary": "Cotton jersey (50 cm), flat PMMA (5 mm), ribbed structured PMMA (10 mm)",
        "si_score": 98,
        "destinations": ["Moon", "Mars"],
        "tags": ["Exploration atmosphere", "Artemis/Lunar", "Ribbed PMMA"],
        "primary_focus": "Exploration Cabin Atmospheres (26% O₂, 71 kPa) & Extinguishment",
        "summary_plain_english": "Tested fires in future exploration vehicle conditions (elevated ~26% O₂, reduced ~71 kPa pressure), revealing reignition after fan shutoff and rapid spread on thin ribs.",
        "key_safety_takeaway": "Holding low airflow (5 cm/s for 300 s) before shutoff cooled PMMA safely, whereas thin charring cotton reignited after a 70 s fan shutoff.",
        "psi_url": "https://psi.nasa.gov/",
        "ntrs_citation": "ICES-2021-266 / ICES-2021-218 / ICES-2024-365"
    },
    {
        "id": "SAME",
        "family": "Smoke Aerosol",
        "full_name": "Smoke Aerosol Measurement Experiment (SAME & SAME-R)",
        "program": "Smoke Aerosol Measurement",
        "platform": "ISS · MSG",
        "years": "2007–2010",
        "fuel_summary": "Teflon, Kapton, silicone rubber, cellulose, dibutyl phthalate, Pyrell",
        "si_score": 87,
        "destinations": ["ISS", "Moon", "Mars"],
        "tags": ["Smoke detectors", "Aerosol size", "Early warning"],
        "primary_focus": "Microgravity Smoke Particle Coagulation & Detector Response",
        "summary_plain_english": "Measured smoke particle distributions from overheated spacecraft materials across Expeditions 15 and 24 to benchmark Shuttle ionization vs. ISS photoelectric alarms.",
        "key_safety_takeaway": "Microgravity smoke coagulates into larger droplets (>1 µm); future spacecraft detectors must sense both sub-micron and >1 µm aerosols.",
        "psi_url": "https://psi.nasa.gov/",
        "ntrs_citation": "Meyer et al. (2015, 2018) / NASA Glenn PSI Fact Sheet"
    }
]

RUNS = [
    # CFI / FLEX Droplet Runs (NTRS 20140006750 Fig 1 & Fig 2)
    {
        "investigation_id": "CFI",
        "run_code": "R377",
        "fuel_material": "n-Decane (D0 = 4.03 mm)",
        "fuel_category": "Liquid Droplet",
        "sample_geometry": "4.03 mm free-floating droplet",
        "oxygen_percent": 21.0,
        "pressure_kpa": atm_to_kpa(0.5),
        "airflow_cm_s": 0.0,
        "diluent_gas": "79% N2",
        "flow_direction": "Quiescent/Radial",
        "hot_flame_k_mm2_s": 0.41,
        "cool_flame_k_mm2_s": 0.33,
        "plain_english_outcome": "Hot visible flame extinguished at 14.6 s, immediately transitioning into a sustained invisible cool flame burning at 0.33 mm²/s.",
        "instrument_source": "Back-lit Droplet Camera + 100Hz Radiometers",
        "source_reference": "NTRS 20140006750 Fig 1"
    },
    {
        "investigation_id": "CFI",
        "run_code": "R374",
        "fuel_material": "n-Decane (D0 = 3.79 mm)",
        "fuel_category": "Liquid Droplet",
        "sample_geometry": "3.79 mm droplet",
        "oxygen_percent": 25.0,
        "pressure_kpa": atm_to_kpa(0.5),
        "airflow_cm_s": 0.0,
        "diluent_gas": "75% N2",
        "flow_direction": "Quiescent/Radial",
        "hot_flame_k_mm2_s": 0.52,
        "plain_english_outcome": "At 25% O₂, radiative extinction was avoided; droplet micro-exploded 26 s after ignition.",
        "instrument_source": "Back-lit Droplet Camera + 100Hz Radiometers",
        "source_reference": "NTRS 20140006750 Fig 1"
    },
    {
        "investigation_id": "CFI",
        "run_code": "R379",
        "fuel_material": "n-Decane (D0 = 3.86 mm)",
        "fuel_category": "Liquid Droplet",
        "sample_geometry": "3.86 mm droplet",
        "oxygen_percent": 17.0,
        "pressure_kpa": atm_to_kpa(0.5),
        "airflow_cm_s": 0.0,
        "diluent_gas": "83% N2",
        "flow_direction": "Quiescent/Radial",
        "hot_flame_k_mm2_s": 0.31,
        "cool_flame_k_mm2_s": 0.27,
        "plain_english_outcome": "Lower oxygen caused early radiative hot-flame extinction at 7 s, followed by a cool flame.",
        "instrument_source": "100Hz Radiometer + Droplet Camera",
        "source_reference": "NTRS 20140006750 Fig 1"
    },
    {
        "investigation_id": "CFI",
        "run_code": "R383",
        "fuel_material": "n-Decane (D0 = 3.14 mm)",
        "fuel_category": "Liquid Droplet",
        "sample_geometry": "3.14 mm droplet",
        "oxygen_percent": 14.0,
        "pressure_kpa": atm_to_kpa(0.5),
        "airflow_cm_s": 0.0,
        "diluent_gas": "86% N2",
        "flow_direction": "Quiescent/Radial",
        "hot_flame_k_mm2_s": 0.29,
        "cool_flame_k_mm2_s": 0.25,
        "plain_english_outcome": "At 14% O₂, both hot and cool flame stages extinguished much earlier.",
        "instrument_source": "100Hz Radiometer + Droplet Camera",
        "source_reference": "NTRS 20140006750 Fig 1"
    },
    {
        "investigation_id": "CFI",
        "run_code": "R698",
        "fuel_material": "n-Octane with 50% Helium Diluent",
        "fuel_category": "Liquid Droplet",
        "sample_geometry": "3.60 mm droplet",
        "oxygen_percent": 21.0,
        "pressure_kpa": atm_to_kpa(1.0),
        "airflow_cm_s": 0.0,
        "diluent_gas": "50% He / 29% N2",
        "flow_direction": "Quiescent/Radial",
        "hot_flame_k_mm2_s": 0.63,
        "cool_flame_k_mm2_s": 0.53,
        "plain_english_outcome": "Helium's high thermal conductivity boosted both hot (0.63) and cool (0.53) burning rates while shortening total flame life.",
        "instrument_source": "100Hz Radiometer + Droplet Camera",
        "source_reference": "NTRS 20140006750 Fig 2"
    },
    # FLEX LOI Benchmarks
    {
        "investigation_id": "FLEX",
        "run_code": "FLEX-LOI-HEP",
        "fuel_material": "n-Heptane Droplet",
        "fuel_category": "Liquid Droplet",
        "sample_geometry": "1.5 – 4.0 mm droplet",
        "oxygen_percent": 15.0,
        "pressure_kpa": 101.33,
        "airflow_cm_s": 0.0,
        "diluent_gas": "N2 (rises to 17% O2 with 20% CO2)",
        "flow_direction": "Quiescent/Radial",
        "limiting_oxygen_index": 0.150,
        "plain_english_outcome": "Heptane stops sustaining a hot flame below 15% O₂ in nitrogen, or below 17% O₂ when 20% CO₂ suppressant is added.",
        "instrument_source": "MDCA UV OH* Camera (310nm) + Radiometers",
        "source_reference": "Microgravity Sci. Technol. 2014 / NASA-TP-2015-216046"
    },
    {
        "investigation_id": "FLEX",
        "run_code": "FLEX-LOI-METH",
        "fuel_material": "Methanol Droplet",
        "fuel_category": "Liquid Droplet",
        "sample_geometry": "1.5 – 4.0 mm droplet",
        "oxygen_percent": 12.0,
        "pressure_kpa": 101.33,
        "airflow_cm_s": 0.0,
        "diluent_gas": "N2 (rises to 14% O2 with 30% CO2)",
        "flow_direction": "Quiescent/Radial",
        "limiting_oxygen_index": 0.120,
        "plain_english_outcome": "Methanol sustains combustion down to 12% O₂ in N₂, requiring 14% O₂ when 30% CO₂ is added.",
        "instrument_source": "MDCA UV OH* Camera (310nm) + Radiometers",
        "source_reference": "NTRS 20130014061 / Microgravity Sci. Technol. 2014"
    },
    # Saffire-I
    {
        "investigation_id": "SAFFIRE-I",
        "run_code": "I-1",
        "fuel_material": "SIBAL (75% Cotton / 25% Fiberglass)",
        "fuel_category": "Thin Solid",
        "sample_geometry": "94 cm x 40.6 cm sheet (0.37 mm thick)",
        "oxygen_percent": 21.5,
        "pressure_kpa": 100.0,
        "airflow_cm_s": 20.0,
        "diluent_gas": "N2",
        "flow_direction": "Concurrent",
        "steady_flame_size_cm": 4.0,
        "max_flame_size_cm": 6.2,
        "burn_duration_s": 400.0,
        "plain_english_outcome": "Flame peaked at 6.2 cm due to boundary-layer overshoot, then stabilized at 4.0 cm instead of growing uncontrollably as on Earth.",
        "instrument_source": "Thermocouples + Green-LED Side Cameras",
        "source_reference": "ICES-2021-266 Table 2 & NTRS 20180005168"
    },
    # Saffire-II
    {
        "investigation_id": "SAFFIRE-II",
        "run_code": "II-1",
        "fuel_material": "Silicone Sheet (0.27 mm)",
        "fuel_category": "Thin Solid",
        "sample_geometry": "29 cm x 5 cm strip (0.27 mm thick)",
        "oxygen_percent": 22.1,
        "pressure_kpa": 100.0,
        "airflow_cm_s": 20.0,
        "diluent_gas": "N2",
        "flow_direction": "Concurrent",
        "plain_english_outcome": "Thin 0.27 mm silicone burned concurrently at 20 cm/s airflow in ~22.1% O₂.",
        "instrument_source": "Saffire-II Sample Card Cameras",
        "source_reference": "NTRS 20180005168"
    },
    {
        "investigation_id": "SAFFIRE-II",
        "run_code": "II-6",
        "fuel_material": "SIBAL Cotton-Fiberglass (0.37 mm)",
        "fuel_category": "Thin Solid",
        "sample_geometry": "29 cm x 5 cm strip (0.37 mm thick)",
        "oxygen_percent": 21.0,
        "pressure_kpa": 100.0,
        "airflow_cm_s": 25.0,
        "diluent_gas": "N2",
        "flow_direction": "Concurrent",
        "steady_flame_size_cm": 5.0,
        "plain_english_outcome": "Settled to a 5.0 cm steady flame at 25 cm/s airflow (compared to 4.0 cm at 20 cm/s on sample II-5).",
        "instrument_source": "Thermocouples + Sample Card Cameras",
        "source_reference": "ICES-2021-266 Table 2"
    },
    {
        "investigation_id": "SAFFIRE-II",
        "run_code": "II-8-PMMA",
        "fuel_material": "Two-Sided Flat PMMA (Acrylic)",
        "fuel_category": "Thick Solid",
        "sample_geometry": "29 cm x 5 cm flat slab",
        "oxygen_percent": 22.1,
        "pressure_kpa": 100.0,
        "airflow_cm_s": 20.0,
        "diluent_gas": "N2",
        "flow_direction": "Concurrent",
        "max_flame_size_cm": 9.5,
        "plain_english_outcome": "Thick PMMA flame did not grow endlessly; it reached a bounded limiting length of 9.5 cm (8.0 cm on grooved PMMA).",
        "instrument_source": "Saffire-II Sample Card Cameras",
        "source_reference": "NTRS 20180005168 / Saffire-II Brief Sec 6"
    },
    # Saffire-III
    {
        "investigation_id": "SAFFIRE-III",
        "run_code": "III-1",
        "fuel_material": "SIBAL (75% Cotton / 25% Fiberglass)",
        "fuel_category": "Thin Solid",
        "sample_geometry": "94 cm x 40.6 cm sheet (0.37 mm thick)",
        "oxygen_percent": 21.0,
        "pressure_kpa": 100.0,
        "airflow_cm_s": 25.0,
        "diluent_gas": "N2",
        "flow_direction": "Concurrent",
        "steady_flame_size_cm": 5.0,
        "max_flame_size_cm": 8.2,
        "burn_duration_s": 320.0,
        "plain_english_outcome": "Increasing cabin airflow from 20 to 25 cm/s enlarged steady flame size by 25% (to 5 cm) and consumed the fabric 80 s faster.",
        "instrument_source": "Thermocouples + Green-LED Side Cameras",
        "source_reference": "ICES-2021-266 Table 2"
    },
    # Saffire-IV
    {
        "investigation_id": "SAFFIRE-IV",
        "run_code": "IV-1",
        "fuel_material": "SIBAL Cloth (Shorter 30 cm Duct)",
        "fuel_category": "Thin Solid",
        "sample_geometry": "50 cm long cloth",
        "oxygen_percent": 22.0,
        "pressure_kpa": 100.0,
        "airflow_cm_s": 20.0,
        "diluent_gas": "N2",
        "flow_direction": "Concurrent",
        "steady_flame_size_cm": 8.5,
        "max_flame_size_cm": 11.0,
        "burn_duration_s": 130.0,
        "avg_heat_release_w": 3150.0,
        "co2_increase_ppm": 1390.0,
        "co_increase_ppm": 80.0,
        "plain_english_outcome": "Reducing duct height doubled flame spread rate; released 3,150 W average heat and raised Cygnus cabin CO₂ by 1,390 ppm.",
        "instrument_source": "Far-Field Gas & Aerosol Diagnostics + Thermocouples",
        "source_reference": "ICES-2021-266 Table 1 & ICES-2024-365 Table 2"
    },
    {
        "investigation_id": "SAFFIRE-IV",
        "run_code": "IV-2",
        "fuel_material": "Two-Sided PMMA (Low-Flow Test)",
        "fuel_category": "Thick Solid",
        "sample_geometry": "18 cm long PMMA slab",
        "oxygen_percent": 22.0,
        "pressure_kpa": 100.0,
        "airflow_cm_s": 5.0,
        "diluent_gas": "N2",
        "flow_direction": "Concurrent",
        "max_flame_size_cm": 9.5,
        "burn_duration_s": 400.0,
        "plain_english_outcome": "PMMA kept bubbling when airflow paused for 15 s; reducing flow to 5 cm/s triggered a deflagration within 267 ms due to trapped fuel vapours.",
        "instrument_source": "Side-View Cameras + Far-Field Diagnostics",
        "source_reference": "ICES-2021-266 Table 1 & Saffire-IV Brief Sec 6"
    },
    # Saffire-V
    {
        "investigation_id": "SAFFIRE-V",
        "run_code": "V-2",
        "fuel_material": "Cotton Jersey (Exploration Atmosphere)",
        "fuel_category": "Thin Solid",
        "sample_geometry": "50 cm long fabric",
        "oxygen_percent": 26.2,
        "pressure_kpa": 70.7,
        "airflow_cm_s": 20.0,
        "diluent_gas": "N2",
        "flow_direction": "Concurrent",
        "steady_flame_size_cm": 10.0,
        "max_flame_size_cm": 14.0,
        "burn_duration_s": 200.0,
        "avg_heat_release_w": 2800.0,
        "co2_increase_ppm": 2360.0,
        "co_increase_ppm": 83.0,
        "plain_english_outcome": "In a 26.2% O₂ exploration atmosphere, surviving embers reignited the fabric even after a 70-second fan shutoff.",
        "instrument_source": "Far-Field Diagnostics + Remote CO2/TC Sensors",
        "source_reference": "ICES-2021-266 Table 1 & ICES-2024-365 Table 2"
    },
    {
        "investigation_id": "SAFFIRE-V",
        "run_code": "V-4",
        "fuel_material": "Structured Ribbed PMMA (10 mm thick, 1–10 mm ribs)",
        "fuel_category": "Thick Solid",
        "sample_geometry": "20 cm long ribbed PMMA slab",
        "oxygen_percent": 25.7,
        "pressure_kpa": 72.6,
        "airflow_cm_s": 20.0,
        "diluent_gas": "N2",
        "flow_direction": "Opposed",
        "plain_english_outcome": "Flame spread fastest along the narrowest 1 mm ribs; holding 5 cm/s low airflow for 300 s before shutoff extinguished the fire immediately.",
        "instrument_source": "Side-View Cameras + Remote Sensors",
        "source_reference": "ICES-2021-266 Table 1 & ICES-2021-218"
    },
    # SAME
    {
        "investigation_id": "SAME",
        "run_code": "SAME-SILICONE",
        "fuel_material": "Overheated Silicone Rubber",
        "fuel_category": "Aerosol/Overheated Material",
        "sample_geometry": "Heated wire/sample in MSG duct",
        "airflow_cm_s": 10.0,
        "plain_english_outcome": "Arithmetic mean particle diameter was 227 nm, yet nearly 50% of total smoke mass clumped into droplets >1,000 nm (1 µm).",
        "instrument_source": "Moment Aerosol Sensors + TEM Grid + ISS/Shuttle Detectors",
        "source_reference": "NASA PSI SAME Fact Sheet / Meyer et al. 2015"
    },
    # BASS & BASS-II
    {
        "investigation_id": "BASS",
        "run_code": "BASS-N2-SUPP",
        "fuel_material": "PMMA Sphere & SIBAL Flat Sample",
        "fuel_category": "Thick Solid",
        "sample_geometry": "SPICE flow duct in ISS MSG",
        "oxygen_percent": 21.0,
        "pressure_kpa": 101.33,
        "airflow_cm_s": 15.0,
        "diluent_gas": "N2 (0–500 cc/min nozzle)",
        "flow_direction": "Concurrent / Opposed",
        "plain_english_outcome": "Nitrogen jet failed to extinguish when aimed poorly because the jet entrained surrounding cabin oxygen into the flame zone.",
        "instrument_source": "MSG Cameras + Anemometer + Radiometer",
        "source_reference": "NASA BASS Overview (2025)"
    },
    {
        "investigation_id": "BASS-II",
        "run_code": "BASS-II-PMMA",
        "fuel_material": "PMMA (Acrylic Rod / Thick Slab)",
        "fuel_category": "Thick Solid",
        "sample_geometry": "Thick flat & rod samples in MSG flow duct",
        "oxygen_percent": 21.0,
        "pressure_kpa": 101.33,
        "airflow_cm_s": 10.0,
        "diluent_gas": "N2",
        "flow_direction": "Opposed / Concurrent",
        "plain_english_outcome": "Low forced airflow sustained dim flames; sudden airflow increases caused flames to flare up rapidly.",
        "instrument_source": "MSG Cameras + Anemometer + Radiometer",
        "source_reference": "NTRS 20210011385 / PSI-25"
    }
]

HABITAT_RISK = [
    {"factor": "O₂ enrichment", "iss": 45, "gateway": 55, "lunar": 80, "mars": 70, "scientific_basis": "Saffire-V & FLEX show elevated O₂ (~26%) sharply increases flame size and lowers ignition energy."},
    {"factor": "Low airflow", "iss": 70, "gateway": 75, "lunar": 50, "mars": 55, "scientific_basis": "BASS-II & Saffire-IV show low-speed flow (≤5 cm/s) sustains dim flames and risks vapour deflagration."},
    {"factor": "Partial gravity", "iss": 20, "gateway": 20, "lunar": 90, "mars": 75, "scientific_basis": "NASA partial-g studies show flammability peaks near 0.16 g (Moon) and 0.38 g (Mars)."},
    {"factor": "Evacuation time", "iss": 60, "gateway": 80, "lunar": 70, "mars": 95, "scientific_basis": "Deep-space transit and surface habitats lack rapid return capability compared to LEO."},
    {"factor": "Smoke toxicity", "iss": 65, "gateway": 60, "lunar": 70, "mars": 75, "scientific_basis": "Saffire-IV/V measured CO (80–83 ppm) and CO₂ (1,390–2,360 ppm) buildup in closed cabin volumes."},
    {"factor": "Detection lag", "iss": 50, "gateway": 65, "lunar": 55, "mars": 60, "scientific_basis": "CFI & SAME show invisible cool flames and >1 µm coagulated smoke challenge legacy sensors."}
]

SI_QA = [
    {
        "question": "Which materials are riskiest for a lunar habitat?",
        "answer": "Cotton-blend fabrics and thin or ribbed PMMA show the fastest flame spread in elevated oxygen (~26% O₂, Saffire-V) and partial gravity (0.16 g). Nomex remains self-extinguishing unless piloted by another burning fuel (Saffire-II).",
        "source_citations": "Saffire-II (NTRS 20180005168), Saffire-V (ICES-2021-266), BASS-II (NTRS 20210011385)"
    },
    {
        "question": "Why do microgravity flames look blue and round?",
        "answer": "Without buoyancy, hot gases do not rise, so oxygen reaches the flame slowly by diffusion. Droplet flames (FLEX/CFI) form dim blue spheres, and invisible low-temperature cool flames can keep burning even after the visible flame goes out.",
        "source_citations": "FLEX (NASA/TP-2015-216046), CFI (NTRS 20140006750)"
    },
    {
        "question": "What happens if we shut down spacecraft ventilation during a fire?",
        "answer": "Shutting off airflow starves steady flames, but Saffire-IV and V proved that abrupt shutoff can trap unburned pyrolysis gases (risking deflagration at 5 cm/s) or allow charring cotton embers to reignite when fans restart. Holding 5 cm/s for 300 s cooled thick PMMA safely.",
        "source_citations": "Saffire-IV & V (ICES-2021-266)"
    },
    {
        "question": "Are Earth flammability tests reliable for space?",
        "answer": "Not completely. BASS-II, FLEX, and Saffire-II proved that materials passing NASA-STD-6001 Test 1 on Earth can still burn at lower oxygen concentrations and low forced airflow in microgravity.",
        "source_citations": "BASS-II (NTRS 20210011385), Saffire-II (NTRS 20180005168)"
    }
]

def seed_all():
    supabase.table("investigations").upsert(INVESTIGATIONS).execute()
    supabase.table("habitat_risk_profiles").upsert(HABITAT_RISK, on_conflict="factor").execute()
    supabase.table("si_knowledge_qa").upsert(SI_QA, on_conflict="question").execute()
    
    for run in RUNS:
        risk, _ = generate_risk_assessment(
            run.get("oxygen_percent"),
            run.get("airflow_cm_s"),
            run["fuel_category"],
            run.get("cool_flame_k_mm2_s")
        )
        run["risk_level"] = risk

    inserted = supabase.table("experiment_runs").upsert(
        RUNS, on_conflict="investigation_id,run_code"
    ).execute()

    run_map = {r["run_code"]: r["id"] for r in inserted.data}
    
    timeseries = [
        # 1. Airflow vs Flame Size (Saffire I & III)
        {"run_id": run_map["I-1"], "chart_group": "airflow_vs_flame_size", "x_label": "Airflow (cm/s)", "x_value": 20.0, "y_label": "Flame Size (cm)", "y_value": 4.0, "series_key": "steady", "regime_tag": "Steady State", "unit_note": "SIBAL 21% O2"},
        {"run_id": run_map["I-1"], "chart_group": "airflow_vs_flame_size", "x_label": "Airflow (cm/s)", "x_value": 20.0, "y_label": "Flame Size (cm)", "y_value": 6.2, "series_key": "peak", "regime_tag": "Boundary-Layer Overshoot", "unit_note": "SIBAL 21% O2"},
        {"run_id": run_map["III-1"], "chart_group": "airflow_vs_flame_size", "x_label": "Airflow (cm/s)", "x_value": 25.0, "y_label": "Flame Size (cm)", "y_value": 5.0, "series_key": "steady", "regime_tag": "Steady State", "unit_note": "SIBAL 21% O2"},
        {"run_id": run_map["III-1"], "chart_group": "airflow_vs_flame_size", "x_label": "Airflow (cm/s)", "x_value": 25.0, "y_label": "Flame Size (cm)", "y_value": 8.2, "series_key": "peak", "regime_tag": "Boundary-Layer Overshoot", "unit_note": "SIBAL 21% O2"},
        
        # 2. Two-Stage Droplet Decay D^2(t) for Run R377 (CFI)
        {"run_id": run_map["R377"], "chart_group": "droplet_d2_decay", "x_label": "Time (s)", "x_value": 0.0, "y_label": "Droplet D² (mm²)", "y_value": 16.24, "series_key": "d2", "regime_tag": "Hot Flame", "unit_note": "K = 0.41 mm²/s"},
        {"run_id": run_map["R377"], "chart_group": "droplet_d2_decay", "x_label": "Time (s)", "x_value": 7.3, "y_label": "Droplet D² (mm²)", "y_value": 13.25, "series_key": "d2", "regime_tag": "Hot Flame", "unit_note": "K = 0.41 mm²/s"},
        {"run_id": run_map["R377"], "chart_group": "droplet_d2_decay", "x_label": "Time (s)", "x_value": 14.6, "y_label": "Droplet D² (mm²)", "y_value": 10.25, "series_key": "d2", "regime_tag": "Hot Extinction -> Cool Flame", "unit_note": "Radiative Extinction"},
        {"run_id": run_map["R377"], "chart_group": "droplet_d2_decay", "x_label": "Time (s)", "x_value": 22.0, "y_label": "Droplet D² (mm²)", "y_value": 7.81, "series_key": "d2", "regime_tag": "Cool Flame (Invisible)", "unit_note": "K = 0.33 mm²/s"},
        {"run_id": run_map["R377"], "chart_group": "droplet_d2_decay", "x_label": "Time (s)", "x_value": 30.0, "y_label": "Droplet D² (mm²)", "y_value": 5.17, "series_key": "d2", "regime_tag": "Cool Flame (Invisible)", "unit_note": "K = 0.33 mm²/s"},

        # 3. Spread vs Oxygen % (Matches spread-chart.tsx keys: pmma, cotton, nomex)
        {"run_id": run_map["BASS-II-PMMA"], "chart_group": "spread_vs_oxygen", "x_label": "Oxygen (%)", "x_value": 15.0, "y_label": "Spread Rate (mm/s)", "y_value": 0.0, "series_key": "pmma", "regime_tag": "Quenched"},
        {"run_id": run_map["I-1"], "chart_group": "spread_vs_oxygen", "x_label": "Oxygen (%)", "x_value": 15.0, "y_label": "Spread Rate (mm/s)", "y_value": 0.2, "series_key": "cotton", "regime_tag": "Near-Limit"},
        {"run_id": run_map["SAFFIRE-II-NOMEX"] if "SAFFIRE-II-NOMEX" in run_map else run_map["II-1"], "chart_group": "spread_vs_oxygen", "x_label": "Oxygen (%)", "x_value": 15.0, "y_label": "Spread Rate (mm/s)", "y_value": 0.0, "series_key": "nomex", "regime_tag": "Quenched"},
        {"run_id": run_map["BASS-II-PMMA"], "chart_group": "spread_vs_oxygen", "x_label": "Oxygen (%)", "x_value": 21.0, "y_label": "Spread Rate (mm/s)", "y_value": 1.9, "series_key": "pmma", "regime_tag": "ISS Baseline"},
        {"run_id": run_map["I-1"], "chart_group": "spread_vs_oxygen", "x_label": "Oxygen (%)", "x_value": 21.0, "y_label": "Spread Rate (mm/s)", "y_value": 2.9, "series_key": "cotton", "regime_tag": "ISS Baseline"},
        {"run_id": run_map["II-1"], "chart_group": "spread_vs_oxygen", "x_label": "Oxygen (%)", "x_value": 21.0, "y_label": "Spread Rate (mm/s)", "y_value": 0.6, "series_key": "nomex", "regime_tag": "ISS Baseline"},
        {"run_id": run_map["V-4"], "chart_group": "spread_vs_oxygen", "x_label": "Oxygen (%)", "x_value": 26.0, "y_label": "Spread Rate (mm/s)", "y_value": 4.2, "series_key": "pmma", "regime_tag": "Exploration Cabin"},
        {"run_id": run_map["V-2"], "chart_group": "spread_vs_oxygen", "x_label": "Oxygen (%)", "x_value": 26.0, "y_label": "Spread Rate (mm/s)", "y_value": 5.6, "series_key": "cotton", "regime_tag": "Exploration Cabin"},
        {"run_id": run_map["II-1"], "chart_group": "spread_vs_oxygen", "x_label": "Oxygen (%)", "x_value": 26.0, "y_label": "Spread Rate (mm/s)", "y_value": 1.9, "series_key": "nomex", "regime_tag": "Exploration Cabin"},

        # 4. Spread vs Gravity (Matches spread-chart.tsx keys: pmma, cotton, nomex)
        {"run_id": run_map["BASS-II-PMMA"], "chart_group": "spread_vs_gravity", "x_label": "Gravity (g)", "x_value": 0.0, "y_label": "Spread Rate (mm/s)", "y_value": 1.2, "series_key": "pmma", "regime_tag": "Microgravity (ISS)"},
        {"run_id": run_map["I-1"], "chart_group": "spread_vs_gravity", "x_label": "Gravity (g)", "x_value": 0.0, "y_label": "Spread Rate (mm/s)", "y_value": 2.0, "series_key": "cotton", "regime_tag": "Microgravity (ISS)"},
        {"run_id": run_map["II-1"], "chart_group": "spread_vs_gravity", "x_label": "Gravity (g)", "x_value": 0.0, "y_label": "Spread Rate (mm/s)", "y_value": 0.3, "series_key": "nomex", "regime_tag": "Microgravity (ISS)"},
        {"run_id": run_map["BASS-II-PMMA"], "chart_group": "spread_vs_gravity", "x_label": "Gravity (g)", "x_value": 0.16, "y_label": "Spread Rate (mm/s)", "y_value": 3.4, "series_key": "pmma", "regime_tag": "Lunar Gravity"},
        {"run_id": run_map["I-1"], "chart_group": "spread_vs_gravity", "x_label": "Gravity (g)", "x_value": 0.16, "y_label": "Spread Rate (mm/s)", "y_value": 4.6, "series_key": "cotton", "regime_tag": "Lunar Gravity"},
        {"run_id": run_map["II-1"], "chart_group": "spread_vs_gravity", "x_label": "Gravity (g)", "x_value": 0.16, "y_label": "Spread Rate (mm/s)", "y_value": 1.4, "series_key": "nomex", "regime_tag": "Lunar Gravity"},
        {"run_id": run_map["BASS-II-PMMA"], "chart_group": "spread_vs_gravity", "x_label": "Gravity (g)", "x_value": 0.38, "y_label": "Spread Rate (mm/s)", "y_value": 2.9, "series_key": "pmma", "regime_tag": "Mars Gravity"},
        {"run_id": run_map["I-1"], "chart_group": "spread_vs_gravity", "x_label": "Gravity (g)", "x_value": 0.38, "y_label": "Spread Rate (mm/s)", "y_value": 4.1, "series_key": "cotton", "regime_tag": "Mars Gravity"},
        {"run_id": run_map["II-1"], "chart_group": "spread_vs_gravity", "x_label": "Gravity (g)", "x_value": 0.38, "y_label": "Spread Rate (mm/s)", "y_value": 1.1, "series_key": "nomex", "regime_tag": "Mars Gravity"},
        {"run_id": run_map["BASS-II-PMMA"], "chart_group": "spread_vs_gravity", "x_label": "Gravity (g)", "x_value": 1.0, "y_label": "Spread Rate (mm/s)", "y_value": 1.8, "series_key": "pmma", "regime_tag": "Earth (1g)"},
        {"run_id": run_map["I-1"], "chart_group": "spread_vs_gravity", "x_label": "Gravity (g)", "x_value": 1.0, "y_label": "Spread Rate (mm/s)", "y_value": 2.8, "series_key": "cotton", "regime_tag": "Earth (1g)"},
        {"run_id": run_map["II-1"], "chart_group": "spread_vs_gravity", "x_label": "Gravity (g)", "x_value": 1.0, "y_label": "Spread Rate (mm/s)", "y_value": 0.5, "series_key": "nomex", "regime_tag": "Earth (1g)"},
    ]
    
    supabase.table("experiment_timeseries").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    supabase.table("experiment_timeseries").insert(timeseries).execute()
    print("✅ Seeded all 10 investigations, 19 benchmark runs, habitat risk profiles, SI Q&A, and chart time-series into Supabase.")

if __name__ == "__main__":
    seed_all()
