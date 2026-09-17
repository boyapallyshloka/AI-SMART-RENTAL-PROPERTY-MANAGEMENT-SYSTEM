import pandas as pd

m2_path = "../data/ml/M2_Property_Recommendation.csv"
tenant_path = "../data/tenant_preferences.csv"
property_path = "../data/properties_enriched.csv"

m2 = pd.read_csv(m2_path)
tenants = pd.read_csv(tenant_path)
properties = pd.read_csv(property_path)

# Get tenant property-type preference
tenant_type = tenants[
    ["tenant_id", "preferred_property_type"]
]

# Get actual property type
property_type = properties[
    ["property_id", "property_type"]
]

# Add tenant preference
m2 = m2.drop(
    columns=["property_type_match"],
    errors="ignore"
)

m2 = m2.merge(
    tenant_type,
    on="tenant_id",
    how="left",
    validate="many_to_one"
)

m2 = m2.merge(
    property_type,
    on="property_id",
    how="left",
    validate="many_to_one"
)

# Create property type match
m2["property_type_match"] = (
    m2["preferred_property_type"].str.strip().str.upper()
    ==
    m2["property_type"].str.strip().str.upper()
).astype(int)

# Remove temporary source columns
m2 = m2.drop(
    columns=[
        "preferred_property_type",
        "property_type"
    ]
)

# Save updated M2 dataset
m2.to_csv(
    m2_path,
    index=False
)

print("Updated M2 dataset successfully.")
print("Rows:", len(m2))
print("\nproperty_type_match distribution:")
print(m2["property_type_match"].value_counts().sort_index())
print("\nColumns:")
print(m2.columns.tolist())