import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

# 1. Create a dummy dataset
# Features: [FileSizeKB, IsExe, IsZip, IsPdf, NameLength, SuspiciousKeywords]
# SuspiciousKeywords: count of words like 'crack', 'hack', 'free', 'bonus'
data = [
    # Malicious samples
    [500, 1, 0, 0, 15, 1, 0],   # small exe, suspicious
    [1200, 1, 0, 0, 20, 2, 0],  # medium exe, very suspicious
    [10, 0, 1, 0, 10, 1, 0],    # small zip, suspicious
    [50, 0, 0, 1, 25, 0, 0],    # pdf with normal name (but maybe mislabeled in this dummy set for training balance) - let's make it malicious for demo
    [200, 1, 0, 0, 12, 1, 0],   # classic virus.exe type
    
    # Safe samples
    [5000, 0, 0, 1, 15, 0, 1],  # large pdf, normal
    [10000, 0, 1, 0, 20, 0, 1], # large zip, normal
    [2500, 0, 0, 0, 10, 0, 1],  # jpg/png (others), normal
    [15000, 1, 0, 0, 30, 0, 1], # large installer, signed-like (simulated)
    [300, 0, 0, 1, 10, 0, 1],   # small pdf, normal
]

columns = ["FileSizeKB", "IsExe", "IsZip", "IsPdf", "NameLength", "SuspiciousKeywords", "Label"]
df = pd.DataFrame(data, columns=columns)

# 2. Split features and target
X = df.drop("Label", axis=1)
y = df["Label"]

# 3. Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 4. Train Model
model = RandomForestClassifier(n_estimators=10, random_state=42)
model.fit(X_scaled, y)

# 5. Save Artifacts
joblib.dump(model, "file_model.pkl")
joblib.dump(scaler, "file_scaler.pkl")

print("File Security Model Trained & Saved!")
print(" - file_model.pkl")
print(" - file_scaler.pkl")
