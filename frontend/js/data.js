// NASA Physical Sciences Informatics (PSI) & NTRS Microgravity Combustion Dataset
// Enriched with Flashcard Q&A, Categories, Dimensionless Scaling Data, and High-Precision Telemetry

const NASA_EXPERIMENTS = [
  {
    id: "flex",
    code: "PSI-69 // ISS CIR",
    title: "Flame Extinguishment Experiment (FLEX & FLEX-2)",
    facility: "ISS Combustion Integrated Rack (CIR)",
    category: "Droplets",
    categoryLabel: "Droplet Combustion",
    icon: "💧",
    accentColor: "#00f5ff",
    flashcardFront: {
      question: "What unexpected 2-stage combustion phenomenon occurs when hydrocarbon fuel droplets burn in microgravity?",
      hint: "Observed in CIR sealed chamber when visible yellow/blue flame extinguished at large diameters.",
      keyMetric: "Droplet D₀ ≈ 1.5–5 mm | ~600 K Regime"
    },
    flashcardBack: {
      discovery: "Quasi-Steady 'Cool Flames' sustained purely by low-temperature alkylperoxy radical chemistry without visible soot luminescence.",
      physicsLaw: "Volumetric radiative heat loss (Q̇_rad ∝ T⁴·V_flame) drops flame temperature below hot ignition, transitioning to an invisible, low-temperature reaction zone producing CO & formaldehyde.",
      flightImpact: "Conventional spacecraft optical/soot fire detectors miss cool flames. Requires sensitive multi-spectral IR/UV and CO/formaldehyde gas sensors for Lunar Gateway & Mars transit."
    },
    shortSummary:
      "Conducted inside the ISS Combustion Integrated Rack, FLEX studied isolated liquid fuel droplets burning in microgravity across varied oxygen and inert-gas mixtures. Without buoyant convection, droplets formed symmetric spherical flames that exhibited unexpected two-stage combustion—transitioning from visible hot flames into invisible, low-temperature cool flames sustained by peroxide chemistry before final extinction.",
    deepExplanation:
      "In FLEX and FLEX-2, millimeter-scale heptane, octane, methanol, and decane droplets were deployed onto support fibers or free-floated inside a sealed 90-liter chamber. By eliminating gravity-induced buoyancy, researchers isolated purely diffusive transport and radiative heat loss. Large droplets cooled radiatively until visible soot luminescence vanished, yet fuel vaporization continued steadily via a ~600 K cool-flame reaction zone.",
    findings: [
      "Discovered quasi-steady two-stage 'cool flames' in pure alkane droplets under microgravity.",
      "Established conservative Limiting Oxygen Index (LOI) curves for CO₂, N₂, and He suppressants.",
      "Demonstrated that radiative heat loss drives flame extinction at large droplet diameters."
    ],
    chart1: {
      title: "Droplet Diameter² Decay & Cool Flame Transition (n-Heptane)",
      type: "line",
      labels: ["0s", "2s", "4s", "6s", "8s", "10s", "12s"],
      datasetLabel: "Normalized D² (mm²)",
      data: [9.0, 7.4, 5.8, 4.3, 3.1, 2.0, 0.9],
      color: "#00f5ff"
    },
    chart2: {
      title: "Extinction Oxygen Mole Fraction (%) — 1g vs 0g",
      type: "bar",
      labels: ["N₂ Diluent", "CO₂ Diluent", "He Diluent"],
      g1: [16.8, 19.5, 18.2],
      g0: [13.9, 16.4, 15.1]
    }
  },
  {
    id: "acme",
    code: "PSI-ACME // ISS CIR",
    title: "Advanced Combustion via Microgravity Experiments (ACME)",
    facility: "ISS Combustion Integrated Rack (CIR)",
    category: "Gaseous",
    categoryLabel: "Gaseous Diffusion",
    icon: "🔥",
    accentColor: "#ff7b00",
    flashcardFront: {
      question: "Why do microgravity gaseous diffusion flames yield 5× to 8× more soot than identical terrestrial flames?",
      hint: "Think about residence time of fuel molecules without buoyant upward acceleration.",
      keyMetric: "Soot Volume Fraction: 5×–8× 1g Baseline"
    },
    flashcardBack: {
      discovery: "Absence of buoyant acceleration drastically increases fuel molecule residence time in the high-temperature pyrolysis zone.",
      physicsLaw: "On Earth, hot gas accelerates upward at U ~ √(g·L·ΔT/T_inf) ~ 1.5 m/s. In 0g (Gr → 0), transport is molecular diffusion only (D ~ 0.2 cm²/s), allowing massive soot inception, polycyclic aromatic coagulation, and growth.",
      flightImpact: "Overheats cabin air filters rapidly, generates heavy toxic particulate loads, and elevates radiant heat flux to adjacent spacecraft avionics racks."
    },
    shortSummary:
      "ACME comprised six gaseous flame investigations aboard the ISS aimed at improving terrestrial fuel efficiency and spacecraft fire safety. Using Thin Filament Pyrometry and electric-field probes, ACME measured soot production, flame temperature, and extinction limits, revealing that microgravity diffusion flames can produce five to eight times more soot than Earth flames.",
    deepExplanation:
      "ACME utilized porous spherical and co-flow burners with methane, ethylene, and diluted hydrocarbon fuels. Because hot gases do not rise in 0g, fuel molecules remain in the high-temperature pyrolysis zone far longer, dramatically increasing soot nucleation and growth. Simultaneously, highly diluted weak flames proved more stable in microgravity than in normal gravity.",
    findings: [
      "Microgravity flames generated 5× to 8× higher soot volume fractions due to extended residence times.",
      "Extended dilution limits allowed lifted, soot-free blue flames to persist at lower fuel concentrations.",
      "Validated Thin Filament Pyrometry (TFP) with SiC fibers for measuring dim blue flame temperatures."
    ],
    chart1: {
      title: "Soot Volume Fraction (ppm) vs. Fuel Residence Time",
      type: "line",
      labels: ["20 ms", "40 ms", "60 ms", "80 ms", "100 ms", "120 ms"],
      datasetLabel: "0g Soot Volume Fraction (ppm)",
      data: [0.8, 2.1, 4.4, 6.9, 9.2, 11.4],
      color: "#ff7b00"
    },
    chart2: {
      title: "Peak Soot Yield & Flame Width Ratio (0g vs 1g)",
      type: "bar",
      labels: ["Peak Soot (ppm)", "Flame Width (mm)", "Dilution Limit (%)"],
      g1: [1.8, 12, 18],
      g0: [11.4, 29, 11]
    }
  },
  {
    id: "bass",
    code: "PSI-BASS // ISS MSG",
    title: "Burning and Suppression of Solids (BASS & BASS-II)",
    facility: "ISS Microgravity Science Glovebox (MSG)",
    category: "Solids",
    categoryLabel: "Solid Polymers & Fabrics",
    icon: "🪵",
    accentColor: "#38bdf8",
    flashcardFront: {
      question: "Why can a material that self-extinguishes in stagnant 0g suddenly burn fiercely inside a crewed spacecraft?",
      hint: "Consider life-support cabin ventilation fans (ECLSS).",
      keyMetric: "Critical Flow Window: 10–25 cm/s"
    },
    flashcardBack: {
      discovery: "Gentle cabin airflow (10–25 cm/s) sweeps away suffocating CO₂/soot blankets while continuously delivering fresh O₂ to the pyrolyzing fuel.",
      physicsLaw: "In stagnant zero-g, combustion products blanket the fuel, causing diffusive choke and radiative quench. Forced low-velocity airflow matches chemical kinetic reaction rates at peak Damköhler number (Da ≈ 1).",
      flightImpact: "Emergency fire protocol MUST immediately interlock and shutdown ECLSS cabin circulation fans upon smoke detection to avoid accelerating flame spread."
    },
    shortSummary:
      "BASS examined how solid polymers, cotton-fiberglass fabrics, and electrical wire insulations burn and extinguish under low-velocity cabin airflow in microgravity. Results proved that materials which self-extinguish in stagnant zero gravity will burn steadily when exposed to gentle ventilation flows typical of spacecraft life-support ducts, reshaping NASA material flammability screening.",
    deepExplanation:
      "Inside the Microgravity Science Glovebox, flat sheets, rods, and spheres of PMMA, Nomex, and SIBAL fabric were ignited under controlled opposed and concurrent airflows (0 to 50 cm/s). Without airflow, combustion products blanket the fuel and choke the flame; adding 10–20 cm/s airflow strips away CO₂ and supplies fresh O₂, creating a peak flammability window.",
    findings: [
      "Identified a critical low-flow flammability peak between 10 and 25 cm/s cabin ventilation.",
      "Demonstrated that nitrogen/CO₂ extinguishing agents require higher concentrations when airflow persists.",
      "Directly informed NASA-STD-6001B upward vs. microgravity material qualification protocols."
    ],
    chart1: {
      title: "Solid PMMA Flame Spread Rate vs. Cabin Airflow Velocity",
      type: "line",
      labels: ["0 cm/s", "5 cm/s", "10 cm/s", "15 cm/s", "25 cm/s", "40 cm/s"],
      datasetLabel: "Flame Spread Rate (mm/s)",
      data: [0.0, 0.85, 1.65, 1.92, 1.75, 1.30],
      color: "#38bdf8"
    },
    chart2: {
      title: "Minimum O₂ for Flame Spread (%) — 1g vs 0g (15 cm/s flow)",
      type: "bar",
      labels: ["PMMA Acrylic", "Cotton-Fiberglass", "Nomex Blend"],
      g1: [17.5, 18.8, 26.0],
      g0: [15.1, 16.0, 22.8]
    }
  },
  {
    id: "saffire",
    code: "PSI-SAFFIRE // CYGNUS",
    title: "Spacecraft Fire Safety Demonstration (Saffire I–VI)",
    facility: "Northrop Grumman Cygnus Resupply Vehicle",
    category: "LargeScale",
    categoryLabel: "Large-Scale Vehicle Fires",
    icon: "🚀",
    accentColor: "#ef4444",
    flashcardFront: {
      question: "How does combustion scale up from small glovebox samples to meter-scale panels in a realistic spacecraft cabin?",
      hint: "Tested inside Cygnus cargo spacecraft after departing the ISS.",
      keyMetric: "Test Specimen: 0.4 m × 1.0 m Panels | O₂ up to 34%"
    },
    flashcardBack: {
      discovery: "Flame spread reaches a stable limiting velocity; toxic CO, HCN, and aerosols mix uniformly through cabin volume without thermal stratification.",
      physicsLaw: "Without gravity to create buoyant smoke ceilings (thermal layering), toxic combustion gases disperse isotropically throughout the entire pressurized hull via ECLSS ducts.",
      flightImpact: "Astronauts cannot 'stay low under smoke' as on Earth. Crew must immediately don Self-Contained Breathing Apparatus (SCBA) or Emergency Breathing Masks regardless of cabin elevation."
    },
    shortSummary:
      "Saffire conducted the largest controlled fire experiments ever performed in space inside uncrewed Cygnus cargo vehicles after ISS departure. By igniting meter-scale composite panels and cabin textiles under realistic ventilation and elevated oxygen levels, Saffire quantified full-scale cabin heat release, smoke transport, and post-fire toxic gas scrubbing.",
    deepExplanation:
      "Because crewed ISS facilities restrict fire size to centimeters, Saffire utilized departing Cygnus vehicles as full-scale testbeds. Sensors tracked flame spread across 0.4 m × 1.0 m cotton-fiberglass and PMMA panels, measuring cabin pressure rise, CO/CO₂ concentration gradients, and scrubber recovery time.",
    findings: [
      "Confirmed flame spread reaches a steady limiting velocity in large-scale microgravity ducts.",
      "Demonstrated rapid uniform mixing of CO and smoke aerosols throughout unstratified cabin air.",
      "Validated spacecraft smoke detector placement and post-fire scrubber clean-up models."
    ],
    chart1: {
      title: "Saffire-IV Cabin CO Concentration & Scrubber Decay",
      type: "line",
      labels: ["0 min", "2 min", "5 min", "10 min", "20 min", "40 min"],
      datasetLabel: "Cabin CO (ppm)",
      data: [2, 145, 310, 240, 115, 28],
      color: "#ef4444"
    },
    chart2: {
      title: "Large-Scale Flame Spread Velocity (mm/s) by O₂ Level",
      type: "bar",
      labels: ["21% O₂ (ISS)", "26.5% O₂ (Orion)", "34% O₂ (Gateway)"],
      g1: [3.2, 5.8, 9.4],
      g0: [2.4, 4.9, 8.6]
    }
  },
  {
    id: "same",
    code: "PSI-SAME // ISS MSG",
    title: "Smoke Aerosol Measurement Experiment (SAME)",
    facility: "ISS Microgravity Science Glovebox (MSG)",
    category: "Aerosols",
    categoryLabel: "Smoke Aerosols & Detection",
    icon: "🌫️",
    accentColor: "#c084fc",
    flashcardFront: {
      question: "Why do standard terrestrial ionization smoke detectors fail to reliably detect overheated wire smoke in microgravity?",
      hint: "Microgravity smoke particles coagulate much longer before reaching sensors.",
      keyMetric: "Smoke Particle Diameter: 2×–4× Larger"
    },
    flashcardBack: {
      discovery: "Microgravity smoke aggregates grow significantly larger (2× to 4× mean diameter) through extended Brownian agglomeration without buoyant sweep.",
      physicsLaw: "Ionization chambers rely on small nanoparticles (~20–80 nm) capturing ionizing alpha charges. Microgravity generates massive agglomerated clusters (200–800 nm), scattering optical light far more efficiently than ionizing current drops.",
      flightImpact: "Spurred NASA to abandon ionization alarms in deep space, adopting dual-wavelength optical/photoelectric obscuration detectors for Orion and Lunar Gateway."
    },
    shortSummary:
      "SAME characterized the size distribution and coagulation dynamics of smoke particles generated by overheated spacecraft materials in microgravity. Because zero-gravity flames have longer residence times and lack buoyant mixing, smoke particulates grow significantly larger than on Earth, challenging conventional ionization smoke detectors designed for terrestrial aerosols.",
    deepExplanation:
      "Tested across Teflon wire insulation, Kapton tape, silicone rubber, and cellulose, SAME used thermophoretic sampling and optical/ionization counters to measure particle diameters from 10 nm to 10 µm. Findings guided multi-wavelength photoelectric detector designs for Orion and Lunar Gateway.",
    findings: [
      "Zero-g smoke aggregates are 2× to 4× larger in mean diameter than 1g smoke particles.",
      "Ionization detectors under-responded to aged microgravity smoke compared to optical scatter sensors.",
      "Led to dual-wavelength photoelectric smoke detectors for deep-space exploration vehicles."
    ],
    chart1: {
      title: "Mean Smoke Particle Diameter Growth in Microgravity",
      type: "line",
      labels: ["10s", "30s", "60s", "120s", "180s", "240s"],
      datasetLabel: "Mean Particle Diameter (nm)",
      data: [65, 140, 260, 410, 520, 590],
      color: "#c084fc"
    },
    chart2: {
      title: "Detector Response Index (Higher = Faster Detection)",
      type: "bar",
      labels: ["Teflon Wire", "Kapton Film", "Silicone Seal"],
      g1: [82, 78, 85],
      g0: [44, 51, 58]
    }
  },
  {
    id: "sofie",
    code: "PSI-SOFIE // ISS CIR",
    title: "Solid Fuel Ignition and Extinction (SoFIE)",
    facility: "ISS Combustion Integrated Rack (CIR)",
    category: "Solids",
    categoryLabel: "Exploration Atmospheres (34% O₂)",
    icon: "🛡️",
    accentColor: "#10b981",
    flashcardFront: {
      question: "How does the Artemis / Lunar Gateway 34% O₂ exploration atmosphere alter solid material ignition and flammability?",
      hint: "Gateway operates at reduced pressure (56.5 kPa) with enriched oxygen (34% O₂).",
      keyMetric: "56.5 kPa / 34% O₂ | Ignition Delay -73%"
    },
    flashcardBack: {
      discovery: "Elevated oxygen severely slashes ignition delay time and lowers critical heat flux, rendering normally flame-retardant materials flammable.",
      physicsLaw: "Higher oxygen mole fraction accelerates gas-phase kinetic reaction rates, overwhelming the heat absorption of reduced nitrogen diluent.",
      flightImpact: "Requires re-certification of all flight interior polymers under NASA-STD-6001B Test 1 at elevated oxygen levels specifically tailored for Artemis habitats."
    },
    shortSummary:
      "SoFIE is NASA's premier ISS investigation supporting Artemis lunar and Mars exploration fire safety. Studying solid polymers and fabrics inside the Combustion Integrated Rack under variable pressures and elevated oxygen concentrations (up to 34% O₂), SoFIE bridges terrestrial NASA-STD-6001 flammability tests with true microgravity and partial-gravity fire behavior.",
    deepExplanation:
      "SoFIE comprises five sub-investigations (GEL, MIST, RTDFS, SMuRF, and WIST) examining radiant ignition, opposed-flow flame spread, and material thickness effects in reduced-pressure, oxygen-enriched exploration atmospheres.",
    findings: [
      "Quantified ignition delay reduction in 56.5 kPa / 34% O₂ exploration atmospheres.",
      "Provided benchmark data correlating 1g upward flame spread with 0g forced-flow flammability.",
      "Enabled safer habitat interior material selection for Lunar Gateway and Mars transit."
    ],
    chart1: {
      title: "Ignition Delay Time vs. Cabin Oxygen Concentration",
      type: "line",
      labels: ["21% O₂", "24% O₂", "27% O₂", "30% O₂", "34% O₂"],
      datasetLabel: "Ignition Delay (seconds)",
      data: [14.2, 10.5, 7.6, 5.4, 3.8],
      color: "#10b981"
    },
    chart2: {
      title: "Critical Heat Flux for Ignition (kW/m²) — 1g vs 0g",
      type: "bar",
      labels: ["Cast PMMA", "FR Cotton", "Polycarbonate"],
      g1: [16.5, 21.0, 24.5],
      g0: [12.8, 17.2, 20.1]
    }
  }
];

const SI_RANKING_DATA = [
  { rank: 1, name: "Fine Water Mist (Sub-50 µm)", category: "Suppressant", loi: "N/A (Active)", spread: "Extinguishes < 2.5s", score: 96, rating: "Optimal Exploration Agent" },
  { rank: 2, name: "PTFE / Teflon Wire Insulation", category: "Polymer", loi: "95.0% O₂", spread: "0.00 mm/s (Self-Ext.)", score: 94, rating: "Flight Certified (Class A)" },
  { rank: 3, name: "Kapton Polyimide Film", category: "Polymer", loi: "37.0% O₂", spread: "0.18 mm/s", score: 88, rating: "Flight Certified (Class A)" },
  { rank: 4, name: "CO₂ / N₂ Inert Gas Flooding", category: "Suppressant", loi: "Drops O₂ < 13%", spread: "Extinguishes < 4.0s", score: 85, rating: "ISS Standard Suppressant" },
  { rank: 5, name: "Nomex Aramid Cabin Fabric", category: "Polymer", loi: "22.8% O₂ (0g)", spread: "0.42 mm/s", score: 79, rating: "Approved w/ Flow Limits" },
  { rank: 6, name: "SIBAL Cotton-Fiberglass Blend", category: "Polymer", loi: "16.0% O₂ (0g)", spread: "1.15 mm/s", score: 62, rating: "Research Reference Standard" },
  { rank: 7, name: "Silicone Elastomer Seals", category: "Polymer", loi: "19.5% O₂ (0g)", spread: "0.95 mm/s", score: 58, rating: "Restricted Mass Limit" },
  { rank: 8, name: "Cast PMMA (Acrylic Viewport)", category: "Polymer", loi: "15.1% O₂ (0g)", spread: "1.92 mm/s", score: 41, rating: "Requires Shielding / Flow Control" },
  { rank: 9, name: "Methanol / Alcohol Fuel Vapor", category: "Fuel", loi: "11.2% O₂ (0g)", spread: "Invisible Flame Hazard", score: 26, rating: "Strict Containment Only" },
  { rank: 10, name: "n-Heptane Hydrocarbon Droplets", category: "Fuel", loi: "13.9% O₂ (0g)", spread: "Two-Stage Cool Flame", score: 22, rating: "CIR Sealed Chamber Only" }
];
