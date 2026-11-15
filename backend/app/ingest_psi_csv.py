import argparse
import pandas as pd
from supabase import create_client
from app.config import settings
from app.cleaner import atm_to_kpa, fraction_to_percent, generate_risk_assessment

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

def ingest_psi_file(filepath: str, investigation_id: str, source_citation: str):
    """
    Cleans raw NASA PSI CSV/Excel exports (e.g., PSI-25 BASS-II or PSI-98 FLEX),
    standardizes units (atm -> kPa, mole fraction -> %), replaces NaNs with None,
    and upserts into Supabase experiment_runs.
    """
    df = pd.read_csv(filepath) if filepath.endswith(".csv") else pd.read_excel(filepath)
    df = df.where(pd.notnull(df), None)

    cleaned_rows = []
    for idx, row in df.iterrows():
        o2_raw = row.get("oxygen_percent") or row.get("O2") or row.get("o2_mole_fraction")
        o2_pct = fraction_to_percent(float(o2_raw)) if o2_raw is not None else None

        p_kpa = row.get("pressure_kpa")
        if p_kpa is None and row.get("pressure_atm") is not None:
            p_kpa = atm_to_kpa(float(row["pressure_atm"]))

        airflow = float(row["airflow_cm_s"]) if row.get("airflow_cm_s") is not None else None
        cool_k = float(row["cool_flame_k_mm2_s"]) if row.get("cool_flame_k_mm2_s") is not None else None
        fuel_cat = str(row.get("fuel_category") or "Thin Solid")

        risk, summary = generate_risk_assessment(o2_pct, airflow, fuel_cat, cool_k)

        cleaned_rows.append({
            "investigation_id": investigation_id.upper(),
            "run_code": str(row.get("run_code") or row.get("test_point") or f"RUN-{idx+1}"),
            "fuel_material": str(row.get("fuel_material") or row.get("fuel") or "Unknown NASA Sample"),
            "fuel_category": fuel_cat,
            "sample_geometry": str(row["sample_geometry"]) if row.get("sample_geometry") else None,
            "oxygen_percent": o2_pct,
            "pressure_kpa": float(p_kpa) if p_kpa is not None else None,
            "airflow_cm_s": airflow,
            "diluent_gas": str(row["diluent_gas"]) if row.get("diluent_gas") else None,
            "flow_direction": str(row["flow_direction"]) if row.get("flow_direction") else None,
            "steady_flame_size_cm": float(row["steady_flame_size_cm"]) if row.get("steady_flame_size_cm") is not None else None,
            "max_flame_size_cm": float(row["max_flame_size_cm"]) if row.get("max_flame_size_cm") is not None else None,
            "burn_duration_s": float(row["burn_duration_s"]) if row.get("burn_duration_s") is not None else None,
            "hot_flame_k_mm2_s": float(row["hot_flame_k_mm2_s"]) if row.get("hot_flame_k_mm2_s") is not None else None,
            "cool_flame_k_mm2_s": cool_k,
            "plain_english_outcome": str(row.get("plain_english_outcome") or summary),
            "risk_level": risk,
            "instrument_source": str(row.get("instrument_source") or "NASA PSI Telemetry"),
            "source_reference": source_citation,
        })

    if cleaned_rows:
        supabase.table("experiment_runs").upsert(
            cleaned_rows, on_conflict="investigation_id,run_code"
        ).execute()
    print(f"✅ Ingested and cleaned {len(cleaned_rows)} runs into {investigation_id.upper()}.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clean and upload NASA PSI CSV/Excel files to Supabase")
    parser.add_argument("filepath", help="Path to CSV or XLSX file")
    parser.add_argument("--investigation", required=True, help="Investigation ID (e.g., BASS-II, FLEX, SAFFIRE-IV)")
    parser.add_argument("--citation", default="NASA PSI Repository", help="Official NASA citation")
    args = parser.parse_args()
    ingest_psi_file(args.filepath, args.investigation, args.citation)
