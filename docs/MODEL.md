# DiaTrack ML Model

## Overview

DiaTrack uses a **logistic regression** model trained on synthetically generated data with clinically aligned feature weights. The model runs in the browser via ONNX Runtime Web, with a coefficient-based JavaScript fallback.

## Features (input order)

| Feature | Description |
|---------|-------------|
| age | Patient age in years |
| gender | 0 = female, 1 = male |
| bmi | Body mass index (kg/m²) |
| hypertension | 0 or 1 |
| heart_disease | 0 or 1 |
| smoking_never | One-hot smoking encoding |
| smoking_former | One-hot smoking encoding |
| smoking_current | One-hot smoking encoding |
| HbA1c_level | Percentage |
| blood_glucose_level | mg/dL |

## Training

```bash
pip install -r scripts/requirements.txt
python scripts/train_model.py
# or
npm run train-model
```

Outputs:
- `public/models/diabetes-risk.onnx`
- `public/models/model-metadata.json`

## Methodology

Training data is synthetically generated using a hand-crafted logit function that encodes known diabetes risk correlations (elevated HbA1c, glucose, BMI, comorbidities, smoking, age). A logistic regression is fit to this data and exported to ONNX.

This approach produces a **demonstration model** — not a model validated on real clinical datasets.

## Interpretability

Feature contributions shown in the UI are **coefficient × scaled feature value** from the logistic regression. These are labeled honestly as "Model Feature Contributions" — not SHAP values.

## Limitations

- Not validated on real patient data
- Not FDA-cleared or clinically approved
- Synthetic training may not reflect population diversity
- For educational/portfolio use only
