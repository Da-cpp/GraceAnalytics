import joblib
import pandas as pd
import numpy as np
import os


class GKSalesPredictor:
    def __init__(self, model_path: str):
        self.bundle = joblib.load(model_path)

        self.model = self.bundle.model
        self.scaler = self.bundle.scaler
        self.numeric_features = self.bundle.numeric_features
        self.feature_names = self.model.feature_names_in_

    def preprocess(self, input_dict: dict) -> pd.DataFrame:
        df = pd.DataFrame([input_dict])

        # align with training features
        df = df.reindex(columns=self.feature_names, fill_value=0)

        # ensure numeric stability
        df[self.numeric_features] = df[self.numeric_features].astype(float)

        # scale numeric features
        df[self.numeric_features] = self.scaler.transform(df[self.numeric_features])

        return df

    def predict(self, input_dict: dict, inverse_log: bool = True):
        df = self.preprocess(input_dict)

        pred = self.model.predict(df)

        # 🔥 KEY FIX: reverse log transform if used in training
        if inverse_log:
            pred = np.expm1(pred)

        return pred