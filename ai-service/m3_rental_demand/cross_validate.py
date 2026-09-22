import pandas as pd
import numpy as np
from sklearn.model_selection import TimeSeriesSplit
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.utils.class_weight import compute_sample_weight
from sklearn.metrics import f1_score, mean_absolute_error, recall_score, precision_score

from preprocessing import load_and_prepare, FEATURES, TARGET

def run_cross_validation(n_splits=5):
    df = load_and_prepare()
    df = df.sort_values("year_month").reset_index(drop=True)

    X = df[FEATURES]
    y = df[TARGET]
    y_bin = (y > 0).astype(int)

    tscv = TimeSeriesSplit(n_splits=n_splits)

    fold_results = []

    for fold_num, (train_idx, test_idx) in enumerate(tscv.split(X), start=1):
        X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
        y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
        y_train_bin, y_test_bin = y_bin.iloc[train_idx], y_bin.iloc[test_idx]

        # Skip folds where the test set has no real demand (like our earlier all-zero problem)
        if y_test_bin.sum() == 0:
            print(f"Fold {fold_num}: SKIPPED - test fold has 0% nonzero demand (likely placeholder data)")
            continue

        sample_weights = compute_sample_weight(class_weight="balanced", y=y_train_bin)
        classifier = GradientBoostingClassifier(n_estimators=200, random_state=42)
        classifier.fit(X_train, y_train_bin, sample_weight=sample_weights)

        probs = classifier.predict_proba(X_test)[:, 1]
        class_preds = (probs >= 0.5).astype(int)

        nonzero_mask = y_train > 0
        regressor = GradientBoostingRegressor(n_estimators=200, random_state=42)
        regressor.fit(X_train[nonzero_mask], y_train[nonzero_mask])

        reg_preds = regressor.predict(X_test).clip(min=0)
        final_preds = class_preds * reg_preds

        mae = mean_absolute_error(y_test, final_preds)
        f1 = f1_score(y_test_bin, class_preds, zero_division=0)
        recall = recall_score(y_test_bin, class_preds, zero_division=0)
        precision = precision_score(y_test_bin, class_preds, zero_division=0)

        fold_results.append({"fold": fold_num, "mae": mae, "f1": f1, "recall": recall, "precision": precision})
        print(f"Fold {fold_num}: MAE={mae:.4f}, F1={f1:.4f}, Recall={recall:.4f}, Precision={precision:.4f}")

    if fold_results:
        avg_mae = np.mean([r["mae"] for r in fold_results])
        avg_f1 = np.mean([r["f1"] for r in fold_results])
        avg_recall = np.mean([r["recall"] for r in fold_results])
        avg_precision = np.mean([r["precision"] for r in fold_results])

        print(f"\n--- Average across {len(fold_results)} valid folds ---")
        print(f"Average MAE: {avg_mae:.4f}")
        print(f"Average F1: {avg_f1:.4f}")
        print(f"Average Recall: {avg_recall:.4f}")
        print(f"Average Precision: {avg_precision:.4f}")
    else:
        print("No valid folds found - all test folds had 0% nonzero demand.")

if __name__ == "__main__":
    run_cross_validation(n_splits=5)