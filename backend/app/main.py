import math
import time
import concurrent.futures
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from fastapi import FastAPI, Query, HTTPException
from typing import Literal
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from supabase import create_client
from app.config import settings
from app.cleaner import format_measurement_card
from app.schemas import RefinedExperimentRun, SimulationResponse

app = FastAPI(
    title="Flame in Freefall — NASA Microgravity Combustion API",
    description="Refines complex NASA PSI & NTRS combustion telemetry into structured, human-readable data.",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_ORIGIN,
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:5501",
        "http://localhost:5501",
        "http://localhost:3000",
        "http://localhost:8080",
    ],
    allow_origin_regex=r"^(http://(localhost|127\.0\.0\.1)(:\d+)?|https://.*\.vercel\.app)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
gemini_client = genai.Client(
    api_key=settings.GEMINI_API_KEY,
    http_options=types.HttpOptions(timeout=15_000),  # 15s max per model attempt (in ms)
)

# Thread pool used to enforce a hard timeout on the (synchronous) Gemini SDK call
_gemini_executor = concurrent.futures.ThreadPoolExecutor(max_workers=4)

GEMINI_TIMEOUT_SECONDS = 45

SYSTEM_INSTRUCTION = """
You are a helpful, intelligent, friendly AI assistant.

You are a GENERAL-PURPOSE AI assistant.

You can answer questions about:
- Science and technology
- Programming and computer science
- Mathematics and education
- General knowledge
- Everyday topics
- NASA and space research

Do not restrict yourself to NASA-related topics.

Only discuss NASA when the user's question is relevant.

Respond naturally to greetings like Hi, Hello and Hey.

Never generate unrelated NASA information.

Understand previous conversation messages when relevant.

If you don't know something, be honest.

Keep answers clear and understandable.
"""


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    history: list[ChatMessage] = Field(default_factory=list)


@app.get("/api/health")
def health_check():
    return {"status": "online", "database": "Supabase PostgreSQL"}


@app.get("/api/kpis")
def get_dashboard_kpis():
    """Powers kpi-cards.tsx with verified cross-mission summary metrics."""
    runs = supabase.table("experiment_runs").select("*").execute().data
    investigations = supabase.table("investigations").select("id, si_score").execute().data

    valid_o2 = [r["oxygen_percent"] for r in runs if r.get("oxygen_percent") is not None]
    valid_hrr = [r["avg_heat_release_w"] for r in runs if r.get("avg_heat_release_w") is not None]
    avg_si = round(sum(i["si_score"] for i in investigations) / len(investigations), 1) if investigations else 0

    return {
        "total_investigations": len(investigations),
        "verified_benchmark_runs": len(runs),
        "average_si_score": avg_si,
        "lowest_tested_o2_percent": min(valid_o2) if valid_o2 else None,
        "peak_heat_release_w": max(valid_hrr) if valid_hrr else None,
        "microgravity_gravity_level": "10⁻⁶ g (ISS / Cygnus)"
    }


@app.get("/api/investigations")
def list_investigations(
    destination: Optional[str] = Query(None, description="Filter by ISS, Moon, Mars"),
    search: Optional[str] = Query(None, description="Search by name, program, fuel, or tag")
):
    """Powers experiment-ranking.tsx leaderboard & investigation detail panel."""
    rows = supabase.table("investigations").select("*").order("si_score", desc=True).execute().data
    if destination and destination.lower() != "all":
        rows = [r for r in rows if destination in (r.get("destinations") or [])]
    if search:
        q = search.strip().lower()
        rows = [
            r for r in rows
            if q in r["full_name"].lower()
            or q in r["program"].lower()
            or q in r["fuel_summary"].lower()
            or any(q in t.lower() for t in (r.get("tags") or []))
        ]
    return rows


@app.get("/api/runs", response_model=List[RefinedExperimentRun])
def get_refined_runs(
    investigation_id: Optional[str] = Query(None, description="Filter by BASS, BASS-II, FLEX, CFI, SAFFIRE-I..V, SAME"),
    fuel_category: Optional[str] = Query(None, description="Filter by Thin Solid, Thick Solid, Liquid Droplet, Aerosol/Overheated Material"),
    min_o2: Optional[float] = Query(None),
    max_o2: Optional[float] = Query(None),
):
    """Returns cleaned NASA runs with explicit units and plain-English outcomes."""
    query = supabase.table("experiment_runs").select("*")
    if investigation_id:
        query = query.eq("investigation_id", investigation_id.upper())
    if fuel_category:
        query = query.eq("fuel_category", fuel_category)
    if min_o2 is not None:
        query = query.gte("oxygen_percent", min_o2)
    if max_o2 is not None:
        query = query.lte("oxygen_percent", max_o2)

    raw_runs = query.execute().data
    return [format_measurement_card(r) for r in raw_runs]


@app.get("/api/charts/{chart_group}")
def get_chart_series(chart_group: str):
    """
    Powers spread-chart.tsx & droplet decay graphs.
    Available groups: 'spread_vs_oxygen', 'spread_vs_gravity', 'airflow_vs_flame_size', 'droplet_d2_decay'
    """
    res = (
        supabase.table("experiment_timeseries")
        .select("*, experiment_runs(run_code, investigation_id, fuel_material, source_reference)")
        .eq("chart_group", chart_group)
        .order("x_value")
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail=f"No chart series found for '{chart_group}'")

    # Pivot multi-material series (pmma, cotton, nomex) cleanly for Recharts LineChart
    if chart_group in ["spread_vs_oxygen", "spread_vs_gravity"]:
        x_field = "o2" if chart_group == "spread_vs_oxygen" else "g"
        pivoted = {}
        for pt in res.data:
            x_val = str(pt["x_value"]) if x_field == "g" else pt["x_value"]
            if x_val not in pivoted:
                pivoted[x_val] = {x_field: x_val}
            if pt.get("series_key"):
                pivoted[x_val][pt["series_key"]] = pt["y_value"]
        return list(pivoted.values())

    return res.data


@app.get("/api/habitat-radar")
def get_habitat_radar_comparison():
    """Powers habitat-radar.tsx directly from Supabase habitat_risk_profiles."""
    return supabase.table("habitat_risk_profiles").select("*").execute().data


@app.get("/api/si-assistant")
def get_si_assistant_qa():
    """Powers si-assistant.tsx with verified NASA-backed Q&A."""
    return supabase.table("si_knowledge_qa").select("*").execute().data


@app.get("/api/simulate", response_model=SimulationResponse)
def simulate_microgravity_fire(
    gravity_g: float = Query(0.0, ge=0.0, le=1.0, description="0 = ISS, 0.16 = Moon, 0.38 = Mars, 1.0 = Earth"),
    oxygen_percent: float = Query(21.0, ge=10.0, le=40.0),
    airflow_cm_s: float = Query(5.0, ge=0.0, le=50.0),
    fuel_type: str = Query("SIBAL", description="SIBAL, PMMA, n-Decane, Heptane")
):
    """
    Powers flame-simulator.tsx, returning both frontend visual metrics (temp, spread, soot, risk)
    and NASA empirical safety guidance.
    """
    peak = 0.0 if gravity_g == 0 else (gravity_g * math.exp(1 - gravity_g / 0.2)) / 0.2
    o2_factor = (oxygen_percent / 21.0) ** 2
    flow_factor = 0.35 if (gravity_g < 0.05 and airflow_cm_s == 0) else (1.0 + airflow_cm_s / 40.0)
    spread = round((1.2 + 2.2 * peak + 0.6 * gravity_g) * o2_factor * flow_factor, 2)
    temp = round(1400 + gravity_g * 500 + (oxygen_percent - 21.0) * 25 + airflow_cm_s * 6)
    soot = round(min(100, max(5, 25 + gravity_g * 45 + (oxygen_percent - 21.0) * 2.5 + airflow_cm_s * 0.4)))
    risk_score = min(100, max(0, round(spread * 11 + (oxygen_percent - 21.0) * 2)))
    risk_label = "High" if risk_score > 66 else ("Elevated" if risk_score > 33 else "Low")

    if fuel_type.lower() in ["heptane", "n-decane"]:
        loi = 15.0
        if oxygen_percent < loi:
            regime = "Extinguished (Below LOI)"
            advice = "Below the 15% O₂ Limiting Oxygen Index in N₂; neither hot nor steady cool flame sustains."
        elif oxygen_percent < 18.0:
            regime = "Cool-Flame Transition Risk"
            advice = "Hot flame may radiatively extinguish early, leaving an invisible cool flame burning (FLEX/CFI finding)."
        else:
            regime = "Quiescent Spherical Burn"
            advice = "Sustains two-stage burning (hot flame followed by invisible cool flame)."
        return SimulationResponse(
            fuel=fuel_type, gravity_g=gravity_g, oxygen_percent=oxygen_percent, airflow_cm_s=airflow_cm_s,
            regime=regime, flame_temp_k=temp, spread_rate_mm_s=spread, soot_index=soot,
            risk_score=risk_score, risk_label=risk_label, predicted_steady_flame_cm=None,
            safety_advice=advice, model_basis="NASA FLEX/CFI droplet empirical bounds"
        )

    if gravity_g < 0.05 and airflow_cm_s <= 5.0 and oxygen_percent >= 21.0:
        regime = "Deflagration / Vapour Accumulation Hazard"
        estimated_size = round(3.0 + (oxygen_percent - 21.0) * 0.8, 1)
        advice = "NASA Saffire-IV/V warning: Dropping flow to ≤5 cm/s in microgravity traps hot pyrolysis vapours and can trigger rapid deflagration."
    elif oxygen_percent < 16.0:
        regime = "Quenched / Non-Sustaining"
        estimated_size = 0.0
        advice = "Oxygen below typical microgravity flame-spread threshold."
    else:
        regime = "Bounded Microgravity Flame" if gravity_g < 0.1 else "Buoyancy-Assisted Flame"
        estimated_size = round(4.0 * max(airflow_cm_s, 5.0) / 20.0 * (oxygen_percent / 21.0) ** 1.8, 2)
        advice = "In microgravity, flames reach a bounded steady length controlled by forced ventilation rather than buoyancy."

    return SimulationResponse(
        fuel=fuel_type, gravity_g=gravity_g, oxygen_percent=oxygen_percent, airflow_cm_s=airflow_cm_s,
        regime=regime, flame_temp_k=temp, spread_rate_mm_s=spread, soot_index=soot,
        risk_score=risk_score, risk_label=risk_label, predicted_steady_flame_cm=estimated_size,
        safety_advice=advice, model_basis="Empirical interpolation from NASA Saffire I–V & BASS-II"
    )


FREE_TIER_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-3.7-flash",
    "gemini-3.8-flash",
]


def _call_gemini(full_input: str):
    """Runs in a worker thread with automatic fallback across Free Tier models."""
    last_error = None
    for model_name in FREE_TIER_MODELS:
        try:
            print(f"Trying model: {model_name}...", flush=True)
            return gemini_client.interactions.create(
                model=model_name,
                system_instruction=SYSTEM_INSTRUCTION,
                input=full_input,
                store=False,
                generation_config={"thinking_level": "minimal"},
            )
        except Exception as err:
            last_error = err
            print(f"Model {model_name} failed ({repr(err)}), trying fallback...", flush=True)
            continue
    raise last_error


@app.post("/api/chat")
def chat_with_ai(request: ChatRequest):
    print("CHAT ENDPOINT CALLED!", flush=True)
    try:
        conversation_context = ""
        for msg in request.history[-12:]:
            role = "User" if msg.role == "user" else "Assistant"
            conversation_context += f"{role}: {msg.content}\n"

        full_input = f"""
        Previous conversation:
        {conversation_context}

        Current user message:
        {request.message}
        """

        start_time = time.time()
        print("Sending request to Gemini...", flush=True)

        future = _gemini_executor.submit(_call_gemini, full_input)
        try:
            interaction = future.result(timeout=GEMINI_TIMEOUT_SECONDS)
        except concurrent.futures.TimeoutError:
            print(f"Gemini call exceeded {GEMINI_TIMEOUT_SECONDS}s timeout", flush=True)
            raise HTTPException(
                status_code=504,
                detail="The AI took too long to respond. Please try again."
            )

        print(f"Gemini response time: {time.time() - start_time:.2f} seconds", flush=True)

        if not interaction.output_text:
            raise HTTPException(status_code=502, detail="Gemini returned an empty response.")

        return {"answer": interaction.output_text}

    except HTTPException:
        raise
    except Exception as e:
        print("Gemini Error:", repr(e), flush=True)
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API error: {str(e)}"
        )