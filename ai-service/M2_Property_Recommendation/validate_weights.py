"""
M2 Recommendation Weight Validation

Purpose
-------
Compare M2 recommendation weight sets using the FULL eligible property pool.

Validation flow
---------------
1. Load tenant preferences, property master, and property amenities.
2. Apply the same hard eligibility rules for every weight set:
   - Preferred city must match.
   - Property bedrooms >= minimum bedrooms.
   - Monthly rent <= max_budget * 1.05.
3. Calculate soft preference features.
4. Rank the COMPLETE eligible pool independently for each weight set.
5. Evaluate:
   - Top-1 preference alignment
   - Top-5 preference alignment
   - MRR
   - NDCG@5
   - Budget match
   - Property-type match
   - Furnishing match
   - Amenity match
   - Parking match

Important
---------
This is preference-alignment validation, not ML accuracy validation.
There is no real user-click/bookmark/lease relevance label in the current data.
"""

from pathlib import Path

import numpy as np
import pandas as pd


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
AI_SERVICE_DIR = BASE_DIR.parent
DATA_DIR = AI_SERVICE_DIR / "data"

TENANT_PREFERENCES_PATH = DATA_DIR / "tenant_preferences.csv"
PROPERTIES_PATH = DATA_DIR / "properties_enriched.csv"
PROPERTY_AMENITIES_PATH = DATA_DIR / "property_amenities.csv"


# ============================================================
# VALIDATION CONFIGURATION
# ============================================================

BUDGET_TOLERANCE = 0.05
TOP_K = 5


# ============================================================
# WEIGHT SETS
# ============================================================

WEIGHT_SETS = {
    "Set A - Current": {
        "city": 0.25,
        "budget": 0.25,
        "bedroom": 0.15,
        "property_type": 0.10,
        "furnishing": 0.10,
        "amenity": 0.10,
        "parking": 0.05,
    },
    "Set B - City/Budget Focused": {
        "city": 0.30,
        "budget": 0.30,
        "bedroom": 0.15,
        "property_type": 0.05,
        "furnishing": 0.05,
        "amenity": 0.05,
        "parking": 0.05,
    },
    "Set C - Preference Focused": {
        "city": 0.15,
        "budget": 0.15,
        "bedroom": 0.15,
        "property_type": 0.20,
        "furnishing": 0.15,
        "amenity": 0.15,
        "parking": 0.05,
    },
}


# ============================================================
# HELPERS
# ============================================================

def normalize_text(value):
    """Normalize text for reliable comparisons."""
    if pd.isna(value):
        return ""

    return (
        str(value)
        .strip()
        .lower()
        .replace("_", " ")
        .replace("-", " ")
    )


def normalize_bool(value):
    """Safely convert CSV boolean-like values to bool."""
    if pd.isna(value):
        return False

    if isinstance(value, bool):
        return value

    return str(value).strip().lower() in {
        "true",
        "1",
        "yes",
        "y",
        "required",
    }


def calculate_furnishing_match(preferred, actual):
    """
    Match tenant furnishing preference against property furnishing status.
    """
    preferred = normalize_text(preferred)
    actual = normalize_text(actual)

    mapping = {
        "fully furnished": "furnished",
        "furnished": "furnished",
        "semi furnished": "semi furnished",
        "unfurnished": "unfurnished",
    }

    return int(mapping.get(preferred, preferred) == actual)


def dcg(relevances):
    """Calculate Discounted Cumulative Gain."""
    if not relevances:
        return 0.0

    return sum(
        relevance / np.log2(index + 2)
        for index, relevance in enumerate(relevances)
    )


def ndcg_at_k(relevances, k=5):
    """
    Calculate NDCG@K.

    Relevance is graded:
        4 = all four soft preferences match
        3 = three match
        2 = two match
        1 = one match
        0 = none match
    """
    actual = list(relevances[:k])

    if not actual:
        return 0.0

    ideal = sorted(actual, reverse=True)

    ideal_dcg = dcg(ideal)

    if ideal_dcg == 0:
        return 0.0

    return dcg(actual) / ideal_dcg


def reciprocal_rank(relevances, relevant_threshold=3):
    """
    Calculate Reciprocal Rank.

    A property is considered relevant when it satisfies
    at least 3 of the 4 soft preferences:
        property type
        furnishing
        amenity
        parking
    """
    for index, relevance in enumerate(relevances, start=1):
        if relevance >= relevant_threshold:
            return 1.0 / index

    return 0.0


# ============================================================
# LOAD DATA
# ============================================================

def load_data():
    print("Loading source data...")

    tenants = pd.read_csv(TENANT_PREFERENCES_PATH)
    properties = pd.read_csv(PROPERTIES_PATH)
    amenities = pd.read_csv(PROPERTY_AMENITIES_PATH)

    print(f"Tenant preferences: {len(tenants):,} rows")
    print(f"Properties: {len(properties):,} rows")
    print(f"Property amenities: {len(amenities):,} rows")

    return tenants, properties, amenities


# ============================================================
# AMENITY LOOKUP
# ============================================================

def build_amenity_lookup(amenities):
    """
    Create:
        property_id -> set of normalized amenities
    """
    lookup = {}

    for row in amenities.itertuples(index=False):
        property_id = str(row.property_id)

        lookup.setdefault(property_id, set()).add(
            normalize_text(row.amenity)
        )

    return lookup


# ============================================================
# BUILD FULL ELIGIBLE POOL
# ============================================================

def build_full_eligible_pool(tenants, properties, amenities):
    """
    Build the complete eligible property pool.

    IMPORTANT:
    No existing M2 recommendation CSV is used here.

    Every tenant gets every property satisfying the hard filters.
    """

    print("\nBuilding FULL eligible property pool...")

    property_df = properties.copy()

    property_df["_city_norm"] = property_df["city"].apply(normalize_text)

    property_df["monthly_rent"] = pd.to_numeric(
        property_df["monthly_rent"],
        errors="coerce",
    )

    property_df["bedrooms_bhk"] = pd.to_numeric(
        property_df["bedrooms_bhk"],
        errors="coerce",
    )

    amenity_lookup = build_amenity_lookup(amenities)

    all_tenant_pools = []

    for tenant in tenants.itertuples(index=False):

        tenant_id = str(tenant.tenant_id)

        preferred_city = normalize_text(tenant.preferred_city)

        min_bedrooms = int(tenant.min_bedrooms)

        max_budget = float(tenant.max_budget)

        budget_limit = max_budget * (1 + BUDGET_TOLERANCE)

        # ----------------------------------------------------
        # HARD FILTERS
        # ----------------------------------------------------

        eligible = property_df[
            (property_df["_city_norm"] == preferred_city)
            & (property_df["bedrooms_bhk"] >= min_bedrooms)
            & (property_df["monthly_rent"] <= budget_limit)
        ].copy()

        if eligible.empty:
            continue

        # ----------------------------------------------------
        # TENANT DATA
        # ----------------------------------------------------

        eligible["tenant_id"] = tenant_id

        eligible["preferred_city"] = tenant.preferred_city
        eligible["max_budget"] = max_budget
        eligible["min_bedrooms"] = min_bedrooms

        eligible["preferred_property_type"] = (
            tenant.preferred_property_type
        )

        eligible["preferred_furnishing"] = (
            tenant.preferred_furnishing
        )

        eligible["parking_required"] = normalize_bool(
            tenant.parking_required
        )

        eligible["amenity_preference"] = (
            tenant.amenity_preference
        )

        # ----------------------------------------------------
        # HARD-FILTER FEATURES
        # ----------------------------------------------------

        eligible["city_match"] = 1

        eligible["bedroom_match"] = (
            eligible["bedrooms_bhk"] >= min_bedrooms
        ).astype(int)

        eligible["budget_match"] = (
            eligible["monthly_rent"] <= max_budget
        ).astype(int)

        eligible["budget_score"] = (
            max_budget / eligible["monthly_rent"]
        ).clip(upper=1.0)

        # ----------------------------------------------------
        # PROPERTY TYPE
        # ----------------------------------------------------

        preferred_type = normalize_text(
            tenant.preferred_property_type
        )

        eligible["property_type_match"] = (
            eligible["property_type"]
            .apply(normalize_text)
            == preferred_type
        ).astype(int)

        # ----------------------------------------------------
        # FURNISHING
        # ----------------------------------------------------

        eligible["furnishing_match"] = [
            calculate_furnishing_match(
                tenant.preferred_furnishing,
                actual,
            )
            for actual in eligible["furnishing_status"]
        ]

        # ----------------------------------------------------
        # PARKING
        # ----------------------------------------------------

        property_parking = eligible["parking_available"].apply(
            normalize_bool
        )

        if normalize_bool(tenant.parking_required):
            eligible["parking_match"] = property_parking.astype(int)
        else:
            eligible["parking_match"] = 1

        # ----------------------------------------------------
        # AMENITY
        # ----------------------------------------------------

        preferred_amenity = normalize_text(
            tenant.amenity_preference
        )

        eligible["amenity_match"] = [
            int(
                preferred_amenity in amenity_lookup.get(
                    str(property_id),
                    set(),
                )
            )
            for property_id in eligible["property_id"]
        ]

        # ----------------------------------------------------
        # SOFT PREFERENCE RELEVANCE
        # ----------------------------------------------------

        eligible["soft_preference_relevance"] = (
            eligible["property_type_match"]
            + eligible["furnishing_match"]
            + eligible["amenity_match"]
            + eligible["parking_match"]
        )

        all_tenant_pools.append(eligible)

    if not all_tenant_pools:
        raise RuntimeError(
            "No eligible properties were generated."
        )

    full_pool = pd.concat(
        all_tenant_pools,
        ignore_index=True,
    )

    print(
        f"Full eligible pool: {len(full_pool):,} rows"
    )

    print(
        f"Tenants with eligible properties: "
        f"{full_pool['tenant_id'].nunique():,}"
    )

    return full_pool


# ============================================================
# RANK ONE WEIGHT SET
# ============================================================

def rank_with_weights(pool, weights):
    """
    Rank the COMPLETE eligible pool using one weight set.
    """

    df = pool.copy()

    df["recommendation_score"] = (
        weights["city"] * df["city_match"]
        + weights["budget"] * df["budget_score"]
        + weights["bedroom"] * df["bedroom_match"]
        + weights["property_type"] * df["property_type_match"]
        + weights["furnishing"] * df["furnishing_match"]
        + weights["amenity"] * df["amenity_match"]
        + weights["parking"] * df["parking_match"]
    ) * 100

    df = df.sort_values(
        [
            "tenant_id",
            "recommendation_score",
            "budget_match",
            "property_type_match",
            "furnishing_match",
            "amenity_match",
            "parking_match",
            "monthly_rent",
            "property_id",
        ],
        ascending=[
            True,
            False,
            False,
            False,
            False,
            False,
            False,
            True,
            True,
        ],
    )

    return df


# ============================================================
# EVALUATE RANKING
# ============================================================

def evaluate_ranking(ranked_df):
    """
    Calculate ranking metrics from the full ranked pool.
    """

    top1_city = []
    top1_budget = []
    top1_bedroom = []
    top1_type = []
    top1_furnishing = []
    top1_amenity = []
    top1_parking = []

    top5_type = []
    top5_furnishing = []
    top5_amenity = []
    top5_parking = []

    ndcg_scores = []
    reciprocal_ranks = []

    for tenant_id, group in ranked_df.groupby(
        "tenant_id",
        sort=False,
    ):

        top5 = group.head(TOP_K)

        if top5.empty:
            continue

        top1 = top5.iloc[0]

        # ----------------------------------------------------
        # TOP-1 HARD/CORE FEATURES
        # ----------------------------------------------------

        top1_city.append(top1["city_match"])
        top1_budget.append(top1["budget_match"])
        top1_bedroom.append(top1["bedroom_match"])

        # ----------------------------------------------------
        # TOP-1 SOFT PREFERENCES
        # ----------------------------------------------------

        top1_type.append(top1["property_type_match"])
        top1_furnishing.append(top1["furnishing_match"])
        top1_amenity.append(top1["amenity_match"])
        top1_parking.append(top1["parking_match"])

        # ----------------------------------------------------
        # TOP-5 SOFT PREFERENCES
        # ----------------------------------------------------

        top5_type.append(top5["property_type_match"].mean())
        top5_furnishing.append(top5["furnishing_match"].mean())
        top5_amenity.append(top5["amenity_match"].mean())
        top5_parking.append(top5["parking_match"].mean())

        # ----------------------------------------------------
        # NDCG@5
        # ----------------------------------------------------

        relevances = (
            top5["soft_preference_relevance"]
            .astype(float)
            .tolist()
        )

        ndcg_scores.append(
            ndcg_at_k(relevances, TOP_K)
        )

        # ----------------------------------------------------
        # MRR
        # ----------------------------------------------------

        reciprocal_ranks.append(
            reciprocal_rank(relevances)
        )

    # --------------------------------------------------------
    # AGGREGATE
    # --------------------------------------------------------

    top1_preference_match = np.mean(
        [
            np.mean(top1_type),
            np.mean(top1_furnishing),
            np.mean(top1_amenity),
            np.mean(top1_parking),
        ]
    )

    top5_preference_match = np.mean(
        [
            np.mean(top5_type),
            np.mean(top5_furnishing),
            np.mean(top5_amenity),
            np.mean(top5_parking),
        ]
    )

    return {
        "Tenants Evaluated": len(ndcg_scores),

        "Top-1 City Match %":
            np.mean(top1_city) * 100,

        "Top-1 Budget Match %":
            np.mean(top1_budget) * 100,

        "Top-1 Bedroom Match %":
            np.mean(top1_bedroom) * 100,

        "Top-1 Property Type Match %":
            np.mean(top1_type) * 100,

        "Top-1 Furnishing Match %":
            np.mean(top1_furnishing) * 100,

        "Top-1 Amenity Match %":
            np.mean(top1_amenity) * 100,

        "Top-1 Parking Match %":
            np.mean(top1_parking) * 100,

        "Top-1 Preference Match %":
            top1_preference_match * 100,

        "Top-5 Property Type Match %":
            np.mean(top5_type) * 100,

        "Top-5 Furnishing Match %":
            np.mean(top5_furnishing) * 100,

        "Top-5 Amenity Match %":
            np.mean(top5_amenity) * 100,

        "Top-5 Parking Match %":
            np.mean(top5_parking) * 100,

        "Top-5 Preference Match %":
            top5_preference_match * 100,

        "NDCG@5":
            np.mean(ndcg_scores),

        "MRR":
            np.mean(reciprocal_ranks),
    }


# ============================================================
# MAIN
# ============================================================

def main():

    tenants, properties, amenities = load_data()

    full_pool = build_full_eligible_pool(
        tenants,
        properties,
        amenities,
    )

    print("\n" + "=" * 90)
    print("M2 FULL-POOL WEIGHT VALIDATION")
    print("=" * 90)

    results = []

    for name, weights in WEIGHT_SETS.items():

        print(f"\nEvaluating {name}...")

        ranked = rank_with_weights(
            full_pool,
            weights,
        )

        metrics = evaluate_ranking(ranked)

        metrics["Weight Set"] = name

        results.append(metrics)

    results_df = pd.DataFrame(results)

    columns = [
        "Weight Set",
        "Tenants Evaluated",
        "Top-1 Preference Match %",
        "Top-5 Preference Match %",
        "Top-1 Property Type Match %",
        "Top-1 Furnishing Match %",
        "Top-1 Amenity Match %",
        "Top-1 Parking Match %",
        "Top-1 Budget Match %",
        "NDCG@5",
        "MRR",
    ]

    results_df = results_df[columns]

    print("\n")
    print("=" * 90)
    print("RESULTS")
    print("=" * 90)

    print(
        results_df.to_string(
            index=False,
            float_format=lambda x: f"{x:.4f}",
        )
    )

    print("\n")
    print("Validation notes:")
    print(
        f"- Budget tolerance: {BUDGET_TOLERANCE * 100:.0f}%"
    )
    print(
        "- Hard filters are identical for all weight sets."
    )
    print(
        "- Ranking uses the complete eligible property pool."
    )
    print(
        "- NDCG@5 uses graded soft-preference relevance (0-4)."
    )
    print(
        "- MRR considers relevance >= 3 soft preferences."
    )


if __name__ == "__main__":
    main()
