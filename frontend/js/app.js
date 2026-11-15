// NASA Microgravity Combustion & Cabin Fire Dynamics Suite
// Core Application Controller: Navigation, 3D Translucent Flashcards,
// Telemetry Graphs, AI Typewriter Assistant, Dimensionless Calculator, and SI Leaderboard

let primaryChartInstance = null;
let secondaryChartInstance = null;
let theoryChartInstance = null;
let riskRadarInstance = null;
let siBarInstance = null;

let currentDeckIndex = 0;
let currentDeckFilter = "all";
let currentViewMode = "grid"; // "grid" or "study"
let siSortColumn = "rank";
let siSortAsc = true;

const VIEW_METADATA = {
  dashboard: {
    title: "Space Exploration & Zero-Gravity Fire Behavior",
    subtitle: "Physical Sciences Informatics (PSI) Telemetry & Flight Science"
  },
  experiments: {
    title: "NASA Microgravity Combustion Investigations",
    subtitle: "Translucent 3D Flashcard Deck & High-Resolution Telemetry Graphs"
  },
  livemodel: {
    title: "Live Flame & Prominent Cabin Airflow Model",
    subtitle: "Real-Time ECLSS Ventilation Vector, Diffusion Physics & Thermal Probe HUD"
  },
  assistant: {
    title: "NASA Microgravity Combustion AI Research Assistant",
    subtitle: "Knowledge Engine Indexed on FLEX, ACME, BASS, Saffire, SAME & SoFIE"
  },
  comparative: {
    title: "Comparative Analysis & Combustion Theory",
    subtitle: "Grashof, Damköhler, Froude & Lewis Number Interactive Scaling Engine"
  },
  risk: {
    title: "Mission Fire Risk Profile & FMEA Evaluator",
    subtitle: "Spacecraft Atmosphere, Ventilation & Material Hazard Matrix"
  },
  siranking: {
    title: "Spacecraft Flammability & Safety Index (SI Ranking)",
    subtitle: "NASA-STD-6001B & PSI Material / Suppressant Benchmark Leaderboard"
  },
  references: {
    title: "NASA Open Data & Scientific References",
    subtitle: "Official NTRS OpenAPI, data.nasa.gov & PSI Archive Links"
  }
};

/* ========================================================
   1. NAVIGATION & VIEW SWITCHING
   ======================================================== */
function switchView(viewId) {
  document.querySelectorAll(".view-section").forEach((sec) => sec.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach((btn) => btn.classList.remove("active"));

  const targetSec = document.getElementById(`view-${viewId}`);
  const targetBtn = document.querySelector(`.nav-item[data-view="${viewId}"]`);
  if (targetSec) targetSec.classList.add("active");
  if (targetBtn) targetBtn.classList.add("active");

  if (VIEW_METADATA[viewId]) {
    document.getElementById("viewTitle").textContent = VIEW_METADATA[viewId].title;
    document.getElementById("viewSubtitle").textContent = VIEW_METADATA[viewId].subtitle;
  }

  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.classList.remove("open");

  if (viewId === "comparative") {
    renderTheoryChart();
    updateDimensionlessCalculator();
  }
  if (viewId === "risk") updateRiskProfile();
  if (viewId === "siranking") renderSIRanking();
  if (viewId === "experiments") renderExperimentCards();
}

document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => switchView(btn.dataset.view));
});

const menuToggle = document.getElementById("menuToggle");
if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });
}

/* ========================================================
   2. TRANSLUCENT 3D FLASHCARD DECK & EXPERIMENTS
   ======================================================== */
function getFilteredExperiments() {
  const searchInput = document.getElementById("expSearchInput");
  const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

  return NASA_EXPERIMENTS.filter((exp) => {
    const matchesCategory = currentDeckFilter === "all" || exp.category === currentDeckFilter;
    const matchesSearch =
      !query ||
      exp.title.toLowerCase().includes(query) ||
      exp.code.toLowerCase().includes(query) ||
      exp.shortSummary.toLowerCase().includes(query) ||
      exp.flashcardFront.question.toLowerCase().includes(query) ||
      exp.flashcardBack.discovery.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
}

function renderExperimentCards() {
  const container = document.getElementById("experimentList");
  if (!container) return;

  const experiments = getFilteredExperiments();

  if (currentViewMode === "study") {
    renderStudyDeckMode(container, experiments);
    return;
  }

  // Grid Flashcards View
  if (experiments.length === 0) {
    container.innerHTML = `
      <div class="no-results-box">
        <p>No NASA investigations found matching your filter.</p>
        <button class="chip" onclick="resetExpFilters()">Reset Filters</button>
      </div>`;
    return;
  }

  container.className = "experiment-cards-grid";
  container.innerHTML = experiments
    .map(
      (exp) => `
    <div class="flashcard-3d-wrapper" id="wrapper-${exp.id}">
      <div class="flashcard-inner" id="card-${exp.id}">
        <!-- FRONT SIDE OF FLASHCARD -->
        <article class="flashcard-face flashcard-front">
          <div class="tech-corner tl">+</div>
          <div class="tech-corner tr">+</div>
          <div class="exp-card-top">
            <span class="exp-code">_${exp.code}</span>
            <span class="facility-badge">${exp.facility}</span>
          </div>
          <h4 class="card-title">${exp.title}</h4>
          <div class="flashcard-question-box">
            <span class="question-label">_MISSION RESEARCH CHALLENGE</span>
            <p class="question-text">${exp.flashcardFront.question}</p>
          </div>
          <p class="exp-summary">${exp.shortSummary}</p>
          <div class="card-metric-pill">
            <span>⚡ ${exp.flashcardFront.keyMetric}</span>
          </div>
          <div class="card-action-row">
            <button class="btn-flip" onclick="flipFlashcard('${exp.id}', event)">
              <span>Flip Flashcard 🔄</span>
            </button>
            <button class="btn-charts-link" onclick="openExperimentDetail('${exp.id}')">
              <span>Inspect Graphs ↗</span>
            </button>
          </div>
        </article>

        <!-- BACK SIDE OF FLASHCARD -->
        <article class="flashcard-face flashcard-back">
          <div class="tech-corner tl">+</div>
          <div class="tech-corner tr">+</div>
          <div class="exp-card-top">
            <span class="exp-code">_${exp.code}</span>
            <span class="physics-badge">_PHYSICAL LAW & SAFETY</span>
          </div>
          <h4 class="card-title" style="color:#ffffff">NASA PSI Discovery</h4>
          <p class="back-discovery">${exp.flashcardBack.discovery}</p>
          
          <div class="back-physics-box">
            <strong>_FLUID TRANSPORT MECHANISM:</strong>
            <p>${exp.flashcardBack.physicsLaw}</p>
          </div>

          <div class="back-impact-box">
            <strong>_FLIGHT SAFETY CONSEQUENCE:</strong>
            <p>${exp.flashcardBack.flightImpact}</p>
          </div>

          <div class="card-action-row">
            <button class="btn-flip secondary" onclick="flipFlashcard('${exp.id}', event)">
              <span>↩ Flip to Front</span>
            </button>
            <button class="btn-charts-link" onclick="openExperimentDetail('${exp.id}')">
              <span>Inspect Graphs ↗</span>
            </button>
          </div>
        </article>
      </div>
    </div>
  `
    )
    .join("");
}

function renderStudyDeckMode(container, experiments) {
  if (experiments.length === 0) {
    container.innerHTML = `<div class="no-results-box"><p>No flashcards in this filter category.</p></div>`;
    return;
  }

  if (currentDeckIndex >= experiments.length) currentDeckIndex = 0;
  if (currentDeckIndex < 0) currentDeckIndex = experiments.length - 1;

  const exp = experiments[currentDeckIndex];

  container.className = "study-deck-view";
  container.innerHTML = `
    <div class="study-deck-header">
      <span class="study-count">Flashcard ${currentDeckIndex + 1} of ${experiments.length}</span>
      <div class="deck-nav-btns">
        <button class="deck-nav-btn" onclick="prevFlashcard()">← Previous</button>
        <button class="deck-nav-btn" onclick="shuffleFlashcards()">🔀 Shuffle</button>
        <button class="deck-nav-btn" onclick="nextFlashcard()">Next →</button>
      </div>
    </div>

    <div class="flashcard-3d-wrapper single-study-card" id="wrapper-${exp.id}">
      <div class="flashcard-inner" id="card-${exp.id}" onclick="flipFlashcard('${exp.id}', event)">
        <!-- FRONT -->
        <article class="flashcard-face flashcard-front">
          <div class="tech-corner tl">+</div>
          <div class="tech-corner tr">+</div>
          <div class="exp-card-top">
            <span class="exp-code">_${exp.code}</span>
            <span class="facility-badge">${exp.facility}</span>
          </div>
          <h3 class="card-title" style="font-size:22px;">${exp.title}</h3>
          <div class="flashcard-question-box">
            <span class="question-label">_FLASHCARD CORE QUESTION</span>
            <p class="question-text" style="font-size:15.5px">${exp.flashcardFront.question}</p>
          </div>
          <p class="hint-text">💡 Hint: ${exp.flashcardFront.hint}</p>
          <div class="card-metric-pill">
            <span>⚡ ${exp.flashcardFront.keyMetric}</span>
          </div>
          <div class="flip-hint-pill">Click anywhere on card or press SPACE to flip 🔄</div>
        </article>

        <!-- BACK -->
        <article class="flashcard-face flashcard-back">
          <div class="tech-corner tl">+</div>
          <div class="tech-corner tr">+</div>
          <div class="exp-card-top">
            <span class="exp-code">_${exp.code}</span>
            <span class="physics-badge">_ANSWER & FLIGHT IMPACT</span>
          </div>
          <h3 class="card-title" style="font-size:22px; color:#ffffff;">NASA Finding</h3>
          <p class="back-discovery" style="font-size:14.5px">${exp.flashcardBack.discovery}</p>
          <div class="back-physics-box">
            <strong>_PHYSICS EXPLANATION:</strong>
            <p>${exp.flashcardBack.physicsLaw}</p>
          </div>
          <div class="back-impact-box">
            <strong>_FLIGHT ARCHITECTURE IMPACT:</strong>
            <p>${exp.flashcardBack.flightImpact}</p>
          </div>
          <div class="card-action-row" style="margin-top: 14px;">
            <button class="btn-charts-link" onclick="event.stopPropagation(); openExperimentDetail('${exp.id}')">
              <span>Inspect Graphs ↗</span>
            </button>
          </div>
        </article>
      </div>
    </div>
  `;
}

window.flipFlashcard = function (id, event) {
  if (event) event.stopPropagation();
  const card = document.getElementById(`card-${id}`);
  if (card) {
    card.classList.toggle("flipped");
  }
};

window.nextFlashcard = function () {
  const experiments = getFilteredExperiments();
  currentDeckIndex = (currentDeckIndex + 1) % experiments.length;
  renderExperimentCards();
};

window.prevFlashcard = function () {
  const experiments = getFilteredExperiments();
  currentDeckIndex = (currentDeckIndex - 1 + experiments.length) % experiments.length;
  renderExperimentCards();
};

window.shuffleFlashcards = function () {
  const experiments = getFilteredExperiments();
  currentDeckIndex = Math.floor(Math.random() * experiments.length);
  renderExperimentCards();
};

window.setDeckFilter = function (cat, btn) {
  currentDeckFilter = cat;
  currentDeckIndex = 0;
  document.querySelectorAll(".deck-filter-chip").forEach((c) => c.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderExperimentCards();
};

window.setViewMode = function (mode) {
  currentViewMode = mode;
  document.querySelectorAll(".view-toggle-btn").forEach((b) => b.classList.remove("active"));
  const activeBtn = document.getElementById(`mode-${mode}`);
  if (activeBtn) activeBtn.classList.add("active");
  renderExperimentCards();
};

window.resetExpFilters = function () {
  currentDeckFilter = "all";
  const searchInput = document.getElementById("expSearchInput");
  if (searchInput) searchInput.value = "";
  document.querySelectorAll(".deck-filter-chip").forEach((c) => c.classList.remove("active"));
  const allChip = document.querySelector('.deck-filter-chip[data-cat="all"]');
  if (allChip) allChip.classList.add("active");
  renderExperimentCards();
};

// Keyboard shortcut (Space to flip in study deck mode)
window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && currentViewMode === "study" && document.getElementById("view-experiments")?.classList.contains("active")) {
    if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") return;
    e.preventDefault();
    const experiments = getFilteredExperiments();
    if (experiments[currentDeckIndex]) {
      flipFlashcard(experiments[currentDeckIndex].id);
    }
  }
});

/* ========================================================
   3. DRILL-DOWN EXPERIMENT DETAIL & TELEMETRY CHARTS
   ======================================================== */
function openExperimentDetail(expId) {
  const exp = NASA_EXPERIMENTS.find((e) => e.id === expId);
  if (!exp) return;

  document.querySelectorAll(".flashcard-inner").forEach((c) => c.classList.remove("selected"));
  const activeCard = document.getElementById(`card-${exp.id}`);
  if (activeCard) activeCard.classList.add("selected");

  const drawer = document.getElementById("experimentDetailPanel");
  drawer.classList.add("open");

  document.getElementById("detailBadge").textContent = exp.code;
  document.getElementById("detailTitle").textContent = exp.title;
  document.getElementById("detailMeta").textContent = `Facility: ${exp.facility} | Category: ${exp.categoryLabel} | Source: NASA PSI & NTRS`;
  document.getElementById("detailDeepExplanation").textContent = exp.deepExplanation;

  const findingsList = document.getElementById("detailFindingsList");
  findingsList.innerHTML = exp.findings.map((f) => `<li>${f}</li>`).join("");

  document.getElementById("chart1Title").textContent = exp.chart1.title;
  document.getElementById("chart2Title").textContent = exp.chart2.title;

  if (primaryChartInstance) primaryChartInstance.destroy();
  if (secondaryChartInstance) secondaryChartInstance.destroy();

  const ctx1 = document.getElementById("expChartPrimary").getContext("2d");
  primaryChartInstance = new Chart(ctx1, {
    type: exp.chart1.type,
    data: {
      labels: exp.chart1.labels,
      datasets: [
        {
          label: exp.chart1.datasetLabel,
          data: exp.chart1.data,
          borderColor: exp.chart1.color,
          backgroundColor: exp.chart1.color + "33",
          fill: true,
          tension: 0.35,
          borderWidth: 2.8,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: exp.chart1.color,
          pointRadius: 4.5
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#e2e8f0", font: { family: "Inter, sans-serif" } } }
      },
      scales: {
        x: { ticks: { color: "#e2e8f0" }, grid: { color: "rgba(255, 255, 255, 0.08)" } },
        y: { ticks: { color: "#e2e8f0" }, grid: { color: "rgba(255, 255, 255, 0.08)" } }
      }
    }
  });

  const ctx2 = document.getElementById("expChartSecondary").getContext("2d");
  secondaryChartInstance = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: exp.chart2.labels,
      datasets: [
        {
          label: "Earth Baseline (1g)",
          data: exp.chart2.g1,
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderColor: "rgba(255, 255, 255, 0.5)",
          borderWidth: 1.2,
          borderRadius: 6
        },
        {
          label: "Microgravity Flight (0g)",
          data: exp.chart2.g0,
          backgroundColor: "rgba(249, 115, 22, 0.85)",
          borderColor: "#f97316",
          borderWidth: 1.2,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#e2e8f0", font: { family: "Inter, sans-serif" } } }
      },
      scales: {
        x: { ticks: { color: "#e2e8f0" }, grid: { color: "rgba(255, 255, 255, 0.08)" } },
        y: { ticks: { color: "#e2e8f0" }, grid: { color: "rgba(255, 255, 255, 0.08)" } }
      }
    }
  });

  drawer.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

const closeDetailBtn = document.getElementById("closeDetailBtn");
if (closeDetailBtn) {
  closeDetailBtn.addEventListener("click", () => {
    document.getElementById("experimentDetailPanel").classList.remove("open");
    document.querySelectorAll(".flashcard-inner").forEach((c) => c.classList.remove("selected"));
  });
}

/* ========================================================
   4. ASK AI ASSISTANT (WITH TYPEWRITER EFFECT & AUDIO)
   ======================================================== */
function generateAIResponse(query) {
  const q = query.toLowerCase();
  if (q.includes("spherical") || q.includes("shape") || q.includes("round") || q.includes("ball")) {
    return "On Earth (1g), hot exhaust gases are less dense and rise vigorously via buoyancy (Grashof number Gr ~ 10⁵–10⁶), pulling fresh oxygen into the base and stretching the flame into an elongated flickering teardrop. In microgravity (10⁻⁶g), buoyant natural convection vanishes (Gr → 0). Oxygen and fuel mix solely through isotropic molecular diffusion (D ~ 0.2 cm²/s), forming a symmetric blue spherical flamelet that burns cooler and more quietly.";
  }
  if (q.includes("airflow") || q.includes("ventilation") || q.includes("cabin") || q.includes("fan")) {
    return "Spacecraft ECLSS ventilation (typically 15–25 cm/s) acts as low-speed forced convection. As revealed in NASA's BASS and Saffire experiments, stagnant 0g flames often self-extinguish in their own CO₂ blanket; however, gentle cabin airflow sweeps away exhaust products and delivers fresh O₂—creating a critical peak flame-spread regime between 10 and 25 cm/s. Therefore, emergency spacecraft procedures immediately shutdown cabin fans upon smoke confirmation.";
  }
  if (q.includes("cool flame") || q.includes("flex")) {
    return "During NASA's Flame Extinguishment Experiment (FLEX) on the ISS, researchers discovered that alkane droplets (such as n-heptane) visibly extinguished due to radiative heat loss, yet continued to burn invisibly at ~550–750 K. These two-stage 'cool flames' are sustained by low-temperature alkylperoxy radical chemistry without visible soot luminescence, producing toxic CO and formaldehyde.";
  }
  if (q.includes("extinguish") || q.includes("suppress") || q.includes("water") || q.includes("halon")) {
    return "In spacecraft cabins, fire suppression follows a mandatory 3-step protocol: (1) Cut electrical power to the affected equipment rack to isolate the ignition source, (2) Shut down ECLSS cabin ventilation fans to starve the fire of convective oxygen, and (3) Discharge fine water mist (Orion/Gateway exploration standard) or CO₂/N₂ inert gas (ISS standard) to drop local oxygen concentration below the Limiting Oxygen Index (~14%).";
  }
  if (q.includes("soot") || q.includes("acme") || q.includes("smoke") || q.includes("same")) {
    return "NASA's ACME and SAME investigations confirmed that microgravity diffusion flames have much longer residence times, yielding 5× to 8× more soot volume and 2× to 4× larger smoke aggregates than terrestrial flames. As a result, deep-space habitats rely on dual-wavelength photoelectric smoke scatter detectors rather than terrestrial ionization detectors.";
  }
  if (q.includes("sofie") || q.includes("gateway") || q.includes("34%")) {
    return "NASA's SoFIE investigation examines solid material flammability in exploration atmospheres. The Artemis Lunar Gateway operates at 56.5 kPa with 34% O₂. At this elevated oxygen level, ignition delay times decrease by over 70%, and materials like acrylic and fabrics ignite far more easily than under normal Earth 21% O₂ conditions.";
  }
  return "Based on NASA PSI and NTRS microgravity combustion datasets (FLEX, ACME, BASS, Saffire, SAME, and SoFIE): eliminating buoyant convection makes flames diffusion-controlled, spherical in stagnant air, and exceptionally sensitive to low-velocity cabin ventilation (10–30 cm/s) and exploration oxygen levels (up to 34% O₂).";
}

function appendChatMessage(sender, text) {
  const box = document.getElementById("chatMessages");
  if (!box) return;

  const div = document.createElement("div");
  div.className = `msg ${sender}`;

  if (sender === "user") {
    div.innerHTML = `<strong>Astronaut / Researcher:</strong> ${text}`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  } else {
    // Typewriter effect for AI response
    div.innerHTML = `<strong>PSI Combustion Assistant:</strong> <span class="typing-text"></span><span class="cursor-blink">▌</span>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;

    const textSpan = div.querySelector(".typing-text");
    const cursor = div.querySelector(".cursor-blink");
    let charIdx = 0;

    function typeChar() {
      if (charIdx < text.length) {
        textSpan.textContent += text.charAt(charIdx);
        charIdx++;
        box.scrollTop = box.scrollHeight;
        setTimeout(typeChar, 14);
      } else {
        cursor.remove();
        // Add Copy Button
        const copyBtn = document.createElement("button");
        copyBtn.className = "copy-msg-btn";
        copyBtn.innerHTML = `📋 Copy`;
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(text);
          copyBtn.innerHTML = `✓ Copied`;
          setTimeout(() => (copyBtn.innerHTML = `📋 Copy`), 2000);
        };
        div.appendChild(copyBtn);
      }
    }
    typeChar();
  }
}

// Store conversation history
let chatHistory = [];

// Send message to Gemini backend
async function askAI(question) {
  appendChatMessage("user", question);

  try {
    const response = await fetch(`${window.BACKEND_BASE_URL || "http://127.0.0.1:8000"}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: question,
        history: chatHistory
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || `Server error (${response.status})`);
    }

    chatHistory.push({ role: "user", content: question });
    chatHistory.push({ role: "assistant", content: data.answer });

    appendChatMessage("bot", data.answer);
  } catch (error) {
    console.error("AI Chat Error:", error);
    const msg = error.message.includes("Failed to fetch")
      ? "Cannot reach the backend at http://127.0.0.1:8000. Make sure Uvicorn is running."
      : `AI Assistant Error: ${error.message}`;
    appendChatMessage("bot", msg);
  }
}

// Preset question buttons
window.askPresetQuestion = function (question) {
  if (window.spaceAudio) {
    window.spaceAudio.playHover();
  }
  askAI(question);
};

// Normal chat input
const chatForm = document.getElementById("chatForm");

if (chatForm) {
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const input = document.getElementById("chatInput");
    const question = input.value.trim();

    if (!question) return;

    input.value = "";

    if (window.spaceAudio) {
      window.spaceAudio.playClick();
    }

    askAI(question);
  });
}

/* ========================================================
   5. COMPARATIVE THEORY & DIMENSIONLESS CALCULATOR
   ======================================================== */
function renderTheoryChart() {
  const canvas = document.getElementById("theoryComparisonChart");
  if (!canvas) return;
  if (theoryChartInstance) theoryChartInstance.destroy();

  theoryChartInstance = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels: ["0 cm/s", "5 cm/s", "10 cm/s", "15 cm/s", "20 cm/s", "30 cm/s", "45 cm/s", "60 cm/s"],
      datasets: [
        {
          label: "Microgravity (0g) Flame Spread Rate (mm/s)",
          data: [0.05, 0.95, 1.65, 1.95, 1.88, 1.52, 1.05, 0.45],
          borderColor: "#ffffff",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          fill: true,
          tension: 0.35,
          borderWidth: 2.4,
          pointBackgroundColor: "#ffffff"
        },
        {
          label: "Normal Gravity (1g) Opposed Flow Spread Rate (mm/s)",
          data: [1.35, 1.32, 1.28, 1.24, 1.18, 1.05, 0.85, 0.62],
          borderColor: "#f97316",
          backgroundColor: "rgba(249, 115, 22, 0.08)",
          fill: false,
          tension: 0.35,
          borderWidth: 2.2,
          pointBackgroundColor: "#f97316"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#e2e8f0", font: { family: "Inter, sans-serif" } } }
      },
      scales: {
        x: { ticks: { color: "#e2e8f0" }, grid: { color: "rgba(255, 255, 255, 0.08)" } },
        y: {
          title: { display: true, text: "Spread Velocity (mm/s)", color: "#e2e8f0" },
          ticks: { color: "#e2e8f0" },
          grid: { color: "rgba(255, 255, 255, 0.08)" }
        }
      }
    }
  });
}

// Interactive Dimensionless Scaling Calculator
window.updateDimensionlessCalculator = function () {
  const uSlider = document.getElementById("calcVelocitySlider");
  const lSlider = document.getElementById("calcLengthSlider");
  const gSelect = document.getElementById("calcGravitySelect");

  if (!uSlider || !lSlider || !gSelect) return;

  const U = parseFloat(uSlider.value) / 100; // cm/s to m/s
  const L = parseFloat(lSlider.value) / 100; // cm to m
  const gRatio = parseFloat(gSelect.value); // 0, 0.16, 0.38, 1.0
  const g = gRatio * 9.81;

  document.getElementById("calcVelocityVal").textContent = `${uSlider.value} cm/s`;
  document.getElementById("calcLengthVal").textContent = `${lSlider.value} cm`;

  const nu = 1.6e-5; // kinematic viscosity of air (m²/s)
  const beta = 1 / 300; // volumetric expansion coeff (1/K)
  const deltaT = 1100; // K

  // Grashof Number Gr = g * beta * deltaT * L³ / nu²
  const Gr = (g * beta * deltaT * Math.pow(L, 3)) / Math.pow(nu, 2);

  // Reynolds Number Re = U * L / nu
  const Re = (U * L) / nu;

  // Froude Number Fr = U² / (g * L)
  const Fr = g > 0 ? Math.pow(U, 2) / (g * L) : 9999;

  // Mixed convection criterion: Richardson number Ri = Gr / Re²
  const Ri = Re > 0 ? Gr / Math.pow(Re, 2) : (Gr > 0 ? 9999 : 0);

  document.getElementById("calcGrVal").textContent = Gr < 1 ? Gr.toExponential(2) : Math.round(Gr).toLocaleString();
  document.getElementById("calcReVal").textContent = Re.toFixed(1);
  document.getElementById("calcFrVal").textContent = Fr > 999 ? "∞ (0g)" : Fr.toFixed(2);

  const regimeBadge = document.getElementById("calcRegimeBadge");
  if (gRatio === 0) {
    if (U === 0) {
      regimeBadge.textContent = "Pure Molecular Diffusion (Gr = 0, Re = 0)";
      regimeBadge.style.color = "#00f5ff";
    } else {
      regimeBadge.textContent = "Forced Convection Only (Gr = 0, Ri = 0)";
      regimeBadge.style.color = "#38bdf8";
    }
  } else if (Ri > 10) {
    regimeBadge.textContent = "Buoyant Natural Convection Dominant (Gr/Re² >> 1)";
    regimeBadge.style.color = "#ff7b00";
  } else if (Ri >= 0.1 && Ri <= 10) {
    regimeBadge.textContent = "Mixed Convection Regime (Buoyancy ~ Forced Flow)";
    regimeBadge.style.color = "#fbbf24";
  } else {
    regimeBadge.textContent = "Forced Flow Dominant (Ventilation Overpowers Buoyancy)";
    regimeBadge.style.color = "#10b981";
  }
};

/* ========================================================
   6. MISSION RISK EVALUATOR & FMEA
   ======================================================== */
window.updateRiskProfile = function () {
  const missionEl = document.getElementById("riskMissionSelect");
  if (!missionEl) return;

  const mission = missionEl.value;
  const air = parseInt(document.getElementById("riskAirSlider").value, 10);
  const fuel = parseInt(document.getElementById("riskFuelSlider").value, 10);

  document.getElementById("riskAirVal").textContent = `${air} cm/s`;
  const fuelLabel = fuel < 35 ? "Low" : fuel < 70 ? "Moderate" : "High";
  document.getElementById("riskFuelVal").textContent = `${fuelLabel} (${fuel}%)`;

  const missionBase = {
    iss: {
      o2Score: 35,
      pressureScore: 30,
      detectScore: 25,
      advice: "Standard ISS protocol: Maintain automated ECLSS fan interlock and multi-point smoke detection."
    },
    gateway: {
      o2Score: 78,
      pressureScore: 65,
      detectScore: 45,
      advice: "34% O₂ Exploration Atmosphere: Enforce NASA-STD-6001B strict polymer mass limits and fine water mist."
    },
    orion: {
      o2Score: 55,
      pressureScore: 48,
      detectScore: 35,
      advice: "26.5% O₂ Capsule Profile: Verify rapid cabin depressurization & portable breathing apparatus readiness."
    },
    mars: {
      o2Score: 72,
      pressureScore: 60,
      detectScore: 52,
      advice: "Deep-Space Autonomous Transit: Deploy multi-spectral cool-flame gas sensors and regenerative scrubbers."
    }
  }[mission];

  const flowPenalty = air >= 8 && air <= 28 ? 22 : air > 28 ? 16 : 5;
  const composite = Math.min(99, Math.round(missionBase.o2Score * 0.4 + fuel * 0.35 + flowPenalty));

  const tier = composite < 40 ? "LOW" : composite < 68 ? "MODERATE" : "HIGH";
  const banner = document.getElementById("riskBanner");
  const scoreEl = document.getElementById("riskScoreDisplay");

  scoreEl.textContent = `${composite} / 100 — ${tier}`;
  document.getElementById("riskActionAdvice").textContent = missionBase.advice;

  if (tier === "HIGH") {
    banner.style.background = "rgba(239, 68, 68, 0.16)";
    banner.style.borderColor = "rgba(239, 68, 68, 0.65)";
    scoreEl.style.color = "#f87171";
  } else if (tier === "MODERATE") {
    banner.style.background = "rgba(245, 158, 11, 0.14)";
    banner.style.borderColor = "rgba(245, 158, 11, 0.55)";
    scoreEl.style.color = "#fbbf24";
  } else {
    banner.style.background = "rgba(16, 185, 129, 0.14)";
    banner.style.borderColor = "rgba(16, 185, 129, 0.55)";
    scoreEl.style.color = "#34d399";
  }

  const radarCanvas = document.getElementById("riskRadarChart");
  if (!radarCanvas) return;
  if (riskRadarInstance) riskRadarInstance.destroy();

  riskRadarInstance = new Chart(radarCanvas.getContext("2d"), {
    type: "radar",
    data: {
      labels: ["O₂ Enrichment", "Ventilation Feed", "Fuel Load", "Cool-Flame Stealth", "Toxic Gas Retention"],
      datasets: [
        {
          label: "Mission Hazard Vector",
          data: [
            missionBase.o2Score,
            Math.min(100, air * 2.1),
            fuel,
            missionBase.detectScore,
            Math.min(100, 40 + fuel * 0.45)
          ],
          backgroundColor: "rgba(249, 115, 22, 0.2)",
          borderColor: "#f97316",
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#f97316",
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { display: false },
          grid: { color: "rgba(255, 255, 255, 0.08)" },
          angleLines: { color: "rgba(255, 255, 255, 0.08)" },
          pointLabels: { color: "#cbd5e1", font: { size: 11, family: "Inter, sans-serif" } }
        }
      },
      plugins: { legend: { labels: { color: "#cbd5e1" } } }
    }
  });
};

/* ========================================================
   7. SI RANKING LEADERBOARD (SEARCH, SORT, AND FILTER)
   ======================================================== */
window.sortSITable = function (col) {
  if (siSortColumn === col) {
    siSortAsc = !siSortAsc;
  } else {
    siSortColumn = col;
    siSortAsc = true;
  }
  renderSIRanking();
};

window.renderSIRanking = function () {
  const filterEl = document.getElementById("siFilterSelect");
  const searchEl = document.getElementById("siSearchInput");
  const tbody = document.getElementById("siTableBody");
  if (!tbody) return;

  const filter = filterEl ? filterEl.value : "all";
  const search = searchEl ? searchEl.value.toLowerCase().trim() : "";

  let rows = filter === "all" ? [...SI_RANKING_DATA] : SI_RANKING_DATA.filter((item) => item.category === filter);

  if (search) {
    rows = rows.filter(
      (r) =>
        r.name.toLowerCase().includes(search) ||
        r.category.toLowerCase().includes(search) ||
        r.rating.toLowerCase().includes(search)
    );
  }

  // Sort rows
  rows.sort((a, b) => {
    let valA = a[siSortColumn];
    let valB = b[siSortColumn];
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();
    if (valA < valB) return siSortAsc ? -1 : 1;
    if (valA > valB) return siSortAsc ? 1 : -1;
    return 0;
  });

  tbody.innerHTML = rows
    .map(
      (r) => `
    <tr>
      <td><strong>#${r.rank}</strong></td>
      <td><strong>${r.name}</strong></td>
      <td><span class="tag tag-${r.category.toLowerCase()}">${r.category}</span></td>
      <td>${r.loi}</td>
      <td>${r.spread}</td>
      <td><strong style="color:${r.score >= 80 ? "#34d399" : r.score >= 55 ? "#fbbf24" : "#f87171"}">${r.score} / 100</strong></td>
      <td>${r.rating}</td>
    </tr>
  `
    )
    .join("");

  const barCanvas = document.getElementById("siBarChart");
  if (!barCanvas) return;
  if (siBarInstance) siBarInstance.destroy();

  siBarInstance = new Chart(barCanvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: rows.map((r) => r.name),
      datasets: [
        {
          label: "Safety Index (SI Score)",
          data: rows.map((r) => r.score),
          backgroundColor: rows.map((r) =>
            r.score >= 80 ? "rgba(16, 185, 129, 0.85)" : r.score >= 55 ? "rgba(245, 158, 11, 0.85)" : "rgba(239, 68, 68, 0.85)"
          ),
          borderColor: rows.map((r) => (r.score >= 80 ? "#10b981" : r.score >= 55 ? "#f59e0b" : "#ef4444")),
          borderWidth: 1.5,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#e2e8f0", maxRotation: 25 }, grid: { display: false } },
        y: { min: 0, max: 100, ticks: { color: "#e2e8f0" }, grid: { color: "rgba(255, 255, 255, 0.08)" } }
      }
    }
  });
};

/* ========================================================
   8. DOM READY INITIALIZATION
   ======================================================== */
document.addEventListener("DOMContentLoaded", () => {
  renderExperimentCards();
  renderSIRanking();

  const searchInput = document.getElementById("expSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => renderExperimentCards());
  }

  const siSearchInput = document.getElementById("siSearchInput");
  if (siSearchInput) {
    siSearchInput.addEventListener("input", () => renderSIRanking());
  }
});
