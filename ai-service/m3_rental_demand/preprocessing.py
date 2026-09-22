import pandas as pd
import os

DATA_PATH = "data/ml/M3_Rental_Demand.csv"
PROCESSED_DIR = "data/processed/m3_rental_demand"

FEATURES = [
    "property_count", "application_count", "agreement_start_count",
    "average_monthly_rent", "demand_lag_1_month", "demand_lag_2_month",
    "demand_growth_1_month", "occupancy_rate", "vacancy_rate",
    "available_unit_count", "month", "city_freq", "area_locality_freq"
]
TARGET = "next_month_demand"

def load_and_prepare():
    df = pd.read_csv(DATA_PATH)
    df["month"] = df["year_month"].str.split("-").str[1].astype(int)

    city_freq_map = df["city"].value_counts(normalize=True)
    locality_freq_map = df["area_locality"].value_counts(normalize=True)
    df["city_freq"] = df["city"].map(city_freq_map)
    df["area_locality_freq"] = df["area_locality"].map(locality_freq_map)

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
    train.to_csv(f"{PROCESSED_DIR}/train.csv", index=False)
    test.to_csv(f"{PROCESSED_DIR}/test.csv", index=False)
    print(f"Saved train ({len(train)} rows) and test ({len(test)} rows) to {PROCESSED_DIR}")

if __name__ == "__main__":
    df = load_and_prepare()
    train, test = time_based_split(df)
    save_processed(train, test)