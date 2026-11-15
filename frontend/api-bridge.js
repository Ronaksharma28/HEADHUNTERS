cat << 'EOF' > api-bridge.js
// Live API Bridge: Connects design_1 frontend to FastAPI + Supabase PostgreSQL
(function () {
  const API_BASE = "http://127.0.0.1:8000/api";
  let liveRunsCache = [];
  let liveQACache = [];

  async function fetchJSON(path) {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
    return res.json();
  }

  async function syncSupabaseData() {
    try {
      const [kpis, investigations, runs, qaList, d2Series] = await Promise.all([
        fetchJSON("/kpis"),
        fetchJSON("/investigations"),
        fetchJSON("/runs"),
        fetchJSON("/si-assistant"),
        fetchJSON("/charts/droplet_d2_decay").catch(() => [])
      ]);

      liveRunsCache = runs;
      liveQACache = qaList;

      // 1. Update Sidebar & Topbar HUD to show live Supabase connection
      const sidebarPill = document.querySelector(".sidebar-footer .telemetry-pill span:last-child");
      if (sidebarPill) {
        sidebarPill.textContent = `SUPABASE LIVE // ${kpis.total_investigations} INV · ${kpis.verified_benchmark_runs} RUNS`;
      }

      // 2. Enrich NASA_EXPERIMENTS flashcards with live Supabase metadata & verified run counts
      const mapExpToDbIds = {
        flex: ["FLEX", "CFI"],
        acme: ["CFI"],
        bass: ["BASS", "BASS-II"],
        saffire: ["SAFFIRE-I", "SAFFIRE-II", "SAFFIRE-III", "SAFFIRE-IV", "SAFFIRE-V"],
        same: ["SAME"],
        sofie: ["SAFFIRE-V", "BASS-II"]
      };

      if (Array.isArray(NASA_EXPERIMENTS)) {
        NASA_EXPERIMENTS.forEach((exp) => {
          const dbIds = mapExpToDbIds[exp.id] || [];
          const matchedInvs = investigations.filter((i) => dbIds.includes(i.id));
          const matchedRuns = runs.filter((r) => dbIds.includes(r.investigation_id));

          if (matchedInvs.length > 0) {
            exp.dbInvestigations = matchedInvs;
            exp.dbRuns = matchedRuns;
            exp.flashcardFront.keyMetric += ` | ${matchedRuns.length} Verified NASA Runs`;
          }

          // Inject live R377 two-stage D^2 decay points from Supabase into FLEX chart
          if (exp.id === "flex" && Array.isArray(d2Series) && d2Series.length > 0) {
            exp.chart1.title = "Droplet D² Decay & Cool Flame Transition (Run R377 — Live Supabase)";
            exp.chart1.labels = d2Series.map((pt) => `${pt.x_value}s`);
            exp.chart1.data = d2Series.map((pt) => pt.y_value);
          }
        });
      }

      if (typeof renderExperimentCards === "function") {
        renderExperimentCards();
      }
      console.log(`✅ Connected to Supabase via FastAPI: ${runs.length} verified NASA runs loaded.`);
    } catch (err) {
      console.warn("⚠️ FastAPI backend offline — using local fallback dataset:", err.message);
    }
  }

  // 3. Enhance Experiment Detail Drawer with Verified NASA PSI/NTRS Measurement Table
  const origOpenDetail = window.openExperimentDetail;
  if (typeof origOpenDetail === "function") {
    window.openExperimentDetail = function (expId) {
      origOpenDetail(expId);
      const exp = NASA_EXPERIMENTS.find((e) => e.id === expId);
      const textBlock = document.querySelector("#experimentDetailPanel .detail-text-block");
      if (!exp || !textBlock) return;

      const existing = document.getElementById("supabaseRunsTableWrap");
      if (existing) existing.remove();

      const runsToShow = exp.dbRuns && exp.dbRuns.length > 0 ? exp.dbRuns : liveRunsCache.slice(0, 4);
      if (runsToShow.length === 0) return;

      const rowsHtml = runsToShow
        .map((r) => {
          const metrics = (r.display_measurements || [])
            .map((m) => `<span class="tag" style="margin:2px;display:inline-block">${m.label}: ${m.value} ${m.unit}</span>`)
            .join(" ");
          return `
            <tr>
              <td><strong>${r.run_code}</strong><br><span class="muted">${r.investigation_id}</span></td>
              <td>${r.fuel_material}</td>
              <td>${metrics || "Qualitative observation"}</td>
              <td>${r.plain_english_outcome}<br><span class="muted">Source: ${r.source_reference}</span></td>
            </tr>`;
        })
        .join("");

      const box = document.createElement("div");
      box.id = "supabaseRunsTableWrap";
      box.className = "mt-20";
      box.innerHTML = `
        <h4>Verified NASA Telemetry Records (Live from Supabase)</h4>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Run ID</th>
                <th>Fuel / Sample</th>
                <th>Cleaned Measurements</th>
                <th>Refined Outcome & Citation</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>`;
      textBlock.appendChild(box);
    };
  }

  // 4. Enhance AI Assistant with Verified Supabase Q&A Citations
  const origGenerateAI = window.generateAIResponse;
  if (typeof origGenerateAI === "function") {
    window.generateAIResponse = function (query) {
      const q = query.toLowerCase();
      const hit = liveQACache.find((item) => {
        const words = item.question.toLowerCase().split(/\W+/).filter((w) => w.length > 4);
        return words.filter((w) => q.includes(w)).length >= 2;
      });
      if (hit) {
        return `${hit.answer} [Verified NASA Sources: ${hit.source_citations}]`;
      }
      return origGenerateAI(query);
    };
  }

  // 5. Connect Live Simulator Controls to FastAPI /api/simulate
  let simTimer = null;
  function bindLiveSimulatorAPI() {
    const airEl = document.getElementById("airflowSlider");
    const o2El = document.getElementById("oxygenSlider");
    const gravEl = document.getElementById("gravitySelect");
    if (!airEl || !o2El || !gravEl) return;

    const triggerBackendSim = () => {
      clearTimeout(simTimer);
      simTimer = setTimeout(async () => {
        try {
          const url = `/simulate?gravity_g=${gravEl.value}&oxygen_percent=${o2El.value}&airflow_cm_s=${airEl.value}&fuel_type=SIBAL`;
          const res = await fetchJSON(url);
          const regimeEl = document.getElementById("regimeIndicator");
          if (regimeEl && res.regime) {
            regimeEl.textContent = `REGIME: ${res.regime.toUpperCase()}`;
          }
        } catch (_) {}
      }, 250);
    };

    [airEl, o2El, gravEl].forEach((el) => el.addEventListener("input", triggerBackendSim));
  }

  document.addEventListener("DOMContentLoaded", () => {
    syncSupabaseData();
    bindLiveSimulatorAPI();
  });
})();
EOF