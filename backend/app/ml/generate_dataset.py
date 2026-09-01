import pandas as pd
import numpy as np

np.random.seed(42)

df = pd.read_csv("data/flood_dataset.csv")

synthetic = []

for _ in range(1000):

    row = df.sample(1).iloc[0].copy()

    row["rainfall_mm"] = max(0, row["rainfall_mm"] + np.random.normal(0, 2))
    row["forecast_mm"] = max(0, row["forecast_mm"] + np.random.normal(0, 4))
    row["soil_moisture"] = np.clip(row["soil_moisture"] + np.random.normal(0, 0.03), 0, 0.60)
    row["elevation_m"] = max(20, row["elevation_m"] + np.random.normal(0, 30))
    row["slope_deg"] = np.clip(row["slope_deg"] + np.random.normal(0, 3), 0, 60)
    row["river_distance_km"] = np.clip(row["river_distance_km"] + np.random.normal(0, 0.3), 0.1, 10)
    row["temperature_c"] = np.clip(row["temperature_c"] + np.random.normal(0, 1.5), 15, 40)

    row["river_level"] = int(np.clip(
        row["river_level"] + np.random.choice([-1,0,1], p=[0.2,0.6,0.2]),
        0,
        3
    ))

    synthetic.append(row)

synthetic_df = pd.DataFrame(synthetic)
final_df = pd.concat([df, synthetic_df], ignore_index=True)

final_df.to_csv("data/flood_dataset_1000.csv", index=False)

print("="*40)
print("THULI Dataset Generator")
print("="*40)
print(f"Original rows : {len(df)}")
print(f"Synthetic rows: {len(synthetic_df)}")
print(f"Total rows    : {len(final_df)}")
print("Saved as data/flood_dataset_1000.csv")
