import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Load dataset
df = pd.read_csv("data/flood_dataset_1000.csv")

# Features (X)
X = df[
    [
        "rainfall_mm",
        "forecast_mm",
        "soil_moisture",
        "elevation_m",
        "slope_deg",
        "river_distance_km",
        "temperature_c",
        "river_level",
    ]
]

# Target (y)
y = df["flood"]

# Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
)

# Random Forest
model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
)

model.fit(X_train, y_train)

# Prediction
predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

# Save model
joblib.dump(model, "app/models/flood_model.pkl")

print("=" * 40)
print("THULI ML TRAINING")
print("=" * 40)
print(f"Training Samples : {len(X_train)}")
print(f"Testing Samples  : {len(X_test)}")
print(f"Accuracy         : {accuracy*100:.2f}%")
print("Model Saved      : app/models/flood_model.pkl")