# import os
# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from langchain_core.messages import HumanMessage
# from .agents.graph import build_graph
# from .retriever import ingest_documents, get_retriever_tool, get_propensity_tool

# app = FastAPI(title="Grace Intelligence API")


# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"], 
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# current_file_dir = os.path.dirname(os.path.abspath(__file__))
# pdf_path = os.path.join(current_file_dir, "media", "GK25split.pdf")

# print("🚀 API: Ingesting documents...")
# vectorstore = ingest_documents([pdf_path])
# retriever_tool = get_retriever_tool(vectorstore)
# propensity_tool = get_propensity_tool()

# graph = build_graph([retriever_tool, propensity_tool])

# print("✅ API: System Ready.")

# class ChatQuery(BaseModel):
#     text: str


# @app.post("/ask")
# async def ask_ai(query: ChatQuery):
#     try:
        
#         inputs = {"messages": [HumanMessage(content=query.text)]}
        
       
#         result = graph.invoke(inputs)
        
      
#         final_message = result["messages"][-1].content
        
#         return {"answer": final_message}
    
#     except Exception as e:
#         print(f"❌ API Error: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)



import os
import joblib
import pandas as pd
import numpy as np
import random
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_core.messages import HumanMessage

from .agents.graph import build_graph
from .retriever import ingest_documents, get_retriever_tool, get_propensity_tool

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

app = FastAPI(title="Grace Intelligence Unified API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

current_file_dir = os.path.dirname(os.path.abspath(__file__))

model_path = os.path.join(current_file_dir, "unified_gk_sales_model.joblib")
predictor = GKSalesPredictor(model_path)

pdf_path = os.path.join(current_file_dir, "media", "GK25split2.pdf")

print("🚀 API: Ingesting documents...")
vectorstore = ingest_documents([pdf_path])
retriever_tool = get_retriever_tool(vectorstore)
propensity_tool = get_propensity_tool()

graph = build_graph([retriever_tool, propensity_tool])

raw_data_template = {
    'store_id': 3012, 'date': '15/09/2023', 'month': 9, 'day_of_week': 5, 
    'parish': 'St. James', 'sku_category': 'Personal Care', 'store_open': 1,
    'near_transport_hub': 0, 'competitor_nearby': 1, 'promo_active': 0,
    'promo_type': 'None', 'is_christmas_season': 0, 'is_easter_week': 0,
    'is_carnival_season': 0, 'is_back_to_school': 0, 'school_holiday': 0,
    'jamaica_public_holiday': 0, 'holiday_name': 'None', 'is_hurricane_season': 1,
    'weekly_rainfall_mm': 45.8,
}

print("✅ API: Grace Intelligence System Ready.")

class SidebarInputs(BaseModel):
    customer_footfall: int
    store_type: str
    normal_price_jmd: float
    avg_unit_price_jmd: float

class ChatQuery(BaseModel):
    text: str

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


@app.post("/predict")
async def get_prediction(data: SidebarInputs):
    """Endpoint for the Model Tuning Sidebar (Sales Forecast)"""
    try:
        full_row = raw_data_template.copy()
        inc = data.dict()
        full_row.update(inc)

        f_norm = inc['customer_footfall'] / 5000.0
        full_row['is_christmas_season'] = 1 if f_norm > 0.7 else 0
        full_row['promo_active'] = 1 if inc['avg_unit_price_jmd'] < inc['normal_price_jmd'] else 0
        full_row['weekly_rainfall_mm'] = max(0, 250.0 * (1.0 - f_norm)) 

        df = pd.DataFrame([full_row])
        final_input = prepare_full_features(df)
        base_prediction = float(predictor.predict(final_input)[0])

        drastic_multiplier = 0.2 + (f_norm ** 2) * 3.8
        price_ratio = inc['avg_unit_price_jmd'] / inc['normal_price_jmd']
        price_sensitivity = (1.0 / price_ratio) ** 1.5
        
        final_val = base_prediction * drastic_multiplier * price_sensitivity
        final_val += (random.random() * 50) - 25 

        return {"prediction": round(max(100.0, final_val), 2)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction Error: {str(e)}")

@app.post("/ask")
async def ask_ai(query: ChatQuery):
    """Endpoint for the Grace Intelligence Agent (RAG)"""
    try:
        inputs = {"messages": [HumanMessage(content=query.text)]}
        result = graph.invoke(inputs)
        final_message = result["messages"][-1].content
        return {"answer": final_message}
    except Exception as e:
        print(f"❌ API Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)