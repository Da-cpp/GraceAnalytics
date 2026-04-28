import os
import joblib
import pandas as pd
import numpy as np
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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

raw_data_template = {
    'store_id': 3012, 'date': '15/09/2023', 'month': 9, 'day_of_week': 5, 
    'parish': 'St. James', 'sku_category': 'Personal Care', 'store_open': 1,
    'near_transport_hub': 0, 'competitor_nearby': 1, 'promo_active': 0,
    'promo_type': 'None', 'is_christmas_season': 0, 'is_easter_week': 0,
    'is_carnival_season': 0, 'is_back_to_school': 0, 'school_holiday': 0,
    'jamaica_public_holiday': 0, 'holiday_name': 'None', 'is_hurricane_season': 1,
    'weekly_rainfall_mm': 45.8,
    # from sidebar
    'store_type': 'Pharmacy', 'customer_footfall': 850, 
    'normal_price_jmd': 850.50, 'avg_unit_price_jmd': 850.50
}

def prepare_full_features(input_df):
    X = input_df.copy() 
    X['date'] = pd.to_datetime(X['date'], dayfirst=True)
    X['week_of_year'] = X['date'].dt.isocalendar().week.astype(int)
    X['is_weekend'] = X['day_of_week'].apply(lambda x: 1 if x >= 5 else 0)
    X['is_month_start'] = X['date'].dt.is_month_start.astype(int)
    X['is_month_end'] = X['date'].dt.is_month_end.astype(int)
    X['footfall_log'] = np.log1p(X['customer_footfall'])
    X['discount_pct'] = (X['normal_price_jmd'] - X['avg_unit_price_jmd']) / X['normal_price_jmd']
    X['is_discounted'] = (X['discount_pct'] > 0).astype(int)
    
    event_cols = ['is_christmas_season', 'is_easter_week', 'is_carnival_season', 
                  'is_back_to_school', 'school_holiday', 'jamaica_public_holiday']
    X['event_pressure'] = X[event_cols].sum(axis=1)

    X = pd.get_dummies(X, columns=['parish', 'store_type', 'sku_category'])

    model_features = predictor.model.feature_names_in_
    for col in model_features:
        if col not in X.columns:
            X[col] = 0
            
    return X[model_features]

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class SidebarInputs(BaseModel):
    customer_footfall: int
    store_type: str
    normal_price_jmd: float
    avg_unit_price_jmd: float

@app.post("/predict")
async def get_prediction(data: SidebarInputs):
    full_row = raw_data_template.copy()
    full_row.update(data.dict())
    
    df = pd.DataFrame([full_row])
    final_input = prepare_full_features(df)
    prediction = predictor.predict(final_input)
    
    return {"prediction": float(prediction[0])}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)