import pandas as pd


INPUT_PATH = "../data/ml/M2_Property_Recommendation_scored.csv"


df = pd.read_csv(INPUT_PATH)


print("M2 ranking analysis")
print("=" * 50)

print("\nTotal rows:", len(df))
print("Unique tenants:", df["tenant_id"].nunique())
print("Unique properties:", df["property_id"].nunique())


# ---------------------------------------------------------
# 1. Unique recommendation scores
# ---------------------------------------------------------

unique_scores = df["recommendation_score"].nunique()

print("\nUnique recommendation scores:", unique_scores)

print(
    "Percentage of unique scores:",
    round(unique_scores / len(df) * 100, 2),
    "%"
)


# ---------------------------------------------------------
# 2. Score distribution
# ---------------------------------------------------------

print("\nTop score frequencies:")
print(
    df["recommendation_score"]
    .value_counts()
    .head(20)
    .to_string()
)


# ---------------------------------------------------------
# 3. Perfect-score properties
# ---------------------------------------------------------

perfect_count = (df["recommendation_score"] == 100).sum()

print("\nProperties with 100% score:", perfect_count)

print(
    "Percentage with 100% score:",
    round(perfect_count / len(df) * 100, 2),
    "%"
)


# ---------------------------------------------------------
# 4. Budget score distribution
# ---------------------------------------------------------

print("\nBudget score distribution:")
print(
    df["budget_score"]
    .describe()
    .to_string()
)


print("\nNumber of unique budget scores:")
print(df["budget_score"].nunique())


# ---------------------------------------------------------
# 5. Check whether city_match is constant
# ---------------------------------------------------------

print("\nCity match distribution:")
print(
    df["city_match"]
    .value_counts()
    .sort_index()
    .to_string()
)


# ---------------------------------------------------------
# 6. Check binary feature combinations
# ---------------------------------------------------------

feature_columns = [
    "city_match",
    "bedroom_match",
    "property_type_match",
    "furnishing_match",
    "amenity_match",
    "parking_match"
]

combination_counts = (
    df.groupby(feature_columns)
    .size()
    .sort_values(ascending=False)
)

print("\nMost common feature combinations:")
print(
    combination_counts.head(15).to_string()
)


# ---------------------------------------------------------
# 7. Perfect-match combination
# ---------------------------------------------------------

perfect_features = df[
    (df["city_match"] == 1)
    & (df["bedroom_match"] == 1)
    & (df["property_type_match"] == 1)
    & (df["furnishing_match"] == 1)
    & (df["amenity_match"] == 1)
    & (df["parking_match"] == 1)
]

print(
    "\nRows matching all binary preference features:",
    len(perfect_features)
)


# ---------------------------------------------------------
# 8. Per-tenant tie analysis
# ---------------------------------------------------------

score_counts_per_tenant = (
    df.groupby(["tenant_id", "recommendation_score"])
    .size()
    .reset_index(name="count")
)

tie_groups = score_counts_per_tenant[
    score_counts_per_tenant["count"] > 1
]

print(
    "\nTenant-score groups containing ties:",
    len(tie_groups)
)


if len(tie_groups) > 0:

    print("\nLargest tie groups:")
    print(
        tie_groups
        .sort_values("count", ascending=False)
        .head(20)
        .to_string(index=False)
    )


# ---------------------------------------------------------
# 9. Final summary
# ---------------------------------------------------------

print("\n" + "=" * 50)
print("Analysis completed.")