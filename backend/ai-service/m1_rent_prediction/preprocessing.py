import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer

from category_encoders import TargetEncoder


DATA_PATH = "data/House_Rent_Dataset.csv"

CATEGORICAL_COLUMNS = [
    "Area Type",
    "City",
    "Furnishing Status",
    "Tenant Preferred",
    "Point of Contact"
]

NUMERIC_COLUMNS = [
    "BHK",
    "Size",
    "Bathroom",
    "Current Floor",
    "Total Floors",
    "Posted Year",
    "Posted Month"
]


def extract_floor(value):
    if " out of " in value:
        current, total = value.split(" out of ")

        if current == "Ground":
            current = 0
        elif current == "Upper Basement":
            current = -1
        elif current == "Lower Basement":
            current = -2
        else:
            current = int(current)

        return current, int(total)

    if value == "Ground":
        return 0, None

    if value == "Upper Basement":
        return -1, None

    if value == "Lower Basement":
        return -2, None

    return int(value), None


def load_and_prepare_data(data_path=DATA_PATH):
    df = pd.read_csv(data_path)

    df[["Current Floor", "Total Floors"]] = df["Floor"].apply(
        lambda x: pd.Series(extract_floor(x))
    )

    df["Posted On"] = pd.to_datetime(df["Posted On"])

    df["Posted Year"] = df["Posted On"].dt.year
    df["Posted Month"] = df["Posted On"].dt.month

    return df


def split_data(df):
    X = df.drop("Rent", axis=1)
    y = df["Rent"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=X["City"]
    )

    return X_train, X_test, y_train, y_test


def encode_features(X_train, X_test, y_train):
    one_hot_encoder = OneHotEncoder(
        handle_unknown="ignore",
        sparse_output=False
    )

    one_hot_encoder.fit(
        X_train[CATEGORICAL_COLUMNS]
    )

    X_train_encoded = one_hot_encoder.transform(
        X_train[CATEGORICAL_COLUMNS]
    )

    X_test_encoded = one_hot_encoder.transform(
        X_test[CATEGORICAL_COLUMNS]
    )

    locality_encoder = TargetEncoder(
        cols=["Area Locality"]
    )

    locality_encoder.fit(
        X_train[["Area Locality"]],
        y_train
    )

    X_train_locality = locality_encoder.transform(
        X_train[["Area Locality"]]
    )

    X_test_locality = locality_encoder.transform(
        X_test[["Area Locality"]]
    )

    numeric_imputer = SimpleImputer(
        strategy="median"
    )

    X_train_numeric = pd.DataFrame(
        numeric_imputer.fit_transform(
            X_train[NUMERIC_COLUMNS]
        ),
        columns=NUMERIC_COLUMNS,
        index=X_train.index
    )

    X_test_numeric = pd.DataFrame(
        numeric_imputer.transform(
            X_test[NUMERIC_COLUMNS]
        ),
        columns=NUMERIC_COLUMNS,
        index=X_test.index
    )

    one_hot_feature_names = one_hot_encoder.get_feature_names_out(
        CATEGORICAL_COLUMNS
    )

    X_train_encoded = pd.DataFrame(
        X_train_encoded,
        columns=one_hot_feature_names,
        index=X_train.index
    )

    X_test_encoded = pd.DataFrame(
        X_test_encoded,
        columns=one_hot_feature_names,
        index=X_test.index
    )

    X_train_locality = X_train_locality.rename(
        columns={
            "Area Locality": "Area Locality Target Encoded"
        }
    )

    X_test_locality = X_test_locality.rename(
        columns={
            "Area Locality": "Area Locality Target Encoded"
        }
    )

    X_train_final = pd.concat(
        [
            X_train_numeric,
            X_train_encoded,
            X_train_locality
        ],
        axis=1
    )

    X_test_final = pd.concat(
        [
            X_test_numeric,
            X_test_encoded,
            X_test_locality
        ],
        axis=1
    )

    return (
        X_train_final,
        X_test_final,
        one_hot_encoder,
        locality_encoder
    )



