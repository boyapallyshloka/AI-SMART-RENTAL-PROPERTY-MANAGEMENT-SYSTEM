from pathlib import Path
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR.parent / "data"

DATA_PATH = DATA_DIR / "ml" / "M2_Property_Recommendation.csv"
TENANT_PREFERENCES_PATH = DATA_DIR / "tenant_preferences.csv"
PROPERTIES_PATH = DATA_DIR / "properties_enriched.csv"
PROPERTY_AMENITIES_PATH = DATA_DIR / "property_amenities.csv"


def load_data():
    """Load the M2 recommendation dataset."""
    return pd.read_csv(DATA_PATH)


def load_tenant_preferences():
    """Load tenant preference data."""
    return pd.read_csv(TENANT_PREFERENCES_PATH)


def load_properties():
    """Load enriched property data."""
    return pd.read_csv(PROPERTIES_PATH)


def load_property_amenities():
    """Load property amenity data."""
    return pd.read_csv(PROPERTY_AMENITIES_PATH)


def get_tenant_preferences(
    tenant_preferences_df,
    tenant_id
):
    """
    Load preferences for the requested tenant.

    The tenant preferences are read from tenant_preferences.csv
    instead of being hard-coded in the recommendation code.
    """

    tenant_id = str(tenant_id).strip()

    tenant_preferences_df = tenant_preferences_df.copy()

    tenant_preferences_df["tenant_id"] = (
        tenant_preferences_df["tenant_id"]
        .astype(str)
        .str.strip()
    )

    tenant_row = tenant_preferences_df[
        tenant_preferences_df["tenant_id"] == tenant_id
    ]

    if tenant_row.empty:
        raise ValueError(
            f"No preferences found for tenant_id: {tenant_id}"
        )

    if len(tenant_row) > 1:
        raise ValueError(
            f"Multiple preference records found for tenant_id: {tenant_id}"
        )

    row = tenant_row.iloc[0]

    return {
        "tenant_id": row["tenant_id"],
        "preferred_city": row["preferred_city"],
        "preferred_property_type": row["preferred_property_type"],
        "min_bedrooms": int(row["min_bedrooms"]),
        "max_budget": float(row["max_budget"]),
        "preferred_furnishing": row["preferred_furnishing"],
        "parking_required": row["parking_required"],
        "amenity_preference": row["amenity_preference"],
        "max_commute_distance_km": float(
            row["max_commute_distance_km"]
        )
    }

def normalize_text(value):
    """Normalize text values for reliable comparison."""
    if pd.isna(value):
        return ""

    return str(value).strip().upper()

REQUIRED_M2_COLUMNS = {
    "tenant_id",
    "property_id",
    "preferred_city",
    "property_city",
    "max_budget",
    "monthly_rent",
    "min_bedrooms",
    "property_bedrooms",
    "approx_distance_km",
}

REQUIRED_TENANT_COLUMNS = {
    "tenant_id",
    "preferred_city",
    "preferred_property_type",
    "min_bedrooms",
    "max_budget",
    "preferred_furnishing",
    "parking_required",
    "amenity_preference",
    "max_commute_distance_km",
}

REQUIRED_PROPERTY_COLUMNS = {
    "property_id",
    "property_type",
    "furnishing_status",
    "parking_available",
}

REQUIRED_AMENITY_COLUMNS = {
    "property_id",
    "amenity",
}


def validate_required_columns(df, required_columns, dataset_name):
    """Validate that all required columns are present."""

    missing_columns = required_columns - set(df.columns)

    if missing_columns:
        raise ValueError(
            f"{dataset_name} is missing required columns: "
            f"{sorted(missing_columns)}"
        )


def validate_m2_data(
    df,
    tenant_preferences,
    properties,
    property_amenities,
):
    """
    Validate all M2 datasets before filtering and scoring.
    """

    # ---------------------------------------------------------
    # 1. Dataset must not be empty
    # ---------------------------------------------------------

    if df.empty:
        raise ValueError("M2 recommendation dataset is empty.")

    if tenant_preferences.empty:
        raise ValueError("Tenant preferences dataset is empty.")

    if properties.empty:
        raise ValueError("Property dataset is empty.")

    if property_amenities.empty:
        raise ValueError("Property amenities dataset is empty.")

    # ---------------------------------------------------------
    # 2. Required column checks
    # ---------------------------------------------------------

    validate_required_columns(
        df,
        REQUIRED_M2_COLUMNS,
        "M2 dataset",
    )

    validate_required_columns(
        tenant_preferences,
        REQUIRED_TENANT_COLUMNS,
        "Tenant preferences",
    )

    validate_required_columns(
        properties,
        REQUIRED_PROPERTY_COLUMNS,
        "Property dataset",
    )

    validate_required_columns(
        property_amenities,
        REQUIRED_AMENITY_COLUMNS,
        "Property amenities",
    )

    # ---------------------------------------------------------
    # 3. Required key columns must not contain nulls
    # ---------------------------------------------------------

    for dataset_name, dataset, column in [
        ("M2 dataset", df, "tenant_id"),
        ("M2 dataset", df, "property_id"),
        ("Tenant preferences", tenant_preferences, "tenant_id"),
        ("Property dataset", properties, "property_id"),
        ("Property amenities", property_amenities, "property_id"),
    ]:
        if dataset[column].isna().any():
            raise ValueError(
                f"{dataset_name} contains null values in "
                f"required key column '{column}'."
            )

    # ---------------------------------------------------------
    # 4. Property master must have unique property IDs
    # ---------------------------------------------------------

    duplicate_property_ids = properties[
        properties["property_id"].duplicated(keep=False)
    ]

    if not duplicate_property_ids.empty:
        duplicate_ids = (
            duplicate_property_ids["property_id"]
            .drop_duplicates()
            .tolist()
        )

        raise ValueError(
            "Duplicate property_id values found in "
            f"property dataset: {duplicate_ids[:10]}"
        )

    # ---------------------------------------------------------
    # 5. M2 tenant + property combination must be unique
    # ---------------------------------------------------------

    duplicate_pairs = df[
        df.duplicated(
            subset=["tenant_id", "property_id"],
            keep=False,
        )
    ]

    if not duplicate_pairs.empty:
        raise ValueError(
            "Duplicate tenant_id + property_id records "
            "found in M2 dataset."
        )

    # ---------------------------------------------------------
    # 6. Every M2 property must exist in property master
    # ---------------------------------------------------------

    m2_property_ids = set(
        df["property_id"].dropna()
    )

    property_ids = set(
        properties["property_id"].dropna()
    )

    unmatched_properties = (
        m2_property_ids - property_ids
    )

    if unmatched_properties:
        raise ValueError(
            f"{len(unmatched_properties)} property IDs "
            "from M2 dataset were not found in "
            "property dataset. "
            f"Examples: {list(unmatched_properties)[:10]}"
        )

    # ---------------------------------------------------------
    # 7. Every M2 tenant must exist in preferences
    # ---------------------------------------------------------

    m2_tenant_ids = set(
        df["tenant_id"].dropna()
    )

    preference_tenant_ids = set(
        tenant_preferences["tenant_id"].dropna()
    )

    unmatched_tenants = (
        m2_tenant_ids - preference_tenant_ids
    )

    if unmatched_tenants:
        raise ValueError(
            f"{len(unmatched_tenants)} tenant IDs "
            "from M2 dataset were not found in "
            "tenant_preferences.csv. "
            f"Examples: {list(unmatched_tenants)[:10]}"
        )

    # ---------------------------------------------------------
    # 8. Every amenity property must exist in property master
    # ---------------------------------------------------------

    amenity_property_ids = set(
        property_amenities["property_id"].dropna()
    )

    orphan_amenity_properties = (
        amenity_property_ids - property_ids
    )

    if orphan_amenity_properties:
        raise ValueError(
            f"{len(orphan_amenity_properties)} property IDs "
            "in property_amenities.csv do not exist in "
            "the property dataset. "
            f"Examples: "
            f"{list(orphan_amenity_properties)[:10]}"
        )

    # ---------------------------------------------------------
    # 9. Numeric sanity checks
    # ---------------------------------------------------------

    if (df["max_budget"] <= 0).any():
        raise ValueError(
            "M2 dataset contains max_budget values <= 0."
        )

    if (df["monthly_rent"] <= 0).any():
        raise ValueError(
            "M2 dataset contains monthly_rent values <= 0."
        )

    if (df["min_bedrooms"] < 0).any():
        raise ValueError(
            "M2 dataset contains negative min_bedrooms."
        )

    if (df["property_bedrooms"] < 0).any():
        raise ValueError(
            "M2 dataset contains negative property_bedrooms."
        )

    if (df["approx_distance_km"] < 0).any():
        raise ValueError(
            "M2 dataset contains negative approx_distance_km."
        )

    print("M2 startup validation passed.")
def calculate_city_match(df, preferences):
    """Calculate city match."""
    preferred_city = normalize_text(preferences["preferred_city"])

    df["city_match"] = (
        df["property_city"]
        .apply(normalize_text)
        .eq(preferred_city)
        .astype(int)
    )

    return df


def calculate_budget_match(df, preferences):
    """
    Calculate budget match.

    A property is considered a budget match when its monthly
    rent is within the tenant's maximum budget.
    """
    max_budget = float(preferences["max_budget"])

    df["budget_match"] = (
        df["monthly_rent"] <= max_budget
    ).astype(int)

    return df


def calculate_budget_gap(df, preferences):
    """
    Calculate the difference between tenant budget and
    property monthly rent.

    Positive value  -> property is below budget.
    Zero            -> property equals budget.
    Negative value  -> property is above budget.
    """
    max_budget = float(preferences["max_budget"])

    df["budget_gap"] = (
        max_budget - df["monthly_rent"]
    )

    return df


def calculate_bedroom_match(df, preferences):
    """
    Calculate bedroom match.

    A property matches when it provides at least the
    minimum number of bedrooms requested by the tenant.
    """
    min_bedrooms = int(preferences["min_bedrooms"])

    df["bedroom_match"] = (
        df["property_bedrooms"] >= min_bedrooms
    ).astype(int)

    return df


def calculate_property_type_match(df, properties, preferences):
    """Calculate property type match using property data."""

    preferred_property_type = normalize_text(
        preferences["preferred_property_type"]
    )

    property_type_lookup = (
        properties[
            ["property_id", "property_type"]
        ]
        .drop_duplicates("property_id")
        .set_index("property_id")["property_type"]
        .map(normalize_text)
    )

    df["property_type"] = (
        df["property_id"]
        .map(property_type_lookup)
    )

    df["property_type_match"] = (
        df["property_type"] == preferred_property_type
    ).astype(int)

    return df


def calculate_furnishing_match(df, properties, preferences):
    """Calculate furnishing preference match."""

    preferred_furnishing = normalize_text(
        preferences["preferred_furnishing"]
    )

    furnishing_lookup = (
        properties[
            ["property_id", "furnishing_status"]
        ]
        .drop_duplicates("property_id")
        .set_index("property_id")["furnishing_status"]
        .map(normalize_text)
    )

    df["furnishing_status"] = (
        df["property_id"]
        .map(furnishing_lookup)
    )

    df["furnishing_match"] = (
        df["furnishing_status"] == preferred_furnishing
    ).astype(int)

    return df


def normalize_parking_required(value):
    """
    Normalize tenant parking_required preference into a boolean.

    Truth-like values: True, "True", 1 (also "yes", "y", "required") -> True
    Falsy-like values: False, "False", 0 -> False
    """
    if pd.isna(value):
        return False

    if isinstance(value, str):
        return value.strip().lower() in {
            "true",
            "1",
            "yes",
            "y",
            "required",
        }

    return bool(value)


def calculate_parking_match(df, properties, preferences):
    """
    Calculate parking match.

    If parking is required, the property must have parking.
    If parking is not required, the property receives a match
    because parking is not a mandatory preference.
    """

    parking_required = normalize_parking_required(
        preferences["parking_required"]
    )

    parking_lookup = (
        properties[
            ["property_id", "parking_available"]
        ]
        .drop_duplicates("property_id")
        .set_index("property_id")["parking_available"]
    )

    df["parking_available"] = (
        df["property_id"]
        .map(parking_lookup)
    )

    if parking_required:
        df["parking_match"] = (
            df["parking_available"]
            .fillna(False)
            .astype(bool)
            .astype(int)
        )
    else:
        df["parking_match"] = 1

    return df


def calculate_amenity_match(
    df,
    property_amenities,
    preferences,
):
    """
    Calculate amenity match.

    The current tenant preference schema contains one
    amenity_preference per tenant, so this is a binary
    match rather than a multi-amenity fraction.
    """

    preferred_amenity = normalize_text(
        preferences["amenity_preference"]
    )

    amenity_lookup = (
        property_amenities.assign(
            amenity_normalized=
            property_amenities["amenity"].map(normalize_text)
        )
        .groupby("property_id")["amenity_normalized"]
        .apply(set)
    )

    def has_preferred_amenity(property_id):
        amenities = amenity_lookup.get(property_id, set())
        return int(preferred_amenity in amenities)

    df["amenity_match"] = (
        df["property_id"]
        .apply(has_preferred_amenity)
    )

    return df


def calculate_distance_match(df, preferences):
    """
    Calculate commute-distance match.

    A property matches when its approximate distance is
    within the tenant's maximum acceptable commute distance.
    """

    max_distance = float(
        preferences["max_commute_distance_km"]
    )

    df["distance_match"] = (
        df["approx_distance_km"] <= max_distance
    ).astype(int)

    return df


def calculate_all_match_features(
    df,
    properties,
    property_amenities,
    preferences,
):
    """
    Calculate all M2 match features from tenant preferences
    and property data.
    """

    df = df.copy()

    df = calculate_city_match(
        df,
        preferences,
    )

    df = calculate_budget_gap(
        df,
        preferences,
    )

    df = calculate_budget_match(
        df,
        preferences,
    )

    df = calculate_bedroom_match(
        df,
        preferences,
    )

    df = calculate_property_type_match(
        df,
        properties,
        preferences,
    )

    df = calculate_furnishing_match(
        df,
        properties,
        preferences,
    )

    df = calculate_parking_match(
        df,
        properties,
        preferences,
    )

    df = calculate_amenity_match(
        df,
        property_amenities,
        preferences,
    )

    df = calculate_distance_match(
        df,
        preferences,
    )

    return df


def calculate_recommendation_score(df):
    """
    Calculate the final M2 recommendation score.

    Weights:
        City Match       : 25%
        Budget Fit       : 25%
        Bedroom Match    : 15%
        Property Type    : 10%
        Furnishing       : 10%
        Amenity Match    : 10%
        Parking Match    : 5%

    Total               : 100%
    """

    df = df.copy()

    # Budget fit is continuous rather than binary.
    #
    # At or below budget -> 1.0
    # Above budget       -> proportionally lower
    #
    # Example:
    # budget = 20,000
    # rent   = 21,000
    # budget_score = 20,000 / 21,000
    df["budget_score"] = (
        df["max_budget"] / df["monthly_rent"]
    ).clip(upper=1.0)

    df["recommendation_score"] = (
        0.25 * df["city_match"]
        + 0.25 * df["budget_score"]
        + 0.15 * df["bedroom_match"]
        + 0.10 * df["property_type_match"]
        + 0.10 * df["furnishing_match"]
        + 0.10 * df["amenity_match"]
        + 0.05 * df["parking_match"]
    ) * 100

    df["recommendation_score"] = (
        df["recommendation_score"]
        .round(2)
    )

    return df


def filter_properties(df, preferences):
    """
    Apply basic eligibility filtering.

    A 5% budget tolerance is allowed.

    Note:
    Match columns are calculated separately before scoring.
    """
    df = df[df["tenant_id"] == preferences["tenant_id"]].copy()

    budget_limit = (
        float(preferences["max_budget"]) * 1.05
    )

    preferred_city = normalize_text(
        preferences["preferred_city"]
    )

    filtered_df = df[
        (
            df["property_city"]
            .apply(normalize_text)
            == preferred_city
        )
        & (
            df["property_bedrooms"]
            >= int(preferences["min_bedrooms"])
        )
        & (
            df["monthly_rent"]
            <= budget_limit
        )
    ].copy()

    return filtered_df


def rank_properties(df):
    """
    Rank properties using recommendation score and
    deterministic tie-breaking.
    """

    ranked_df = df.sort_values(
        by=[
            "recommendation_score",
            "city_match",
            "budget_gap",
            "approx_distance_km",
            "property_id",
        ],
        ascending=[
            False,
            False,
            False,
            True,
            True,
        ],
    ).copy()

    return ranked_df


def get_top_recommendations(
    df,
    top_n=5,
):
    """Return the top N ranked properties."""

    return df.head(top_n).copy()


def recommend_properties(
    df,
    properties,
    property_amenities,
    preferences,
    top_n=5,
):
    """
    Execute the complete M2 recommendation pipeline.

    Steps:
        1. Filter eligible properties
        2. Calculate all match features
        3. Calculate recommendation score
        4. Rank properties
        5. Return Top-N
    """

    filtered_df = filter_properties(
        df,
        preferences,
    )

    if filtered_df.empty:
        return filtered_df

    scored_df = calculate_all_match_features(
        filtered_df,
        properties,
        property_amenities,
        preferences,
    )

    scored_df = calculate_recommendation_score(
        scored_df
    )

    ranked_df = rank_properties(
        scored_df
    )

    return get_top_recommendations(
        ranked_df,
        top_n,
    )


if __name__ == "__main__":

    # ---------------------------------------------------------
    # Load datasets
    # ---------------------------------------------------------

    df = load_data()
    tenant_preferences_df = load_tenant_preferences()
    properties = load_properties()
    property_amenities = load_property_amenities()

    # ---------------------------------------------------------
    # Validate datasets before any filtering or scoring
    # ---------------------------------------------------------

    validate_m2_data(
        df,
        tenant_preferences_df,
        properties,
        property_amenities,
    )

    # ---------------------------------------------------------
    # Requested tenant
    # ---------------------------------------------------------

    tenant_id = "T00888"

    # Load the actual preferences for the requested tenant
    preferences = get_tenant_preferences(
        tenant_preferences_df,
        tenant_id,
    )

    # ---------------------------------------------------------
    # Display tenant preferences
    # ---------------------------------------------------------

    print("\nTenant preferences:")

    for key, value in preferences.items():
        print(f"{key}: {value}")

    # ---------------------------------------------------------
    # Generate recommendations
    # ---------------------------------------------------------

    recommendations = recommend_properties(
        df=df,
        properties=properties,
        property_amenities=property_amenities,
        preferences=preferences,
        top_n=5,
    )

    # ---------------------------------------------------------
    # Dataset information
    # ---------------------------------------------------------

    print("\nM2 dataset loaded successfully.")
    print("Rows:", len(df))
    print("Columns:", len(df.columns))

    # ---------------------------------------------------------
    # Recommendation results
    # ---------------------------------------------------------

    print("\nMatching properties:", len(recommendations))

    print("\nTop 5 recommendations:")

    if recommendations.empty:
        print("No matching properties found.")

    else:

        display_columns = [
            "tenant_id",
            "property_id",
            "property_city",
            "monthly_rent",
            "property_bedrooms",
            "city_match",
            "budget_match",
            "bedroom_match",
            "property_type_match",
            "furnishing_match",
            "parking_match",
            "amenity_match",
            "distance_match",
            "recommendation_score",
        ]

        available_columns = [
            column
            for column in display_columns
            if column in recommendations.columns
        ]

        print(
            recommendations[available_columns]
            .to_string(index=False)
        )