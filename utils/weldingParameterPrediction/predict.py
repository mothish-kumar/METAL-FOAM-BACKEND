import sys
import pickle
import numpy as np
import json
import os
import pandas as pd

# Get the directory of the current script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Correct paths to model and scaler
model_path = os.path.join(script_dir, "welding_model.pkl")
scaler_path = os.path.join(script_dir, "scaler.pkl")

# Load the trained model and scaler
with open(model_path, "rb") as model_file:
    model = pickle.load(model_file)

with open(scaler_path, "rb") as scaler_file:
    scaler = pickle.load(scaler_file)

def predict_welding_parameters(flexuralStrength, tensileStrength, thermalConductivity, porosity):
    feature_names = ["Flexural Strength", "Tensile Strength", "Thermal Conductivity", "Porosity"]
    
    # Create a DataFrame with the correct column names
    input_features = pd.DataFrame(
        [[flexuralStrength, tensileStrength, thermalConductivity, porosity]],
        columns=feature_names
    )
    # Scale input data
    input_features = scaler.transform(input_features)

    # Predict welding parameters
    prediction = model.predict(input_features)

    # Prepare result as JSON
    result = {
        "heatInput": float(prediction[0][0]),
        "coolingTime": float(prediction[0][1]),
        "weldingStrength": float(prediction[0][2])
    }

    print(json.dumps(result))  # Output JSON for Node.js to capture

if __name__ == "__main__":
    flexuralStrength = float(sys.argv[1])
    tensileStrength = float(sys.argv[2])
    thermalConductivity = float(sys.argv[3])
    porosity = float(sys.argv[4])

    predict_welding_parameters(flexuralStrength, tensileStrength, thermalConductivity, porosity)
