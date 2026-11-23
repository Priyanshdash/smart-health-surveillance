#!/usr/bin/env python3
"""
Waterborne Disease Dataset Generator
Creates comprehensive dataset for ML model training
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta

print("=" * 70)
print("🚀 WATERBORNE DISEASE DATASET GENERATOR")
print("=" * 70)

# Set random seed for reproducibility
np.random.seed(42)

# Disease types and their symptom patterns
DISEASES = {
    'Cholera': {
        'symptom_diarrhea': 0.95, 'symptom_vomiting': 0.80, 'symptom_fever': 0.40,
        'symptom_abdominal_pain': 0.60, 'symptom_dehydration': 0.90,
        'symptom_jaundice': 0.05, 'symptom_bloody_stool': 0.10, 'symptom_skin_rash': 0.05
    },
    'Typhoid': {
        'symptom_diarrhea': 0.60, 'symptom_vomiting': 0.50, 'symptom_fever': 0.95,
        'symptom_abdominal_pain': 0.80, 'symptom_dehydration': 0.50,
        'symptom_jaundice': 0.15, 'symptom_bloody_stool': 0.20, 'symptom_skin_rash': 0.30
    },
    'Hepatitis_A': {
        'symptom_diarrhea': 0.40, 'symptom_vomiting': 0.60, 'symptom_fever': 0.70,
        'symptom_abdominal_pain': 0.70, 'symptom_dehydration': 0.30,
        'symptom_jaundice': 0.90, 'symptom_bloody_stool': 0.05, 'symptom_skin_rash': 0.10
    },
    'Dysentery': {
        'symptom_diarrhea': 0.95, 'symptom_vomiting': 0.40, 'symptom_fever': 0.70,
        'symptom_abdominal_pain': 0.90, 'symptom_dehydration': 0.70,
        'symptom_jaundice': 0.05, 'symptom_bloody_stool': 0.85, 'symptom_skin_rash': 0.05
    },
    'Giardiasis': {
        'symptom_diarrhea': 0.90, 'symptom_vomiting': 0.30, 'symptom_fever': 0.20,
        'symptom_abdominal_pain': 0.80, 'symptom_dehydration': 0.50,
        'symptom_jaundice': 0.05, 'symptom_bloody_stool': 0.10, 'symptom_skin_rash': 0.05
    },
    'Cryptosporidiosis': {
        'symptom_diarrhea': 0.95, 'symptom_vomiting': 0.50, 'symptom_fever': 0.40,
        'symptom_abdominal_pain': 0.70, 'symptom_dehydration': 0.80,
        'symptom_jaundice': 0.05, 'symptom_bloody_stool': 0.10, 'symptom_skin_rash': 0.05
    },
    'Leptospirosis': {
        'symptom_diarrhea': 0.30, 'symptom_vomiting': 0.50, 'symptom_fever': 0.95,
        'symptom_abdominal_pain': 0.60, 'symptom_dehydration': 0.40,
        'symptom_jaundice': 0.40, 'symptom_bloody_stool': 0.10, 'symptom_skin_rash': 0.60
    },
    'No_Disease': {
        'symptom_diarrhea': 0.05, 'symptom_vomiting': 0.05, 'symptom_fever': 0.10,
        'symptom_abdominal_pain': 0.10, 'symptom_dehydration': 0.05,
        'symptom_jaundice': 0.02, 'symptom_bloody_stool': 0.02, 'symptom_skin_rash': 0.05
    }
}

# Water source risk levels
WATER_SOURCES = {
    'tap_treated': {'risk': 0.1, 'fecal_range': (0, 50), 'turbidity_range': (0, 3)},
    'tap_untreated': {'risk': 0.4, 'fecal_range': (20, 200), 'turbidity_range': (2, 8)},
    'well_protected': {'risk': 0.3, 'fecal_range': (10, 150), 'turbidity_range': (1, 6)},
    'well_unprotected': {'risk': 0.6, 'fecal_range': (50, 500), 'turbidity_range': (5, 15)},
    'river': {'risk': 0.8, 'fecal_range': (100, 1000), 'turbidity_range': (10, 30)},
    'pond': {'risk': 0.7, 'fecal_range': (80, 800), 'turbidity_range': (8, 25)},
    'tank': {'risk': 0.5, 'fecal_range': (30, 300), 'turbidity_range': (3, 12)}
}

# Water treatment types
WATER_TREATMENTS = {
    'chlorinated': {'risk': 0.1, 'coliform_mult': 0.1},
    'boiled': {'risk': 0.15, 'coliform_mult': 0.2},
    'filtered': {'risk': 0.25, 'coliform_mult': 0.3},
    'none': {'risk': 0.9, 'coliform_mult': 1.0}
}

def generate_case(disease, water_source, water_treatment, is_urban, season):
    """Generate a single case with realistic correlations"""
    
    case = {'disease': disease}
    
    # Symptoms based on disease
    symptom_probs = DISEASES[disease]
    for symptom, prob in symptom_probs.items():
        # Add some randomness
        actual_prob = np.clip(prob + np.random.normal(0, 0.1), 0, 1)
        case[symptom] = 1 if np.random.random() < actual_prob else 0
    
    # Water quality parameters
    source_info = WATER_SOURCES[water_source]
    treatment_info = WATER_TREATMENTS[water_treatment]
    
    # Base contamination on source and treatment
    base_risk = source_info['risk'] * treatment_info['risk']
    
    # Fecal coliform
    fecal_min, fecal_max = source_info['fecal_range']
    case['fecal_coliform_per_100ml'] = int(np.random.uniform(fecal_min, fecal_max) * treatment_info['coliform_mult'])
    
    # Total coliform (usually 2-5x fecal)
    case['total_coliform_per_100ml'] = int(case['fecal_coliform_per_100ml'] * np.random.uniform(2, 5))
    
    # Turbidity
    turb_min, turb_max = source_info['turbidity_range']
    case['turbidity_ntu'] = np.random.uniform(turb_min, turb_max)
    
    # pH (contaminated water tends to be more acidic or alkaline)
    if base_risk > 0.5:
        case['ph'] = np.random.choice([np.random.uniform(5.5, 6.5), np.random.uniform(8.5, 9.5)])
    else:
        case['ph'] = np.random.uniform(6.5, 8.5)
    
    # TDS (Total Dissolved Solids)
    case['tds_mg_l'] = np.random.uniform(200, 1000) if base_risk > 0.5 else np.random.uniform(100, 500)
    
    # Nitrate (higher in contaminated water)
    case['nitrate_mg_l'] = np.random.uniform(20, 100) if base_risk > 0.5 else np.random.uniform(0, 20)
    
    # BOD (Biological Oxygen Demand)
    case['bod_mg_l'] = np.random.uniform(5, 15) if base_risk > 0.5 else np.random.uniform(0, 5)
    
    # Dissolved Oxygen (lower in contaminated water)
    case['dissolved_oxygen_mg_l'] = np.random.uniform(2, 5) if base_risk > 0.5 else np.random.uniform(6, 9)
    
    # Water Quality Index (0-100, lower is worse)
    case['water_quality_index'] = np.random.uniform(20, 50) if base_risk > 0.5 else np.random.uniform(60, 95)
    
    # Sanitation and environment
    if is_urban:
        case['open_defecation_rate'] = np.random.uniform(5, 30)
        case['toilet_access'] = 1 if np.random.random() < 0.8 else 0
        case['sewage_treatment_pct'] = np.random.uniform(40, 80)
        case['population_density'] = np.random.uniform(1000, 5000)
    else:
        case['open_defecation_rate'] = np.random.uniform(30, 70)
        case['toilet_access'] = 1 if np.random.random() < 0.4 else 0
        case['sewage_treatment_pct'] = np.random.uniform(10, 40)
        case['population_density'] = np.random.uniform(100, 1000)
    
    # Rainfall and humidity (seasonal)
    if season == 'monsoon':
        case['avg_rainfall_mm'] = np.random.uniform(200, 500)
        case['avg_humidity_pct'] = np.random.uniform(75, 95)
        case['flooding'] = 1 if np.random.random() < 0.3 else 0
    elif season == 'post_monsoon':
        case['avg_rainfall_mm'] = np.random.uniform(50, 150)
        case['avg_humidity_pct'] = np.random.uniform(65, 80)
        case['flooding'] = 1 if np.random.random() < 0.1 else 0
    else:  # winter/summer
        case['avg_rainfall_mm'] = np.random.uniform(10, 100)
        case['avg_humidity_pct'] = np.random.uniform(50, 70)
        case['flooding'] = 0
    
    # Demographics
    case['is_urban'] = 1 if is_urban else 0
    case['age'] = int(np.random.choice([
        np.random.uniform(0, 5),    # children (high risk)
        np.random.uniform(5, 15),   # youth
        np.random.uniform(15, 60),  # adults
        np.random.uniform(60, 80)   # elderly (high risk)
    ], p=[0.15, 0.20, 0.50, 0.15]))
    
    case['water_source'] = water_source
    case['water_treatment'] = water_treatment
    
    return case

# Generate dataset
print("\n📊 Generating dataset...")

dataset = []
n_samples = 5000  # Generate 5000 samples

# Distribution of cases
disease_weights = {
    'No_Disease': 0.40,
    'Cholera': 0.12,
    'Typhoid': 0.12,
    'Hepatitis_A': 0.08,
    'Dysentery': 0.10,
    'Giardiasis': 0.08,
    'Cryptosporidiosis': 0.06,
    'Leptospirosis': 0.04
}

diseases = list(disease_weights.keys())
weights = list(disease_weights.values())

for i in range(n_samples):
    # Select disease
    disease = np.random.choice(diseases, p=weights)
    
    # Select water source (riskier sources more common in disease cases)
    if disease == 'No_Disease':
        water_source = np.random.choice(list(WATER_SOURCES.keys()), 
                                       p=[0.3, 0.2, 0.2, 0.1, 0.1, 0.05, 0.05])
    else:
        water_source = np.random.choice(list(WATER_SOURCES.keys()), 
                                       p=[0.05, 0.1, 0.1, 0.2, 0.25, 0.2, 0.1])
    
    # Select water treatment
    if disease == 'No_Disease':
        water_treatment = np.random.choice(list(WATER_TREATMENTS.keys()), 
                                          p=[0.4, 0.3, 0.2, 0.1])
    else:
        water_treatment = np.random.choice(list(WATER_TREATMENTS.keys()), 
                                          p=[0.1, 0.15, 0.25, 0.5])
    
    # Urban/rural
    is_urban = np.random.random() < 0.4
    
    # Season
    season = np.random.choice(['monsoon', 'post_monsoon', 'winter', 'summer'], 
                             p=[0.35, 0.25, 0.20, 0.20])
    
    case = generate_case(disease, water_source, water_treatment, is_urban, season)
    dataset.append(case)
    
    if (i + 1) % 1000 == 0:
        print(f"   Generated {i + 1}/{n_samples} samples...")

# Create DataFrame
df = pd.DataFrame(dataset)

# Reorder columns
column_order = [
    # Symptoms
    'symptom_diarrhea', 'symptom_vomiting', 'symptom_fever', 
    'symptom_abdominal_pain', 'symptom_dehydration', 
    'symptom_jaundice', 'symptom_bloody_stool', 'symptom_skin_rash',
    # Water quality
    'ph', 'turbidity_ntu', 'fecal_coliform_per_100ml', 'total_coliform_per_100ml',
    'tds_mg_l', 'nitrate_mg_l', 'bod_mg_l', 'dissolved_oxygen_mg_l', 'water_quality_index',
    # Sanitation
    'open_defecation_rate', 'toilet_access', 'sewage_treatment_pct',
    # Environment
    'avg_rainfall_mm', 'avg_humidity_pct', 'flooding',
    # Demographics
    'is_urban', 'population_density', 'age',
    # Water source
    'water_source', 'water_treatment',
    # Target
    'disease'
]

df = df[column_order]

# Save to CSV
output_file = 'waterborne_disease_dataset.csv'
df.to_csv(output_file, index=False)

print(f"\n✅ Dataset created: {output_file}")
print(f"   Total samples: {len(df)}")
print(f"\n📊 Disease distribution:")
for disease in diseases:
    count = len(df[df['disease'] == disease])
    pct = count / len(df) * 100
    print(f"   {disease:20s}: {count:4d} ({pct:5.1f}%)")

print("\n" + "=" * 70)
print("🎯 Dataset generation complete!")
print("=" * 70)
print(f"\n💾 File saved: datasets/{output_file}")
print("✅ Ready for ML model training!")
print("=" * 70)
