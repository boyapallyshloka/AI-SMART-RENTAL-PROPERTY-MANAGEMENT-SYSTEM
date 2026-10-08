"""
Scout -> M4 Payment Risk adapter.

Temporary development integration:
Uses the latest engineered M4 dataset row for a tenant
to obtain the 20 features required by the M4 inference layer.

This will later be replaced by authenticated/backend-provided
tenant features.
"""

from pathlib import Path
from typing import Any, Dict

import pandas as pd

from m4_payment_risk.inference import predict_payment_risk


BASE_DIR = Path(__file__).resolve().parent.parent

M4_DATASET_PATH = (
    BASE_DIR
    / "data"
    / "ml"
    / "M4_Payment_Risk_Engineered.csv"
)


M4_FEATURES = [
    "monthly_income",
    "historical_invoice_count",
    "late_payment_count",
    "missed_payment_count",
    "avg_days_late",
    "max_days_late",
    "historical_outstanding",
    "rent_to_income_ratio",
    "payment_completion_ratio",
    "recent_late_payment_count_3m",
    "recent_missed_payment_count_3m",
    "recent_avg_days_late_3m",
    "recent_payment_completion_ratio_3m",
    "recent_late_payment_count_6m",
    "recent_missed_payment_count_6m",
    "recent_avg_days_late_6m",
    "recent_payment_completion_ratio_6m",
    "late_payment_trend",
    "missed_payment_trend",
    "payment_completion_trend",
]


def get_latest_m4_features(tenant_id: str) -> Dict[str, Any]:
    """Get the latest available M4 feature row for a tenant."""

    if not tenant_id:
        raise ValueError("Tenant ID is required for payment-risk prediction.")

    if not M4_DATASET_PATH.exists():
        raise FileNotFoundError(
            f"M4 engineered dataset not found: {M4_DATASET_PATH}"
        )

    dataframe = pd.read_csv(M4_DATASET_PATH)

    tenant_rows = dataframe[
        dataframe["tenant_id"].astype(str) == str(tenant_id)
    ].copy()

    if tenant_rows.empty:
        raise ValueError(
            f"No M4 payment history found for tenant: {tenant_id}"
        )

    tenant_rows["snapshot_month"] = pd.to_datetime(
        tenant_rows["snapshot_month"]
    )

    latest_row = tenant_rows.sort_values(
        "snapshot_month"
    ).iloc[-1]

    missing_features = [
        feature
        for feature in M4_FEATURES
        if feature not in latest_row.index
    ]

    if missing_features:
        raise ValueError(
            f"M4 dataset is missing required features: {missing_features}"
        )

    return {
        feature: latest_row[feature]
        for feature in M4_FEATURES
    }


def predict_payment_risk_for_tenant(
    tenant_id: str,
) -> Dict[str, Any]:
    """Generate M4 payment-risk prediction for a tenant."""

    features = get_latest_m4_features(tenant_id)

    prediction = predict_payment_risk(features)

    return prediction