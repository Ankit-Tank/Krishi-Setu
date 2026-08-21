from typing import Dict, Any, Optional
from app.models.models import TelemetryReading, Farm


class AgronomicAdvisor:
    """Rule-based decision matrix for NPK balancing, soil pH conditioning, and precision irrigation."""

    CROP_THRESHOLDS: Dict[str, Dict[str, Any]] = {
        "wheat": {
            "moisture_min": 30.0,
            "nitrogen_min": 120.0,
            "phosphorus_min": 25.0,
            "potassium_min": 140.0,
            "ph_range": (6.0, 7.5),
            "urea_dose": "Top-dress with Urea @ 30 kg/acre",
            "dap_dose": "Apply DAP @ 20 kg/acre at basal stage",
            "mop_dose": "Apply MOP @ 15 kg/acre"
        },
        "rice": {
            "moisture_min": 50.0,  # Paddy requires flooded/high moisture
            "nitrogen_min": 140.0,
            "phosphorus_min": 30.0,
            "potassium_min": 160.0,
            "ph_range": (5.5, 7.2),
            "urea_dose": "Apply split Urea @ 35 kg/acre during tillering",
            "dap_dose": "Apply DAP @ 25 kg/acre",
            "mop_dose": "Apply MOP @ 20 kg/acre"
        },
        "paddy": {  # Alias for rice
            "moisture_min": 50.0,
            "nitrogen_min": 140.0,
            "phosphorus_min": 30.0,
            "potassium_min": 160.0,
            "ph_range": (5.5, 7.2),
            "urea_dose": "Apply split Urea @ 35 kg/acre during tillering",
            "dap_dose": "Apply DAP @ 25 kg/acre",
            "mop_dose": "Apply MOP @ 20 kg/acre"
        },
        "cotton": {
            "moisture_min": 28.0,
            "nitrogen_min": 100.0,
            "phosphorus_min": 20.0,
            "potassium_min": 120.0,
            "ph_range": (6.2, 7.8),
            "urea_dose": "Apply Urea @ 25 kg/acre at boll formation",
            "dap_dose": "Apply DAP @ 18 kg/acre",
            "mop_dose": "Apply MOP @ 15 kg/acre"
        },
        "soybean": {
            "moisture_min": 32.0,
            "nitrogen_min": 90.0,  # Legume fixates N, lower external threshold
            "phosphorus_min": 28.0,
            "potassium_min": 130.0,
            "ph_range": (6.0, 7.5),
            "urea_dose": "Apply starter Urea @ 10 kg/acre with Rhizobium bio-fertilizer",
            "dap_dose": "Apply Single Super Phosphate (SSP) @ 40 kg/acre",
            "mop_dose": "Apply MOP @ 15 kg/acre"
        }
    }

    @classmethod
    def evaluate(cls, farm: Farm, reading: Optional[TelemetryReading]) -> Dict[str, str]:
        if not reading:
            return {
                "irrigation_advice": "No recent telemetry available. Ensure IoT sensor node is active.",
                "npk_advice": "Telemetry offline. Perform soil testing before applying fertilizers.",
                "ph_advice": "Soil pH metrics pending telemetry update."
            }

        crop_key = farm.crop_type.lower()
        profile = cls.CROP_THRESHOLDS.get(crop_key, cls.CROP_THRESHOLDS["wheat"])

        # 1. Irrigation Rule
        if reading.soil_moisture < profile["moisture_min"]:
            deficit = round(profile["moisture_min"] - reading.soil_moisture, 1)
            irrigation_advice = (
                f"IRRIGATION URGENT: Soil moisture is at {reading.soil_moisture:.1f}% (below optimal threshold {profile['moisture_min']}%). "
                f"Apply approximately {deficit * 1.5:.0f}mm drip/furrow irrigation immediately in early morning hours."
            )
        else:
            irrigation_advice = f"OPTIMAL MOISTURE: Soil moisture is healthy at {reading.soil_moisture:.1f}%. Continue standard cycle."

        # 2. NPK Nutrient Rules
        npk_recs = []
        if reading.nitrogen_ppm < profile["nitrogen_min"]:
            npk_recs.append(f"Nitrogen Deficient ({reading.nitrogen_ppm:.1f} ppm < {profile['nitrogen_min']} ppm): {profile['urea_dose']}.")
        if reading.phosphorus_ppm < profile["phosphorus_min"]:
            npk_recs.append(f"Phosphorus Deficient ({reading.phosphorus_ppm:.1f} ppm < {profile['phosphorus_min']} ppm): {profile['dap_dose']}.")
        if reading.potassium_ppm < profile["potassium_min"]:
            npk_recs.append(f"Potassium Deficient ({reading.potassium_ppm:.1f} ppm < {profile['potassium_min']} ppm): {profile['mop_dose']}.")

        if npk_recs:
            npk_advice = " " .join(npk_recs)
        else:
            npk_advice = f"OPTIMAL NUTRIENTS: NPK levels (N:{reading.nitrogen_ppm:.0f}, P:{reading.phosphorus_ppm:.0f}, K:{reading.potassium_ppm:.0f} ppm) are balanced for {farm.crop_type}."

        # 3. Soil pH Conditioning Rules
        ph_low, ph_high = profile["ph_range"]
        if reading.soil_ph < ph_low:
            ph_advice = f"ACIDIC SOIL (pH {reading.soil_ph:.1f} < {ph_low}): Broadcast agricultural lime/dolomite @ 150 kg/acre and well-composted manure."
        elif reading.soil_ph > ph_high:
            ph_advice = f"ALKALINE SOIL (pH {reading.soil_ph:.1f} > {ph_high}): Apply agricultural gypsum @ 100 kg/acre with green manure incorporation."
        else:
            ph_advice = f"OPTIMAL pH (pH {reading.soil_ph:.1f}): Soil acidity is ideal for nutrient bioavailability."

        return {
            "irrigation_advice": irrigation_advice,
            "npk_advice": npk_advice,
            "ph_advice": ph_advice
        }
