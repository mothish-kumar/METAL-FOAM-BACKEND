import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
import os
# Get the directory of the current script
script_dir = os.path.dirname(os.path.abspath(__file__))

datasetPath = os.path.join(script_dir, "Welding_process_parameters.csv")

# Load dataset
df = pd.read_csv(datasetPath)

# List of feature columns which should be numeric
numeric_cols = ['Yield strength', 'Axial pressure', 'Thermal diffusivity', 'Void-1 void free-0']

# Clean the numeric columns: remove extra characters and convert to numeric
for col in numeric_cols:
    # Remove any characters except digits and the decimal point
    df[col] = df[col].replace(r'[^\d.]+', '', regex=True)
    # Convert column to float (any conversion issues will become NaN)
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Rename feature columns before training
rename_map = {
    'Yield strength': 'Flexural Strength',
    'Axial pressure': 'Tensile Strength',
    'Thermal diffusivity': 'Thermal Conductivity',
    'Void-1 void free-0': 'Porosity'
}
df.rename(columns=rename_map, inplace=True)

columns_needed = ['Flexural Strength', 'Tensile Strength', 'Thermal Conductivity', 'Porosity',  'Welding speed', 'Rotation speed', 'Plate thickness']
# Drop any rows which have missing values in the required columns
df.dropna(subset=columns_needed, inplace=True)

# Select Features (X)
X = df[['Flexural Strength', 'Tensile Strength', 'Thermal Conductivity', 'Porosity']]

# Select Target (y) — Welding Parameters
y = df[['Welding speed', 'Rotation speed', 'Plate thickness']]


# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Feature Scaling
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train Random Forest Model
rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
rf_model.fit(X_train_scaled, y_train)

# Save model & scaler
with open("welding_model.pkl", "wb") as model_file:
    pickle.dump(rf_model, model_file)

with open("scaler.pkl", "wb") as scaler_file:
    pickle.dump(scaler, scaler_file)

print("🔥 Random Forest Model training completed and saved successfully!")