import pandas as pd


INPUT_PATH = "../data/ml/M2_Property_Recommendation.csv"
OUTPUT_PATH = "../data/ml/M2_Property_Recommendation_scored.csv"


def calculate_budget_score(df):
    """
    Calculate budget fit on a 0-1 scale.

    A property at or below the tenant's maximum budget
    receives a score of 1.
    """

    budget_score = (
        df["max_budget"] / df["monthly_rent"]
    ).clip(upper=1.0)

    return budget_score


def calculate_recommendation_score(df):
    """
    Calculate the M2 recommendation score.

    Weights:
        City              25%
        Budget            25%
        Bedrooms          15%
        Property Type     10%
        Furnishing        10%
        Amenities         10%
        Parking            5%
    """

    df = df.copy()

    df["budget_score"] = calculate_budget_score(df)

    df["recommendation_score"] = (
        0.25 * df["city_match"]
        + 0.25 * df["budget_score"]
        + 0.15 * df["bedroom_match"]
        + 0.10 * df["property_type_match"]
        + 0.10 * df["furnishing_match"]
        + 0.10 * df["amenity_match"]
        + 0.05 * df["parking_match"]
    )

    df["recommendation_score"] = (
        df["recommendation_score"] * 100
    ).round(2)

    return df


def rank_properties(df):
    """
    Rank properties using deterministic tie-breaking.

    Primary:
        recommendation_score DESC

    Tie-breakers:
        city_match DESC
        budget_gap ASC
        approx_distance_km ASC
        property_id ASC
    """

    ranked_df = df.sort_values(
        by=[
            "recommendation_score",
            "city_match",
            "budget_gap",
            "approx_distance_km",
            "property_id"
        ],
        ascending=[
            False,
            False,
            True,
            True,
            True
        ]
    ).copy()

    return ranked_df


if __name__ == "__main__":

    df = pd.read_csv(INPUT_PATH)

    print("M2 dataset loaded successfully.")
    print("Rows:", len(df))
    print("Columns:", len(df.columns))

    scored_df = calculate_recommendation_score(df)

    ranked_df = rank_properties(scored_df)

    ranked_df.to_csv(
        OUTPUT_PATH,
        index=False
    )

    print("\nRecommendation ranking created successfully.")
    print("Rows:", len(ranked_df))
    print("Output:", OUTPUT_PATH)

    print("\nTop 20 properties:")

    print(
        ranked_df[
            [
                "tenant_id",
                "property_id",
                "recommendation_score",
                "city_match",
                "budget_score",
                "bedroom_match",
                "property_type_match",
                "furnishing_match",
                "amenity_match",
                "parking_match",
                "budget_gap",
                "approx_distance_km"
            ]
        ]
        .head(20)
        .to_string(index=False)
    )