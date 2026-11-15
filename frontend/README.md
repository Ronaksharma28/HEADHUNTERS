# NASA Microgravity Combustion & Cabin Fire Dynamics Suite (Enhanced Edition)

An advanced interactive research dashboard and physics simulation suite built with open telemetry from NASA's **Physical Sciences Informatics (PSI)**, **NASA Open Data Portal (data.nasa.gov)**, and **NASA Technical Reports Server (NTRS)**.

---

## 🚀 Key Upgrades & New Features

### 1. 🌌 Revolving & Twinkling Deep-Space Cosmic Background
- **420+ Multi-Spectral Stars**: Features O, B, A, G, and M spectral stellar classes (cyan, white, electric blue, solar gold, warm amber, and magenta) with realistic phase-shifted sinusoidal scintillation (twinkling).
- **Revolving Celestial Orbitals**: 3D perspective rotational projection around the cosmic axis with revolving mission stations (ISS Destiny Lab, Gateway Node 1, Cygnus Free-Flyer).
- **Deep Space Nebulae**: Soft, pulsing gas clouds with drifting celestial gradients.
- **Dynamic Meteors**: Fiery shooting stars streaking randomly across the void with glowing ion tails.
- **Interactive Constellations**: Stars near the cursor connect with fine cyan constellation links.

### 2. 🪐 Dual Cybernetic Cursor & Dynamic Hover Effects
- **Dual Cursor Architecture**: High-precision cyan targeting core coupled with a smooth-lerped orbital follower ring that expands, pulses, and dashes on clickable targets.
- **Rocket Stardust Trail**: Emits fading spark particles with fluid physics as the cursor moves across the dashboard.
- **3D Card Tilt & Specular Spotlight**: All panels and flashcards compute live cursor position (`--mouse-x`, `--mouse-y`) to cast a specular reflection and tilt up to 6° in 3D perspective.

### 3. 🎴 Translucent 3D Flashcard Deck & Study Mode
- **Glassmorphism Translucency**: `backdrop-filter: blur(16px)` with layered refractive cyan borders (`rgba(0, 245, 255, 0.16)`).
- **3D Flashcard Flip Mechanics**:
  - **Front Face**: Investigation code, facility badge, research challenge question, short summary, and key telemetry metrics.
  - **Back Face**: NASA PSI discovery, fluid transport mechanism law, and spacecraft flight safety consequences.
- **Flashcard Study Deck Mode**: Step-by-step single-card study mode with **Next**, **Previous**, **Shuffle**, category filters, and keyboard shortcut (`Spacebar` to flip).
- **Multi-Category Filter & Real-Time Search**: Filter by Droplets, Gaseous Diffusion, Solids & Polymers, Large-Scale Cygnus, or Smoke Aerosols.

### 4. 🔥 Enhanced Live Flame Canvas & Interactive Thermal Probe HUD
- **Real-Time Thermal Probe**: Hovering anywhere on the flame canvas displays a holographic HUD crosshair calculating local coordinates, local gas temperature ($K$ and $°C$), airflow velocity, and oxygen transport fraction.
- **Interactive Click-to-Ignite / Perturb**: Clicking on the canvas triggers an ignition spark cluster and expanding hydrodynamic shockwave ripple.
- **Prominent Airflow Vectors**: Flow streamlines with animated direction arrows showing ECLSS diffuser injection, thermal deflection, and exhaust duct suction.

### 5. 🔊 Web Audio API Spaceflight Sound Synthesizer
- Built-in, zero-dependency audio synthesizer creating subtle futuristic tones:
  - Micro-frequency hover ticks
  - Holographic confirmation chirps
  - Flashcard whoosh flip sounds
  - Emergency warning klaxon alarms
  - Plasma spark hiss bursts
- Toggleable anytime from the topbar (`🔊 Audio: ON / 🔇 Audio: OFF`).

### 6. 📐 Interactive Dimensionless Scaling Calculator
- In **Comparative Analysis & Theory**, interactively adjust characteristic length ($L$), ventilation velocity ($U$), and gravity ($g$) to calculate:
  - **Grashof Number ($Gr$)**: Natural buoyant convection strength.
  - **Reynolds Number ($Re$)**: Forced convective inertia.
  - **Froude Number ($Fr$)**: Inertial vs. gravitational force ratio.
  - **Mixed Convection Regime Badge**: Instant prediction of whether buoyant convection, forced convection, or pure molecular diffusion dominates.

### 7. 📊 Interactive SI Ranking Leaderboard
- Search and sortable table comparing Limiting Oxygen Index (LOI), peak zero-g spread rates, and Safety Index (SI) scores for spacecraft cabin polymers, fuels, and extinguishing agents.
- Click any table header (Rank, Name, Category, SI Score) to sort ascending or descending.

### 8. 🤖 AI Assistant with Typewriter Engine & Instant Copy
- Indexed knowledge engine covering FLEX, ACME, BASS, Saffire, SAME, and SoFIE with real-time typewriter text animation and a one-click copy button.

---

## 📁 File Structure

```
nasa-microgravity-suite/
├── index.html          # Main HTML structure with background canvas and 8 module views
├── css/
│   └── styles.css      # Translucent glassmorphism, 3D flip card rules, cybernetic cursor styles
├── js/
│   ├── audio-fx.js     # Web Audio API sound synthesizer engine
│   ├── space-theme.js  # Twinkling & revolving starfield, meteors, constellations, dual cursor
│   ├── data.js         # NASA PSI investigations, flashcard Q&A, and SI ranking dataset
│   ├── simulation.js   # Live flame physics, airflow streamlines, and thermal probe HUD
│   └── app.js          # Flashcard deck controller, telemetry charts, AI assistant, calculator
└── README.md           # Documentation
```

---

## 💻 How to Run

1. Open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Apple Safari).
2. Enjoy full interactivity—no server, build step, or external package manager required!
