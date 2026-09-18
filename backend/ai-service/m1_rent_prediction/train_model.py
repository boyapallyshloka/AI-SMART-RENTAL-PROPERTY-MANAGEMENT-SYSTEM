from preprocessing import load_and_prepare_data, split_data, encode_features
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np

from sklearn.linear_model import LinearRegression


df = load_and_prepare_data()

X_train, X_test, y_train, y_test = split_data(df)

X_train_final, X_test_final, one_hot_encoder, locality_encoder = encode_features(
    X_train,
    X_test,
    y_train
)

y_train_log = np.log1p(y_train)
y_test_log = np.log1p(y_test)


linear_model = LinearRegression()

linear_model.fit(
    X_train_final,
    y_train_log
)
y_pred_log = linear_model.predict(X_test_final)
y_pred = np.expm1(y_pred_log)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print(f"Linear Regression MAE: ₹{mae:,.2f}")
print(f"Linear Regression RMSE: ₹{rmse:,.2f}")
print(f"Linear Regression R²: {r2:.4f}")