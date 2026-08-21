from app.schemas.schemas import AdvisoryPredictRequest, AdvisoryPredictResponse


class AgriAdvisorService:
    """Transparent agronomic expert rule system for NPK balancing & precision irrigation."""

    CROP_PROFILES = {
        "wheat": {
            "moisture_min": 30.0,
            "n_min": 120.0,
            "p_min": 25.0,
            "k_min": 140.0,
            "ph_range": (6.0, 7.5),
            "urea_dose": "Top-dress Urea @ 30 kg/acre",
            "dap_dose": "Apply DAP @ 20 kg/acre",
            "mop_dose": "Apply MOP @ 15 kg/acre"
        },
        "rice": {
            "moisture_min": 50.0,
            "n_min": 140.0,
            "p_min": 30.0,
            "k_min": 160.0,
            "ph_range": (5.5, 7.2),
            "urea_dose": "Apply split Urea @ 35 kg/acre during tillering",
            "dap_dose": "Apply DAP @ 25 kg/acre",
            "mop_dose": "Apply MOP @ 20 kg/acre"
        },
        "paddy": {
            "moisture_min": 50.0,
            "n_min": 140.0,
            "p_min": 30.0,
            "k_min": 160.0,
            "ph_range": (5.5, 7.2),
            "urea_dose": "Apply split Urea @ 35 kg/acre during tillering",
            "dap_dose": "Apply DAP @ 25 kg/acre",
            "mop_dose": "Apply MOP @ 20 kg/acre"
        },
        "cotton": {
            "moisture_min": 28.0,
            "n_min": 100.0,
            "p_min": 20.0,
            "k_min": 120.0,
            "ph_range": (6.2, 7.8),
            "urea_dose": "Apply Urea @ 25 kg/acre at boll initiation",
            "dap_dose": "Apply DAP @ 18 kg/acre",
            "mop_dose": "Apply MOP @ 15 kg/acre"
        },
        "soybean": {
            "moisture_min": 32.0,
            "n_min": 90.0,
            "p_min": 28.0,
            "k_min": 130.0,
            "ph_range": (6.0, 7.5),
            "urea_dose": "Apply starter Urea @ 10 kg/acre + Rhizobium inoculation",
            "dap_dose": "Apply SSP (Single Super Phosphate) @ 40 kg/acre",
            "mop_dose": "Apply MOP @ 15 kg/acre"
        },
        "maize": {
            "moisture_min": 35.0,
            "n_min": 130.0,
            "p_min": 32.0,
            "k_min": 150.0,
            "ph_range": (5.8, 7.4),
            "urea_dose": "Top-dress Urea @ 35 kg/acre at knee-high stage",
            "dap_dose": "Apply DAP @ 25 kg/acre",
            "mop_dose": "Apply MOP @ 20 kg/acre"
        }
    }

    @classmethod
    def evaluate(cls, req: AdvisoryPredictRequest) -> AdvisoryPredictResponse:
        crop_key = req.crop_type.lower().strip()
        profile = cls.CROP_PROFILES.get(crop_key, cls.CROP_PROFILES["wheat"])

        # 1. Irrigation Decision Logic
        irrigation_needed = False
        irrigation_amount_mm = 0.0
        irrigation_reason = ""

        if req.soil_moisture < profile["moisture_min"]:
            irrigation_needed = True
            deficit = profile["moisture_min"] - req.soil_moisture
            irrigation_amount_mm = round(deficit * 1.5, 1)
            irrigation_reason = f"Soil moisture is at {req.soil_moisture:.1f}% (below the {profile['moisture_min']}% threshold for {req.crop_type})."
        else:
            irrigation_reason = f"Soil moisture is optimal at {req.soil_moisture:.1f}%."

        # 2. NPK Nutrient Advice Logic
        npk_recs = []
        npk_reasons = []

        if req.nitrogen_ppm < profile["n_min"]:
            npk_recs.append(profile["urea_dose"])
            npk_reasons.append(f"Nitrogen level {req.nitrogen_ppm:.1f} ppm < {profile['n_min']} ppm threshold")
        if req.phosphorus_ppm < profile["p_min"]:
            npk_recs.append(profile["dap_dose"])
            npk_reasons.append(f"Phosphorus level {req.phosphorus_ppm:.1f} ppm < {profile['p_min']} ppm threshold")
        if req.potassium_ppm < profile["k_min"]:
            npk_recs.append(profile["mop_dose"])
            npk_reasons.append(f"Potassium level {req.potassium_ppm:.1f} ppm < {profile['k_min']} ppm threshold")

        npk_recommendation = "; ".join(npk_recs) if npk_recs else "NPK soil nutrients are balanced. No chemical fertilizer supplement required."
        npk_reason_str = ", ".join(npk_reasons) if npk_reasons else "All NPK levels satisfy crop requirements."

        # 3. Comprehensive Reasoning String
        combined_reasoning = (
            f"Agronomic Rule Evaluation for {req.crop_type.capitalize()}: {irrigation_reason} "
            f"Nutrient Analysis: {npk_reason_str} Soil pH: {req.soil_ph:.1f}."
        )

        return AdvisoryPredictResponse(
            irrigation_needed=irrigation_needed,
            irrigation_amount_mm=irrigation_amount_mm,
            npk_recommendation=npk_recommendation,
            reasoning=combined_reasoning
        )
