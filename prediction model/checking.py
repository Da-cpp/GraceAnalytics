import pandas as pd
import numpy as np
import joblib
import os
import random

class GKSalesPredictor:
    def __init__(self, model_path):
        saved_obj = joblib.load(model_path)
        self.model = saved_obj.model
        self.scaler = saved_obj.scaler
        self.numeric_features = saved_obj.numeric_features

    def predict(self, X_input):
        X_p = X_input.copy()
        X_p[self.numeric_features] = self.scaler.transform(X_p[self.numeric_features])
        log_preds = self.model.predict(X_p)
        return np.expm1(log_preds)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "unified_gk_sales_model.joblib")

predictor = GKSalesPredictor(model_path)

raw_data = {
    'store_id': 3012,
    'date': '15/09/2023',
    'month': 9,
    'day_of_week': 5, 
    'parish': 'St. James',
    'store_type': 'Pharmacy',
    'sku_category': 'Personal Care',
    'store_open': 1,
    'near_transport_hub': 0,
    'competitor_nearby': 1,
    'normal_price_jmd': 850.50,
    'avg_unit_price_jmd': 850.50,
    'promo_active': 0,
    'promo_type': 'None',
    'is_christmas_season': 0,
    'is_easter_week': 0,
    'is_carnival_season': 0,
    'is_back_to_school': 0,
    'school_holiday': 0,
    'jamaica_public_holiday': 0,
    'holiday_name': 'None',
    'is_hurricane_season': 1,
    'weekly_rainfall_mm': 45.8,
    'customer_footfall': 850
}

df = pd.DataFrame([raw_data])


def prepare_full_features(input_df):
    X = input_df.copy() 
    X['date'] = pd.to_datetime(X['date'], dayfirst=True)
    

    X['week_of_year'] = X['date'].dt.isocalendar().week.astype(int)
    X['is_weekend'] = X['day_of_week'].apply(lambda x: 1 if x >= 5 else 0)
    X['is_month_start'] = X['date'].dt.is_month_start.astype(int)
    X['is_month_end'] = X['date'].dt.is_month_end.astype(int)
    
    # 2. SALES-BASED ENGINEERING
    X['footfall_log'] = np.log1p(X['customer_footfall'])
    X['discount_pct'] = (X['normal_price_jmd'] - X['avg_unit_price_jmd']) / X['normal_price_jmd']
    X['is_discounted'] = (X['discount_pct'] > 0).astype(int)
    
    event_cols = ['is_christmas_season', 'is_easter_week', 'is_carnival_season', 
                  'is_back_to_school', 'school_holiday', 'jamaica_public_holiday']
    X['event_pressure'] = X[event_cols].sum(axis=1)

    # 3. CATEGORICAL ENCODING (The 'Dummy' variables)
    # This creates columns like 'parish_St. Catherine'
    X = pd.get_dummies(X, columns=['parish', 'store_type', 'sku_category'])

    # 4. ALIGN WITH TRAINING COLUMNS
    # We must retrieve the exact list of columns the model was trained on
    # Since we saved the predictor object, we can pull them from the model itself
    model_features = predictor.model.feature_names_in_
    
    # Fill missing dummy columns with 0 (e.g., if it's not Hanover, parish_Hanover = 0)
    for col in model_features:
        if col not in X.columns:
            X[col] = 0
            
    return X[model_features]

# 6. RUN PREDICTION
try:
    final_input = prepare_full_features(df)
    prediction = predictor.predict(final_input)
    
    print("\n" + "="*30)
    print("--- GK SALES PREDICTION ---")
    print(f"Store: {raw_data['store_id']} | Parish: {raw_data['parish']}")
    print(f"Footfall: {raw_data['customer_footfall']}")
    print(f"Prediction: J${prediction[0]:,.2f}")
    print("="*30 + "\n")
    
except Exception as e:
    print(f"\n[!] Error: {e}")