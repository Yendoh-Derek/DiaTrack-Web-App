#!/usr/bin/env python3
"""Train a logistic regression diabetes risk model and export ONNX + metadata."""

import json
import os
from pathlib import Path

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

ROOT = Path(__file__).resolve().parent.parent
MODEL_DIR = ROOT / "public" / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

FEATURE_NAMES = [
    "age",
    "gender",
    "bmi",
    "hypertension",
    "heart_disease",
    "smoking_never",
    "smoking_former",
    "smoking_current",
    "HbA1c_level",
    "blood_glucose_level",
]

SMOKING_MAP = {"never": [1, 0, 0], "former": [0, 1, 0], "current": [0, 0, 1]}


def encode_row(age, gender, bmi, hypertension, heart_disease, smoking, hba1c, glucose):
    smoke = SMOKING_MAP.get(smoking, [1, 0, 0])
    return [
        age,
        gender,
        bmi,
        hypertension,
        heart_disease,
        *smoke,
        hba1c,
        glucose,
    ]


def generate_synthetic_data(n_samples: int = 5000, seed: int = 42):
    rng = np.random.default_rng(seed)
    rows = []
    labels = []

    for _ in range(n_samples):
        age = rng.integers(25, 80)
        gender = rng.integers(0, 2)
        bmi = rng.normal(28, 5)
        bmi = float(np.clip(bmi, 18, 45))
        hypertension = int(rng.random() < 0.35)
        heart_disease = int(rng.random() < 0.2)
        smoking = rng.choice(["never", "former", "current"], p=[0.6, 0.25, 0.15])
        hba1c = float(np.clip(rng.normal(5.8, 1.0), 4.5, 12))
        glucose = float(np.clip(rng.normal(110, 35), 70, 350))

        logit = (
            -4.0
            + 0.03 * age
            + 0.15 * gender
            + 0.06 * bmi
            + 0.5 * hypertension
            + 0.45 * heart_disease
            + (0.25 if smoking == "former" else 0.55 if smoking == "current" else 0)
            + 1.2 * max(0, hba1c - 5.7)
            + 0.015 * max(0, glucose - 100)
        )
        prob = 1 / (1 + np.exp(-logit))
        label = int(rng.random() < prob)

        rows.append(
            encode_row(age, gender, bmi, hypertension, heart_disease, smoking, hba1c, glucose)
        )
        labels.append(label)

    return np.array(rows, dtype=np.float32), np.array(labels, dtype=np.int32)


def main():
    X, y = generate_synthetic_data()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = LogisticRegression(max_iter=1000, random_state=42)
    model.fit(X_train_scaled, y_train)
    accuracy = model.score(X_test_scaled, y_test)
    print(f"Test accuracy: {accuracy:.3f}")

    initial_type = [("float_input", FloatTensorType([None, len(FEATURE_NAMES)]))]
    onnx_model = convert_sklearn(model, initial_types=initial_type, target_opset=12)
    onnx_path = MODEL_DIR / "diabetes-risk.onnx"
    with open(onnx_path, "wb") as f:
        f.write(onnx_model.SerializeToString())
    print(f"Wrote {onnx_path}")

    coefficients = model.coef_[0].tolist()
    metadata = {
        "feature_names": FEATURE_NAMES,
        "scaler_mean": scaler.mean_.tolist(),
        "scaler_scale": scaler.scale_.tolist(),
        "coefficients": coefficients,
        "intercept": float(model.intercept_[0]),
        "class_labels": ["Negative", "Positive"],
        "version": "1.0.0",
        "disclaimer": "Demo model for educational purposes only. Not for clinical diagnosis.",
    }
    meta_path = MODEL_DIR / "model-metadata.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Wrote {meta_path}")


if __name__ == "__main__":
    main()
