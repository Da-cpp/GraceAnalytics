import joblib
import os
import numpy as np
import pandas as pd
# This gets the directory where checking.py is actually located
base_path = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_path, 'gk_customer_segmentation_model.joblib')

sample_customer = {
    "age": 34,
    "weekly_household_income_jmd": 45000,
    "num_children_under_12": 2,
    "num_teens_at_home": 0,
    "months_as_gk_customer": 24,
    "days_since_last_purchase": 5,
    "mnt_tinned_meats_monthly_jmd": 3500,
    "mnt_baked_goods_monthly_jmd": 2000,
    "mnt_gk_juices_monthly_jmd": 1500,
    "mnt_saltfish_tinned_fish_monthly_jmd": 4000,
    "mnt_fresh_produce_monthly_jmd": 8000,
    "mnt_cooking_oil_monthly_jmd": 1200,
    "buys_gk_ketchup": 1, # Yes
    "buys_festival_dumpling_mix": 1,
    "num_supermarket_visits_monthly": 4,
    "num_market_vendor_visits_monthly": 2,
    "num_promo_purchases_monthly": 1,
    "uses_route_taxi": 1,
    "has_refrigerator": 1,
    "responded_to_gk_promo_tv": 0,
    "responded_to_gk_promo_radio": 1,
    "responded_to_gk_promo_social": 1,
    "gk_brand_loyalty_score": 85,
    "filed_complaint": 0, 
    "education_encoded": 2, # e.g., Tertiary
    "marital_status_Married": 1, "marital_status_Separated": 0, "marital_status_Single": 0,
    "preferred_cooking_oil_Grace": 1, "preferred_cooking_oil_Mazola": 0, "preferred_cooking_oil_Other/Generic": 0,
    "parish_Kingston": 0, "parish_Manchester": 0, "parish_Other": 0, "parish_St. Andrew": 1, "parish_St. Catherine": 0, "parish_St. Elizabeth": 0, "parish_St. James": 0,
    "shopping_location_type_Corner Shop": 0, "shopping_location_type_Market/Higglar": 0, "shopping_location_type_Mixed": 0, "shopping_location_type_Supermarket": 1, "shopping_location_type_Wholesale/Chinese Shop": 0
}

data = joblib.load(model_path)

test_df = pd.DataFrame([sample_customer])

# ... after your data = joblib.load(...) line
print("Model loaded successfully!")
print(f"Type of object: {type(data)}")

segment = data.predict(test_df)
print(f"The model has assigned this customer to Segment: {segment[0]}")

# If it's a Pipeline (as the warning suggests), let's see the steps
if hasattr(data, 'named_steps'):
    print(f"Pipeline steps: {data.named_steps.keys()}")

n_clusters = data.named_steps['kmeans'].n_clusters
print(f"This model groups customers into {n_clusters} distinct segments.")



feature_names = data.named_steps['scaler'].feature_names_in_

# print("--- REQUIRED COLUMNS ---")
# for i, name in enumerate(feature_names):
#     print(f"{i+1}. {name}")