from typing import Optional, Dict, Any

def atm_to_kpa(atm: Optional[float]) -> Optional[float]:
    if atm is None:
        return None
    return round(atm * 101.325, 2)

def fraction_to_percent(val: Optional[float]) -> Optional[float]:
    if val is None:
        return None
    return round(val * 100.0, 2) if val <= 1.0 else round(val, 2)

def generate_risk_assessment(
    o2_pct: Optional[float],
    airflow: Optional[float],
    fuel_category: str,
    cool_flame_k: Optional[float] = None
) -> tuple[str, str]:
    """Translates complex combustion telemetry into a clear risk badge and explanation."""
    if cool_flame_k is not None:
        return (
            "High",
            f"Invisible Cool-Flame Regime: Continues burning at {cool_flame_k} mm²/s after visible flame extinction, evading standard optical sensors."
        )
    if o2_pct and o2_pct >= 25.0:
        return (
            "Critical",
            f"Exploration Atmosphere ({o2_pct}% O₂): Elevated oxygen lowers ignition threshold and increases flame size/deflagration risk."
        )
    if airflow is not None and airflow <= 5.0 and "Solid" in fuel_category:
        return (
            "High",
            "Low-Flow Vapour Accumulation: Reduced ventilation (≤5 cm/s) traps unburned pyrolysis gases, creating sudden deflagration risk."
        )
    return (
        "Moderate",
        "Controlled Microgravity Burn: Flame reaches a bounded steady size governed by forced ventilation rather than buoyancy."
    )

def format_measurement_card(run: Dict[str, Any]) -> Dict[str, Any]:
    """Refines a raw DB row into a frontend-ready object with explicit units and nulls preserved."""
    measurements = []
    if run.get("oxygen_percent") is not None:
        measurements.append({"label": "Oxygen Level", "value": run["oxygen_percent"], "unit": "%"})
    if run.get("pressure_kpa") is not None:
        measurements.append({"label": "Chamber Pressure", "value": run["pressure_kpa"], "unit": "kPa"})
    if run.get("airflow_cm_s") is not None:
        measurements.append({"label": "Forced Airflow", "value": run["airflow_cm_s"], "unit": "cm/s"})
    if run.get("steady_flame_size_cm") is not None:
        measurements.append({"label": "Steady Flame Size", "value": run["steady_flame_size_cm"], "unit": "cm"})
    if run.get("max_flame_size_cm") is not None:
        measurements.append({"label": "Peak Flame Size", "value": run["max_flame_size_cm"], "unit": "cm"})
    if run.get("burn_duration_s") is not None:
        measurements.append({"label": "Burn Duration", "value": run["burn_duration_s"], "unit": "s"})
    if run.get("hot_flame_k_mm2_s") is not None:
        measurements.append({"label": "Hot Burning Rate (K)", "value": run["hot_flame_k_mm2_s"], "unit": "mm²/s"})
    if run.get("cool_flame_k_mm2_s") is not None:
        measurements.append({"label": "Cool Burning Rate (K)", "value": run["cool_flame_k_mm2_s"], "unit": "mm²/s"})
    if run.get("avg_heat_release_w") is not None:
        measurements.append({"label": "Avg Heat Release", "value": run["avg_heat_release_w"], "unit": "W"})
    if run.get("co2_increase_ppm") is not None:
        measurements.append({"label": "Cabin CO₂ Rise", "value": run["co2_increase_ppm"], "unit": "ppm"})
    if run.get("co_increase_ppm") is not None:
        measurements.append({"label": "Cabin CO Rise", "value": run["co_increase_ppm"], "unit": "ppm"})
    if run.get("limiting_oxygen_index") is not None:
        measurements.append({"label": "Limiting O₂ Index", "value": run["limiting_oxygen_index"], "unit": "mol frac"})

    return {
        **run,
        "display_measurements": measurements,
        "disclaimer": f"Verified NASA record ({run['source_reference']}). Unreported channels omitted rather than zeroed."
    }
