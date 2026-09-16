import pandas as pd

# -----------------------------
# Load data
# -----------------------------
m2 = pd.read_csv("../data/ml/M2_Property_Recommendation.csv")
tenants = pd.read_csv("../data/tenant_preferences.csv")
properties = pd.read_csv("../data/properties_enriched.csv")
amenities = pd.read_csv("../data/property_amenities.csv")


def norm(value):
    return str(value).strip().lower().replace("_", " ").replace("-", " ")


# -----------------------------
# 1. CITY MATCH
# -----------------------------
city = m2[["property_id", "preferred_city", "city_match"]].merge(
    properties[["property_id", "city"]],
    on="property_id",
    how="left",
    validate="many_to_one"
)

expected_city = (
    city["preferred_city"].map(norm)
    == city["city"].map(norm)
).astype(int)

print("CITY MATCH")
print(m2["city_match"].value_counts().sort_index())
print(
    "Consistency:",
    "PASS" if (city["city_match"] == expected_city).all() else "FAIL"
)
print("Mismatches:", (city["city_match"] != expected_city).sum())


# -----------------------------
# 2. PARKING MATCH
# -----------------------------
parking = m2[["tenant_id", "property_id", "parking_match"]].merge(
    tenants[["tenant_id", "parking_required"]],
    on="tenant_id",
    how="left",
    validate="many_to_one"
).merge(
    properties[["property_id", "parking_available"]],
    on="property_id",
    how="left",
    validate="many_to_one"
)

required = parking["parking_required"].astype(str).str.strip().str.lower().isin(
    ["true", "1", "yes", "required"]
)

available = parking["parking_available"].astype(str).str.strip().str.lower().isin(
    ["true", "1", "yes"]
)

expected_parking = ((~required) | available).astype(int)

print("\nPARKING MATCH")
print(m2["parking_match"].value_counts().sort_index())
print(
    "Consistency:",
    "PASS" if (parking["parking_match"] == expected_parking).all() else "FAIL"
)
print("Mismatches:", (parking["parking_match"] != expected_parking).sum())


# -----------------------------
# 3. AMENITY MATCH
# -----------------------------
amenity = m2[["tenant_id", "property_id", "amenity_match"]].merge(
    tenants[["tenant_id", "amenity_preference"]],
    on="tenant_id",
    how="left",
    validate="many_to_one"
)

property_amenities = (
    amenities.assign(
        amenity_normalized=amenities["amenity"].map(norm)
    )
    .groupby("property_id")["amenity_normalized"]
    .agg(set)
)

amenity = amenity.join(
    property_amenities,
    on="property_id"
)

def amenity_expected(row):
    preference = norm(row["amenity_preference"])

    if preference in {"", "none", "no preference", "nan"}:
        return 1

    available = row["amenity_normalized"]

    if not isinstance(available, set):
        return 0

    return int(preference in available)


expected_amenity = amenity.apply(
    amenity_expected,
    axis=1
)

print("\nAMENITY MATCH")
print(m2["amenity_match"].value_counts().sort_index())
print(
    "Consistency:",
    "PASS" if (amenity["amenity_match"] == expected_amenity).all() else "FAIL"
)
print("Mismatches:", (amenity["amenity_match"] != expected_amenity).sum())


# -----------------------------
# SUMMARY
# -----------------------------
print("\nSUMMARY")
print("Rows:", len(m2))
print("City mismatches:", (city["city_match"] != expected_city).sum())
print("Parking mismatches:", (parking["parking_match"] != expected_parking).sum())
print("Amenity mismatches:", (amenity["amenity_match"] != expected_amenity).sum())
