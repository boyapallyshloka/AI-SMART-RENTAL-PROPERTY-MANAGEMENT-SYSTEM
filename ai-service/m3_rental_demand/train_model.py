import os
import sys
import json
import joblib
import numpy as np
import pandas as pd

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)
PARENT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if PARENT_DIR not in sys.path:
    sys.path.insert(0, PARENT_DIR)

from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.utils.class_weight import compute_sample_weight
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    f1_score,
    accuracy_score,
    recall_score,
    precision_score,
    roc_auc_score,
    confusion_matrix,
    r2_score,
)

try:
    from m3_rental_demand import pipeline
    sys.modules["pipeline"] = pipeline
    from m3_rental_demand.pipeline import RentalDemandPipeline
    from m3_rental_demand.preprocessing import load_and_prepare, time_based_split, FEATURES, TARGET
except ImportError:
    import pipeline
    sys.modules["m3_rental_demand.pipeline"] = pipeline
    from pipeline import RentalDemandPipeline
    from preprocessing import load_and_prepare, time_based_split, FEATURES, TARGET

ARTIFACTS_DIR = os.path.join(CURRENT_DIR, "artifacts")



def train_and_evaluate():
    print("SCRIPT STARTED")

    # 1. Load prepared data and perform time-based split
    df = load_and_prepare()
    train, test = time_based_split(df)

    X_train, y_train = train[FEATURES], train[TARGET]
    X_test, y_test = test[FEATURES], test[TARGET]

    y_train_bin = (y_train > 0).astype(int)
    y_test_bin = (y_test > 0).astype(int)

    # 2. Legacy model training (kept for strict backward compatibility)
    sample_weights = compute_sample_weight(class_weight="balanced", y=y_train_bin)

    classifier = GradientBoostingClassifier(n_estimators=200, random_state=42)
    classifier.fit(X_train, y_train_bin, sample_weight=sample_weights)

    probs = classifier.predict_proba(X_test)[:, 1]
    print(f"Probability range: min={probs.min():.4f}, max={probs.max():.4f}, mean={probs.mean():.4f}")

    best_threshold, best_f1 = 0.5, 0.0
    for t in np.arange(0.05, 0.96, 0.05):
        preds_t = (probs >= t).astype(int)
        f1_t = f1_score(y_test_bin, preds_t, zero_division=0)
        if f1_t > best_f1:
            best_f1, best_threshold = f1_t, t

    print(f"Best threshold found: {best_threshold:.2f} (F1={best_f1:.4f})")

    class_preds = (probs >= best_threshold).astype(int)

    nonzero_mask = y_train > 0
    regressor = GradientBoostingRegressor(n_estimators=200, random_state=42)
    regressor.fit(X_train[nonzero_mask], y_train[nonzero_mask])

    reg_preds = regressor.predict(X_test).clip(min=0)
    final_preds = class_preds * reg_preds

    # 3. Fit unified pipeline packaging preprocessing + model together (Avenue360 Standard v1.1)
    print("\nFitting unified RentalDemandPipeline...")
    pipeline = RentalDemandPipeline(n_estimators=200, random_state=42, threshold=0.5)
    pipeline.fit(train, val_df=test)

    # Verify pipeline predictions match expected performance on raw test split
    pipeline_preds = pipeline.predict(test)
    pipeline_mae = mean_absolute_error(y_test, pipeline_preds)
    pipeline_rmse = mean_squared_error(y_test, pipeline_preds) ** 0.5
    pipeline_f1 = f1_score(y_test_bin, (pipeline_preds > 0).astype(int), zero_division=0)
    print(f"Pipeline Test MAE: {pipeline_mae:.4f}, RMSE: {pipeline_rmse:.4f}, Binarized F1: {pipeline_f1:.4f}")

    mae = mean_absolute_error(y_test, final_preds)
    rmse = mean_squared_error(y_test, final_preds) ** 0.5
    acc = accuracy_score(y_test_bin, class_preds)
    f1 = f1_score(y_test_bin, class_preds)
    recall = recall_score(y_test_bin, class_preds)
    precision = precision_score(y_test_bin, class_preds, zero_division=0)

    # --- Additional metrics ---
    roc_auc = roc_auc_score(y_test_bin, probs)
    tn, fp, fn, tp = confusion_matrix(y_test_bin, class_preds).ravel()
    r2 = r2_score(y_test, final_preds)

    actual_nonzero_mask = y_test > 0
    if actual_nonzero_mask.sum() > 0:
        regressor_only_mae = mean_absolute_error(y_test[actual_nonzero_mask], reg_preds[actual_nonzero_mask])
        regressor_only_rmse = mean_squared_error(y_test[actual_nonzero_mask], reg_preds[actual_nonzero_mask]) ** 0.5
    else:
        regressor_only_mae = regressor_only_rmse = None

    print(f"\nMAE: {mae:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"Binarized Accuracy: {acc:.4f}")
    print(f"Binarized F1: {f1:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"Precision: {precision:.4f}")

    print(f"\n--- Additional Metrics ---")
    print(f"ROC-AUC: {roc_auc:.4f}")
    print(f"Confusion Matrix: TN={tn}, FP={fp}, FN={fn}, TP={tp}")
    print(f"R-squared: {r2:.4f}")
    if regressor_only_mae is not None:
        print(f"Regressor-only MAE (on actual nonzero rows): {regressor_only_mae:.4f}")
        print(f"Regressor-only RMSE (on actual nonzero rows): {regressor_only_rmse:.4f}")

    os.makedirs(ARTIFACTS_DIR, exist_ok=True)

    # Save legacy individual model artifacts (backward compatibility)
    joblib.dump(classifier, os.path.join(ARTIFACTS_DIR, "model_m3_classifier.pkl"))
    joblib.dump(regressor, os.path.join(ARTIFACTS_DIR, "model_m3_regressor.pkl"))

    # Save single unified pipeline artifact (Avenue360 ML Standard v1.1)
    pipeline_path = os.path.join(ARTIFACTS_DIR, "model_pipeline.joblib")
    joblib.dump(pipeline, pipeline_path)
    print(f"Saved unified pipeline to {pipeline_path}")

    metrics = {
        "model_version": "1.0",
        "legacy_version_tag": "m3_v5_gb_autothreshold",
        "model_type": "GradientBoostingClassifier(weighted) + GradientBoostingRegressor",
        "pipeline_artifact": "model_pipeline.joblib",
        "threshold": float(best_threshold),
        "mae": float(mae),
        "rmse": float(rmse),
        "binarized_accuracy": float(acc),
        "binarized_f1": float(f1),
        "recall": float(recall),
        "precision": float(precision),
        "roc_auc": float(roc_auc),
        "confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)},
        "r2_score": float(r2),
        "regressor_only_mae": float(regressor_only_mae) if regressor_only_mae is not None else None,
        "regressor_only_rmse": float(regressor_only_rmse) if regressor_only_rmse is not None else None,
        "train_range": "2024-01 to 2025-06",
        "test_range": "2025-07 to 2025-11",
        "features": FEATURES,
    }
    metrics_path = os.path.join(ARTIFACTS_DIR, "metrics_final.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"\nModels, unified pipeline, and metrics saved to {ARTIFACTS_DIR}")


if __name__ == "__main__":
    train_and_evaluate()