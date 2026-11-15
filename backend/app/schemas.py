from pydantic import BaseModel
from typing import Optional, List

class MeasurementItem(BaseModel):
    label: str
    value: float
    unit: str

class RefinedExperimentRun(BaseModel):
    id: Optional[str] = None
    investigation_id: str
    run_code: str
    fuel_material: str
    fuel_category: str
    sample_geometry: Optional[str] = None
    oxygen_percent: Optional[float] = None
    pressure_kpa: Optional[float] = None
    airflow_cm_s: Optional[float] = None
    diluent_gas: Optional[str] = None
    flow_direction: Optional[str] = None
    flame_spread_rate_mm_s: Optional[float] = None
    steady_flame_size_cm: Optional[float] = None
    max_flame_size_cm: Optional[float] = None
    burn_duration_s: Optional[float] = None
    hot_flame_k_mm2_s: Optional[float] = None
    cool_flame_k_mm2_s: Optional[float] = None
    avg_heat_release_w: Optional[float] = None
    co2_increase_ppm: Optional[float] = None
    co_increase_ppm: Optional[float] = None
    limiting_oxygen_index: Optional[float] = None
    plain_english_outcome: str
    risk_level: str
    instrument_source: Optional[str] = None
    source_reference: str
    display_measurements: List[MeasurementItem]
    disclaimer: str

class SimulationResponse(BaseModel):
    fuel: str
    gravity_g: float
    oxygen_percent: float
    airflow_cm_s: float
    regime: str
    flame_temp_k: int
    spread_rate_mm_s: float
    soot_index: int
    risk_score: int
    risk_label: str
    predicted_steady_flame_cm: Optional[float] = None
    safety_advice: str
    model_basis: str
