import os
import sys
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, RegressorMixin
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.utils.class_weight import compute_sample_weight
from sklearn.metrics import f1_score

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)
PARENT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if PARENT_DIR not in sys.path:
    sys.path.insert(0, PARENT_DIR)

# Register module under both package and bare names for seamless joblib serialization
if __name__ in sys.modules:
    current_mod = sys.modules[__name__]
    if "pipeline" not in sys.modules:
        sys.modules["pipeline"] = current_mod
    if "m3_rental_demand.pipeline" not in sys.modules:
        sys.modules["m3_rental_demand.pipeline"] = current_mod


NUMERIC_FEATURES = [
    "property_count", "application_count", "agreement_start_count",
    "average_monthly_rent", "demand_lag_1_month", "demand_lag_2_month",
    "demand_growth_1_month", "occupancy_rate", "vacancy_rate",
    "available_unit_count", "month"
]

CATEGORICAL_FEATURES = [
    "city", "area_locality"
]

MODEL_FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES

TARGET = "next_month_demand"


class RentalDemandPipeline(BaseEstimator, RegressorMixin):
    """
    End-to-end ML Pipeline for M3 Rental Demand Prediction complying with
    Avenue360 ML Standard v1.1.

    Encapsulates:
    1. Fitted preprocessing: OneHotEncoder for city and area_locality via
       ColumnTransformer, and calendar month derivation from year_month.
    2. Two-stage model architecture:
       - GradientBoostingClassifier (with balanced sample weights) to predict
         zero vs non-zero demand probability with an optimized threshold.
       - GradientBoostingRegressor (trained strictly on non-zero demand samples)
         to estimate demand magnitude.
    """

    def __init__(self, n_estimators: int = 200, random_state: int = 42, threshold: float = 0.5):
        self.n_estimators = n_estimators
        self.random_state = random_state
        self.threshold = threshold
        self.model_version = "1.0"

        # Fitted attributes
        self.preprocessor_ = None
        self.threshold_ = threshold
        self.classifier_ = None
        self.regressor_ = None
        self.features_ = MODEL_FEATURES

    def _prepare_inputs(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Derives calendar month if missing from year_month.
        """
        data = df.copy()
        if "month" not in data.columns and "year_month" in data.columns:
            data["month"] = data["year_month"].astype(str).str.split("-").str[1].astype(int)
        return data

    def fit(self, df: pd.DataFrame, target_col: str = TARGET, val_df: pd.DataFrame = None):
        """
        Fits preprocessing ColumnTransformer and two-stage classifier + regressor.

        Parameters:
            df: Training DataFrame containing raw features and target column.
            target_col: Name of the demand target column.
            val_df: Optional validation DataFrame used to tune classification threshold.
        """
        # 1. Prepare training data
        train_data = self._prepare_inputs(df)
        X_train = train_data[self.features_]
        y_train = train_data[target_col]
        y_train_bin = (y_train > 0).astype(int)

        # 2. Fit ColumnTransformer (OneHotEncoder fitted exclusively on training data)
        self.preprocessor_ = ColumnTransformer(
            transformers=[
                ("num", "passthrough", NUMERIC_FEATURES),
                ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=True), CATEGORICAL_FEATURES),
            ]
        )
        X_train_encoded = self.preprocessor_.fit_transform(X_train)

        # 3. Fit Stage 1: GradientBoostingClassifier with balanced sample weights
        sample_weights = compute_sample_weight(class_weight="balanced", y=y_train_bin)
        self.classifier_ = GradientBoostingClassifier(
            n_estimators=self.n_estimators,
            random_state=self.random_state
        )
        self.classifier_.fit(X_train_encoded, y_train_bin, sample_weight=sample_weights)

        # 4. Tune threshold if validation set provided, otherwise use default
        if val_df is not None:
            val_data = self._prepare_inputs(val_df)
            X_val = val_data[self.features_]
            y_val_bin = (val_data[target_col] > 0).astype(int)
            X_val_encoded = self.preprocessor_.transform(X_val)

            probs = self.classifier_.predict_proba(X_val_encoded)[:, 1]
            best_threshold, best_f1 = self.threshold, 0.0
            for t in np.arange(0.05, 0.96, 0.05):
                preds_t = (probs >= t).astype(int)
                f1_t = f1_score(y_val_bin, preds_t, zero_division=0)
                if f1_t > best_f1:
                    best_f1, best_threshold = f1_t, t

            self.threshold_ = float(best_threshold)
        else:
            self.threshold_ = float(self.threshold)

        # 5. Fit Stage 2: GradientBoostingRegressor on non-zero demand subset
        nonzero_mask = (y_train > 0).values if hasattr(y_train, "values") else (y_train > 0)
        self.regressor_ = GradientBoostingRegressor(
            n_estimators=self.n_estimators,
            random_state=self.random_state
        )
        if nonzero_mask.sum() > 0:
            self.regressor_.fit(X_train_encoded[nonzero_mask], y_train[nonzero_mask])
        else:
            self.regressor_.fit(X_train_encoded, y_train)

        return self

    def predict(self, raw_input) -> np.ndarray:
        """
        Runs full prediction on raw inputs.
        Accepts:
            - pandas DataFrame
            - dict (single row)
            - list of dicts

        Returns:
            numpy array of demand predictions >= 0.
        """
        if isinstance(raw_input, dict):
            raw_df = pd.DataFrame([raw_input])
        elif isinstance(raw_input, list):
            raw_df = pd.DataFrame(raw_input)
        elif isinstance(raw_input, pd.DataFrame):
            raw_df = raw_input.copy()
        else:
            raise ValueError(f"Unsupported input type for predict: {type(raw_input)}")

        data = self._prepare_inputs(raw_df)

        missing_features = [f for f in self.features_ if f not in data.columns]
        if missing_features:
            raise ValueError(f"Missing required features after preprocessing: {missing_features}")

        X = data[self.features_]
        X_encoded = self.preprocessor_.transform(X)

        # Stage 1: Classify zero vs non-zero demand
        probs = self.classifier_.predict_proba(X_encoded)[:, 1]
        class_preds = (probs >= self.threshold_).astype(int)

        # Stage 2: Predict magnitude on demand
        reg_preds = self.regressor_.predict(X_encoded).clip(min=0)

        # Final prediction: hurdle combination
        final_preds = np.maximum(0.0, class_preds * reg_preds)
        return final_preds
