import os
import pandas as pd

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
AI_SERVICE_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
DATA_PATH = os.path.join(AI_SERVICE_DIR, "data", "ml", "M3_Rental_Demand_Data.csv")
PROCESSED_DIR = os.path.join(CURRENT_DIR, "data", "ml", "m3_rental_demand")

NUMERIC_FEATURES = [
    "property_count", "application_count", "agreement_start_count",
    "average_monthly_rent", "demand_lag_1_month", "demand_lag_2_month",
    "demand_growth_1_month", "occupancy_rate", "vacancy_rate",
    "available_unit_count", "month"
]

CATEGORICAL_FEATURES = [
    "city", "area_locality"
]

FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES
TARGET = "next_month_demand"


def load_and_prepare():
    # Resolve dataset path robustly regardless of current working directory
    resolved_path = None
    candidate_paths = [
        DATA_PATH,
        os.path.join(AI_SERVICE_DIR, "data", "raw", "ml", "M3_Rental_Demand_Data.csv"),
        os.path.join(CURRENT_DIR, "..", "data", "ml", "M3_Rental_Demand_Data.csv"),
        os.path.join("..", "data", "ml", "M3_Rental_Demand_Data.csv"),
        os.path.join("data", "ml", "M3_Rental_Demand_Data.csv"),
        os.path.join(AI_SERVICE_DIR, "data", "ml", "M3_Rental_Demand_Data.csv"),
    ]
    for p in candidate_paths:
        if os.path.exists(p):
            resolved_path = p
            break

    if not resolved_path:
        raise FileNotFoundError(f"Could not find M3 dataset at any candidate location: {candidate_paths}")

    df = pd.read_csv(resolved_path)
    df["month"] = df["year_month"].astype(str).str.split("-").str[1].astype(int)
    df = df.sort_values("year_month").reset_index(drop=True)
    return df


def time_based_split(df):
    # Exclude 2025-12 onward - it's a placeholder/incomplete zone with 0% real demand
    valid_df = df[df["year_month"] < "2025-12"].copy()
    train = valid_df[valid_df["year_month"] <= "2025-06"].copy()
    test = valid_df[valid_df["year_month"] >= "2025-07"].copy()
    return train, test


def save_processed(train, test):
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    train.to_csv(os.path.join(PROCESSED_DIR, "train.csv"), index=False)
    test.to_csv(os.path.join(PROCESSED_DIR, "test.csv"), index=False)
    print(f"Saved train ({len(train)} rows) and test ({len(test)} rows) to {PROCESSED_DIR}")


if __name__ == "__main__":
    df = load_and_prepare()
    train, test = time_based_split(df)
    save_processed(train, test)
