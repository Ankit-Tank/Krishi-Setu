export interface SampleFarm {
  id: string;
  name: string;
  farmer_name: string;
  region: string;
  crop_type: string;
  area_acres: number;
  irrigation_source: string;
  preferred_season: string;
  scenario_title: string;
  scenario_description: string;
  condition_tag: 'healthy' | 'drought' | 'nitrogen_deficient' | 'waterlogged' | 'acidic' | 'alkaline' | 'potassium_deficient' | 'disease_risk' | 'high_yield' | 'sulfur_deficient';
  condition_label: string;
  condition_severity: 'optimal' | 'warning' | 'critical';
  telemetry: {
    soil_moisture: number;
    temperature_c: number;
    humidity_pct: number;
    nitrogen_ppm: number;
    phosphorus_ppm: number;
    potassium_ppm: number;
    soil_ph: number;
  };
  advisory: {
    irrigation_advice: string;
    npk_advice: string;
    action_items: string[];
    advisory_records: Array<{
      id: number;
      farm_id: string;
      type: 'irrigation' | 'npk' | 'disease' | 'general';
      message: string;
      is_read: boolean;
      created_at: string;
    }>;
  };
}

export const SAMPLE_FARMS: SampleFarm[] = [
  {
    id: 'sample-1',
    name: 'Green Acres Wheat Plot',
    farmer_name: 'Harpreet Singh',
    region: 'Ludhiana, Punjab',
    crop_type: 'Wheat',
    area_acres: 12.0,
    irrigation_source: 'borewell',
    preferred_season: 'Rabi',
    scenario_title: 'Healthy Soil & Peak Vegetative Wheat',
    scenario_description: 'Balanced NPK and ideal moisture levels during crown root initiation.',
    condition_tag: 'healthy',
    condition_label: 'Optimal Soil Health 🌾',
    condition_severity: 'optimal',
    telemetry: {
      soil_moisture: 32.5,
      temperature_c: 21.8,
      humidity_pct: 58,
      nitrogen_ppm: 125,
      phosphorus_ppm: 48,
      potassium_ppm: 195,
      soil_ph: 6.8,
    },
    advisory: {
      irrigation_advice: 'Soil moisture is optimal (32.5%). Maintain current schedule; next irrigation recommended in 5-7 days.',
      npk_advice: 'Nutrient availability is balanced. Apply maintenance dose of 25 kg/acre Urea before first jointing stage.',
      action_items: [
        'Maintain soil aeration',
        'Scout for yellow rust symptoms along northern perimeter',
        'Next scheduled irrigation in 6 days'
      ],
      advisory_records: [
        {
          id: 101,
          farm_id: 'sample-1',
          type: 'npk',
          message: '🟢 Soil nutrients balanced. Nitrogen at 125 ppm. Schedule light top-dress next week.',
          is_read: false,
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: 102,
          farm_id: 'sample-1',
          type: 'irrigation',
          message: '💧 Moisture level optimal at 32.5%. No emergency irrigation required.',
          is_read: true,
          created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
        }
      ]
    }
  },
  {
    id: 'sample-2',
    name: 'Karnal Basmati Paddy Field',
    farmer_name: 'Rajinder Kumar',
    region: 'Karnal, Haryana',
    crop_type: 'Rice',
    area_acres: 8.5,
    irrigation_source: 'canal',
    preferred_season: 'Kharif',
    scenario_title: 'Nitrogen-Deficient Rice Crop',
    scenario_description: 'Severe yellowing of lower leaves due to nitrogen leaching after heavy rains.',
    condition_tag: 'nitrogen_deficient',
    condition_label: 'Nitrogen Deficient ⚠️',
    condition_severity: 'critical',
    telemetry: {
      soil_moisture: 46.0,
      temperature_c: 28.4,
      humidity_pct: 78,
      nitrogen_ppm: 42,
      phosphorus_ppm: 34,
      potassium_ppm: 145,
      soil_ph: 7.3,
    },
    advisory: {
      irrigation_advice: 'Paddy standing water level is adequate (46% moisture). Avoid fresh flooding until top dressing is applied.',
      npk_advice: 'CRITICAL: Nitrogen depleted at 42 ppm. Broadcast Neem-Coated Urea @ 35 kg/acre split in two doses immediately.',
      action_items: [
        'Apply split dose of Neem-coated Urea immediately',
        'Avoid draining field water for 48 hours post-application',
        'Monitor tillering rate'
      ],
      advisory_records: [
        {
          id: 201,
          farm_id: 'sample-2',
          type: 'npk',
          message: '🔴 URGENT: Severe Nitrogen Deficiency (42 ppm). Top-dress Neem-coated Urea @ 35 kg/acre.',
          is_read: false,
          created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
        },
        {
          id: 202,
          farm_id: 'sample-2',
          type: 'general',
          message: '📢 Tillering stage active: Ensure weed control before fertilizer application.',
          is_read: false,
          created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        }
      ]
    }
  },
  {
    id: 'sample-3',
    name: 'Vidarbha Black Soil Cotton Farm',
    farmer_name: 'Suresh Patil',
    region: 'Akola, Maharashtra',
    crop_type: 'Cotton',
    area_acres: 15.0,
    irrigation_source: 'rainfed',
    preferred_season: 'Kharif',
    scenario_title: 'Drought Stress & Low Moisture',
    scenario_description: 'Dry spell in rainfed black cotton soil causing wilting during squaring stage.',
    condition_tag: 'drought',
    condition_label: 'Severe Moisture Stress 🚨',
    condition_severity: 'critical',
    telemetry: {
      soil_moisture: 13.8,
      temperature_c: 35.2,
      humidity_pct: 36,
      nitrogen_ppm: 82,
      phosphorus_ppm: 29,
      potassium_ppm: 160,
      soil_ph: 7.9,
    },
    advisory: {
      irrigation_advice: 'EMERGENCY: Soil moisture at critical 13.8%. Provide life-saving drip or furrow irrigation immediately to prevent boll dropping.',
      npk_advice: 'Foliar spray with 2% Potassium Nitrate (13-0-45) to enhance osmotic drought tolerance in cotton plants.',
      action_items: [
        'Provide emergency irrigation within 12 hours',
        'Apply 2% Potassium Nitrate foliar spray',
        'Mulch crop rows with dry biomass to conserve root zone moisture'
      ],
      advisory_records: [
        {
          id: 301,
          farm_id: 'sample-3',
          type: 'irrigation',
          message: '🚨 CRITICAL DROUGHT ALERT: Soil moisture is 13.8%. Run life-saving irrigation immediately.',
          is_read: false,
          created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
        },
        {
          id: 302,
          farm_id: 'sample-3',
          type: 'disease',
          message: '⚠️ High temp (35.2°C) and moisture stress increases whitefly vulnerability. Inspect underside of leaves.',
          is_read: false,
          created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
        }
      ]
    }
  },
  {
    id: 'sample-4',
    name: 'Kolhapur Riverside Sugarcane Estate',
    farmer_name: 'Tanaji Jadhav',
    region: 'Kolhapur, Maharashtra',
    crop_type: 'Sugarcane',
    area_acres: 20.0,
    irrigation_source: 'canal',
    preferred_season: 'both',
    scenario_title: 'Waterlogged Soil & Anaerobic Stress',
    scenario_description: 'Heavy precipitation and canal overflow caused standing water saturation.',
    condition_tag: 'waterlogged',
    condition_label: 'Waterlogged / Oversaturated 🌊',
    condition_severity: 'warning',
    telemetry: {
      soil_moisture: 59.4,
      temperature_c: 26.5,
      humidity_pct: 89,
      nitrogen_ppm: 94,
      phosphorus_ppm: 42,
      potassium_ppm: 215,
      soil_ph: 6.9,
    },
    advisory: {
      irrigation_advice: 'ALERT: Soil oversaturated at 59.4%. Suspend all irrigation and dig boundary trenches to drain excess surface water.',
      npk_advice: 'Post-drainage, apply micronutrient Zinc Sulphate @ 10 kg/acre to revive rhizosphere aerobic root activity.',
      action_items: [
        'Open drainage furrows immediately',
        'Halt all canal watering until moisture drops below 38%',
        'Watch for red rot and root fungal infection signs'
      ],
      advisory_records: [
        {
          id: 401,
          farm_id: 'sample-4',
          type: 'irrigation',
          message: '🌊 DRAINAGE ALERT: Moisture at 59.4%. Clear field runoff channels to prevent root rot.',
          is_read: false,
          created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
        }
      ]
    }
  },
  {
    id: 'sample-5',
    name: 'Kolar Red Soil Tomato Greenhouse',
    farmer_name: 'Manjunath Gowda',
    region: 'Kolar, Karnataka',
    crop_type: 'Tomato',
    area_acres: 4.5,
    irrigation_source: 'borewell',
    preferred_season: 'Kharif',
    scenario_title: 'Acidic Soil with Locked Phosphorus',
    scenario_description: 'Low soil pH (5.1) causing phosphorus fixation and poor fruit set.',
    condition_tag: 'acidic',
    condition_label: 'Acidic Soil (pH 5.1) 🧪',
    condition_severity: 'warning',
    telemetry: {
      soil_moisture: 27.5,
      temperature_c: 25.0,
      humidity_pct: 65,
      nitrogen_ppm: 112,
      phosphorus_ppm: 16,
      potassium_ppm: 180,
      soil_ph: 5.1,
    },
    advisory: {
      irrigation_advice: 'Maintain regular drip fertigation schedule (27.5% moisture is adequate for tomato flowering).',
      npk_advice: 'Soil is acidic (pH 5.1) causing P fixation (16 ppm). Apply Agricultural Lime (Calcium Hydroxide) @ 150 kg/acre and Water Soluble Single Super Phosphate.',
      action_items: [
        'Broadcast Agricultural Lime to raise pH toward 6.5',
        'Apply foliar 00:52:34 (Monopotassium phosphate) for quick fruit development',
        'Add calcium nitrate to prevent blossom end rot'
      ],
      advisory_records: [
        {
          id: 501,
          farm_id: 'sample-5',
          type: 'npk',
          message: '🧪 ACIDIC SOIL ALERT: pH 5.1 is locking phosphorus. Apply 150 kg/acre lime and water-soluble P.',
          is_read: false,
          created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        }
      ]
    }
  },
  {
    id: 'sample-6',
    name: 'Malwa Plateau Soybean Plot',
    farmer_name: 'Dharmendra Chouhan',
    region: 'Indore, Madhya Pradesh',
    crop_type: 'Soybean',
    area_acres: 10.0,
    irrigation_source: 'borewell',
    preferred_season: 'Kharif',
    scenario_title: 'Alkaline Saline Soil Profile',
    scenario_description: 'High pH (8.4) with sodium salt buildup restricting nodulation and micronutrient uptake.',
    condition_tag: 'alkaline',
    condition_label: 'Alkaline / Saline (pH 8.4) 🧂',
    condition_severity: 'warning',
    telemetry: {
      soil_moisture: 24.2,
      temperature_c: 30.1,
      humidity_pct: 52,
      nitrogen_ppm: 68,
      phosphorus_ppm: 21,
      potassium_ppm: 152,
      soil_ph: 8.4,
    },
    advisory: {
      irrigation_advice: 'Leach surface salts by applying deep watering with good quality irrigation water.',
      npk_advice: 'Alkaline soil (pH 8.4). Apply Agri-Gypsum @ 200 kg/acre combined with well-decomposed Farm Yard Manure (FYM).',
      action_items: [
        'Incorporate Agri-Gypsum into top 15cm soil',
        'Spray Ferrous Sulphate (0.5%) to cure iron chlorosis in young soybean leaves',
        'Apply biofertilizers (Rhizobium + PSB)'
      ],
      advisory_records: [
        {
          id: 601,
          farm_id: 'sample-6',
          type: 'npk',
          message: '🧂 HIGH pH (8.4): Apply Gypsum @ 200 kg/acre and organic compost to neutralize sodicity.',
          is_read: false,
          created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        }
      ]
    }
  },
  {
    id: 'sample-7',
    name: 'Davangere Maize Hybrid Plantation',
    farmer_name: 'Basavaraj Shivanna',
    region: 'Davangere, Karnataka',
    crop_type: 'Maize',
    area_acres: 7.0,
    irrigation_source: 'borewell',
    preferred_season: 'Kharif',
    scenario_title: 'Potassium Starvation at Tasseling',
    scenario_description: 'Marginal leaf scorch on older leaves during rapid cob formation.',
    condition_tag: 'potassium_deficient',
    condition_label: 'Potassium Deficient 🧪',
    condition_severity: 'critical',
    telemetry: {
      soil_moisture: 29.8,
      temperature_c: 26.8,
      humidity_pct: 56,
      nitrogen_ppm: 104,
      phosphorus_ppm: 44,
      potassium_ppm: 52,
      soil_ph: 6.7,
    },
    advisory: {
      irrigation_advice: 'Maintain steady moisture (30%) as maize is in high water demand during silking stage.',
      npk_advice: 'CRITICAL K-DEFICIENCY: Potassium is severely low (52 ppm). Side-dress Muriate of Potash (MOP) @ 40 kg/acre immediately.',
      action_items: [
        'Side-dress MOP @ 40 kg/acre along crop rows',
        'Foliar spray with 1% Potassium Chloride to protect grain filling',
        'Check for Fall Armyworm egg masses on whorls'
      ],
      advisory_records: [
        {
          id: 701,
          farm_id: 'sample-7',
          type: 'npk',
          message: '🔴 POTASSIUM DEFICIENCY (52 ppm): Apply 40 kg/acre MOP immediately to ensure cob filling.',
          is_read: false,
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        }
      ]
    }
  },
  {
    id: 'sample-8',
    name: 'Yamuna Belt Potato Tubers Farm',
    farmer_name: 'Shiv Kumar Kushwaha',
    region: 'Agra, Uttar Pradesh',
    crop_type: 'Potato',
    area_acres: 6.0,
    irrigation_source: 'borewell',
    preferred_season: 'Rabi',
    scenario_title: 'Fungal Early Blight Epidemic Risk',
    scenario_description: 'High relative humidity (84%) and cool nights create high risk for Alternaria solani.',
    condition_tag: 'disease_risk',
    condition_label: 'Fungal Blight Risk 🔬',
    condition_severity: 'critical',
    telemetry: {
      soil_moisture: 35.5,
      temperature_c: 18.5,
      humidity_pct: 84,
      nitrogen_ppm: 92,
      phosphorus_ppm: 38,
      potassium_ppm: 185,
      soil_ph: 6.5,
    },
    advisory: {
      irrigation_advice: 'Avoid evening sprinkler watering to prevent leaf wetness overnight.',
      npk_advice: 'High blight risk: Apply protective fungicide Mancozeb 75% WP @ 2.5 g/L or Chlorothalonil @ 2 g/L before symptoms flare.',
      action_items: [
        'Preventative Mancozeb foliar spray within 24 hours',
        'Shift irrigation to early mornings',
        'Use the Krishi Setu Crop Doctor to scan suspect lower leaves'
      ],
      advisory_records: [
        {
          id: 801,
          farm_id: 'sample-8',
          type: 'disease',
          message: '🔬 DISEASE OUTBREAK ALERT: 84% humidity + 18.5°C triggers Early Blight. Spray Mancozeb @ 2.5g/L.',
          is_read: false,
          created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
        }
      ]
    }
  },
  {
    id: 'sample-9',
    name: 'Khandesh Drip Banana Plantation',
    farmer_name: 'Prakash Chaudhari',
    region: 'Jalgaon, Maharashtra',
    crop_type: 'Banana',
    area_acres: 8.0,
    irrigation_source: 'borewell',
    preferred_season: 'both',
    scenario_title: 'High-Yield Precision Fertigation',
    scenario_description: 'Grand Naine banana variety under automated daily drip fertigation schedule.',
    condition_tag: 'high_yield',
    condition_label: 'High Yield Fertigation 🍌',
    condition_severity: 'optimal',
    telemetry: {
      soil_moisture: 34.0,
      temperature_c: 29.5,
      humidity_pct: 68,
      nitrogen_ppm: 145,
      phosphorus_ppm: 58,
      potassium_ppm: 250,
      soil_ph: 6.8,
    },
    advisory: {
      irrigation_advice: 'Drip system running optimally at 18 liters/plant/day. Soil moisture stable at 34%.',
      npk_advice: 'Peak vegetative feeding: Fertigate with 19:19:19 @ 5 kg/acre/week along with liquid bio-potash.',
      action_items: [
        'Continue precision drip schedule',
        'Desucker secondary shoots to maximize bunch size',
        'Bag developing bunches with polypropylene sleeves'
      ],
      advisory_records: [
        {
          id: 901,
          farm_id: 'sample-9',
          type: 'npk',
          message: '🟢 Fertigation optimal. Potassium at 250 ppm supporting robust bunch formation.',
          is_read: true,
          created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
        }
      ]
    }
  },
  {
    id: 'sample-10',
    name: 'Brij Mustard Golden Field',
    farmer_name: 'Gopal Lal Sharma',
    region: 'Bharatpur, Rajasthan',
    crop_type: 'Mustard',
    area_acres: 9.0,
    irrigation_source: 'borewell',
    preferred_season: 'Rabi',
    scenario_title: 'Critical Flowering Stage Moisture Drop',
    scenario_description: 'Mustard in peak yellow flowering; soil moisture dropped to 17.5%.',
    condition_tag: 'drought',
    condition_label: 'Flowering Stage Moisture Deficit 💧',
    condition_severity: 'warning',
    telemetry: {
      soil_moisture: 17.5,
      temperature_c: 20.5,
      humidity_pct: 44,
      nitrogen_ppm: 66,
      phosphorus_ppm: 28,
      potassium_ppm: 132,
      soil_ph: 7.4,
    },
    advisory: {
      irrigation_advice: 'URGENT: Mustard flowering stage requires critical irrigation. Moisture at 17.5% will cause pod abortion if not irrigated within 48h.',
      npk_advice: 'Apply water-soluble Sulfur 80% WDG @ 3 kg/acre during irrigation to boost oil content and yield.',
      action_items: [
        'Irrigate within 48 hours to preserve pod set',
        'Apply Sulfur 80% WDG to enhance oil percentage',
        'Check for mustard aphid colonies'
      ],
      advisory_records: [
        {
          id: 1001,
          farm_id: 'sample-10',
          type: 'irrigation',
          message: '💧 CRITICAL FLOWERING IRRIGATION: Moisture dropped to 17.5%. Irrigate now to prevent pod drop.',
          is_read: false,
          created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
        }
      ]
    }
  },
  {
    id: 'sample-11',
    name: 'Saurashtra Groundnut Farm',
    farmer_name: 'Kishorbhai Ahir',
    region: 'Junagadh, Gujarat',
    crop_type: 'Groundnut',
    area_acres: 11.0,
    irrigation_source: 'borewell',
    preferred_season: 'Kharif',
    scenario_title: 'Healthy Podding Stage with Gypsum Need',
    scenario_description: 'Pegging and pod enlargement stage requiring calcium for shell filling.',
    condition_tag: 'healthy',
    condition_label: 'Active Pod Development 🥜',
    condition_severity: 'optimal',
    telemetry: {
      soil_moisture: 29.0,
      temperature_c: 30.5,
      humidity_pct: 63,
      nitrogen_ppm: 80,
      phosphorus_ppm: 52,
      potassium_ppm: 168,
      soil_ph: 7.1,
    },
    advisory: {
      irrigation_advice: 'Soil moisture is in the ideal 28-30% range for gynophore soil penetration.',
      npk_advice: 'Broadcasting Gypsum @ 150 kg/acre around plant base is essential now to supply Calcium for pod shell hardening.',
      action_items: [
        'Apply Gypsum @ 150 kg/acre before earthing up',
        'Avoid deep inter-cultivation to protect developing pegs',
        'Next light irrigation in 4 days'
      ],
      advisory_records: [
        {
          id: 1101,
          farm_id: 'sample-11',
          type: 'npk',
          message: '🟢 Pod development optimal: Apply 150 kg/acre Gypsum for healthy kernel formation.',
          is_read: true,
          created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
        }
      ]
    }
  },
  {
    id: 'sample-12',
    name: 'Nashik Red Onion Plot',
    farmer_name: 'Bhausaheb Shinde',
    region: 'Nashik, Maharashtra',
    crop_type: 'Onion',
    area_acres: 5.5,
    irrigation_source: 'borewell',
    preferred_season: 'Rabi',
    scenario_title: 'Sulfur & Nitrogen Deficient Onion',
    scenario_description: 'Pale yellow leaves and stunted bulb initiation due to low sulfur and nitrogen.',
    condition_tag: 'sulfur_deficient',
    condition_label: 'Sulfur & N Deficient 🧅',
    condition_severity: 'warning',
    telemetry: {
      soil_moisture: 25.8,
      temperature_c: 23.4,
      humidity_pct: 54,
      nitrogen_ppm: 54,
      phosphorus_ppm: 32,
      potassium_ppm: 126,
      soil_ph: 7.5,
    },
    advisory: {
      irrigation_advice: 'Maintain regular short-interval light irrigations (onions are shallow-rooted).',
      npk_advice: 'Sulfur and Nitrogen deficiency: Apply Ammonium Sulphate @ 30 kg/acre + Micronutrient mixture foliar spray.',
      action_items: [
        'Top-dress with Ammonium Sulphate @ 30 kg/acre',
        'Spray micronutrient mixture (Zinc + Boron)',
        'Check for onion thrips (silver streaks on leaves)'
      ],
      advisory_records: [
        {
          id: 1201,
          farm_id: 'sample-12',
          type: 'npk',
          message: '⚠️ SULFUR & N DEFICIENCY: Apply Ammonium Sulphate @ 30 kg/acre for pungency and bulb size.',
          is_read: false,
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        }
      ]
    }
  }
];

export function getSampleFarmById(id: string): SampleFarm | undefined {
  return SAMPLE_FARMS.find(f => f.id === id);
}
