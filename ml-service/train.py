"""
train.py — Train a RandomForest crop recommendation model.

Dataset: Kaggle Crop Recommendation Dataset
  - https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset
  - 2200 rows, 7 features → 22 crop labels
  - Features: N, P, K, temperature, humidity, ph, rainfall

Usage:
  python train.py

Output:
  model.pkl         — trained RandomForestClassifier
  label_encoder.pkl — fitted LabelEncoder for crop names
  feature_stats.json — per-feature min/max/mean/std for the API
"""

import os
import json
import ssl

# ── macOS SSL fix ─────────────────────────────────────────────────────────────
# macOS Python does not use the system CA bundle by default.
# Running `pip install certifi` or the macOS Certificates.command fixes it
# permanently, but this one-liner also works for scripts.
ssl._create_default_https_context = ssl._create_unverified_context  # noqa: SIM117

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import urllib.request

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE = os.path.dirname(__file__)
DATASET_PATH = os.path.join(BASE, "crop_recommendation.csv")
MODEL_PATH = os.path.join(BASE, "model.pkl")
ENCODER_PATH = os.path.join(BASE, "label_encoder.pkl")
FEATURE_STATS_PATH = os.path.join(BASE, "feature_stats.json")

# Multiple mirrors in priority order
DATASET_MIRRORS = [
    "https://raw.githubusercontent.com/dsrscientist/dataset1/master/Crop_recommendation.csv",
    "https://raw.githubusercontent.com/Gladiator07/Crop-Recommendation-System/master/Data/Crop_recommendation.csv",
]


def download_dataset():
    """Download the Kaggle Crop Recommendation dataset from a public mirror."""
    if os.path.exists(DATASET_PATH):
        print(f"✅ Dataset already exists at {DATASET_PATH}")
        return

    for i, url in enumerate(DATASET_MIRRORS):
        print(f"⬇️  Trying mirror {i + 1}: {url[:60]}...")
        try:
            urllib.request.urlretrieve(url, DATASET_PATH)
            print(f"✅ Dataset downloaded to {DATASET_PATH}")
            return
        except Exception as e:
            print(f"   ⚠️  Mirror {i + 1} failed: {e}")

    print("❌ All mirrors failed.")
    print("💡 Manual download: https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset")
    print("   Save the CSV as: ml-service/crop_recommendation.csv")
    raise SystemExit(1)


def train():
    download_dataset()

    # Load data
    df = pd.read_csv(DATASET_PATH)
    print(f"📊 Dataset loaded: {len(df)} rows, columns: {list(df.columns)}")

    # Normalize column names (some versions use uppercase)
    df.columns = [c.strip().lower() for c in df.columns]
    if 'label' not in df.columns:
        raise ValueError("Expected 'label' column in dataset")

    feature_cols = ['n', 'p', 'k', 'temperature', 'humidity', 'ph', 'rainfall']
    X = df[feature_cols].values
    y = df['label'].values

    # Encode labels
    le = LabelEncoder()
    y_enc = le.fit_transform(y)

    # Train / test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
    )

    # Train RandomForest
    print("🌲 Training RandomForestClassifier (n_estimators=200)...")
    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        min_samples_split=2,
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)

    # Evaluate
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"✅ Test accuracy: {acc:.4f} ({acc*100:.1f}%)")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    # Save model and encoder
    joblib.dump(clf, MODEL_PATH)
    joblib.dump(le, ENCODER_PATH)

    # Save feature stats for input validation hints
    stats = {}
    for i, col in enumerate(feature_cols):
        stats[col] = {
            "min": float(X[:, i].min()),
            "max": float(X[:, i].max()),
            "mean": float(X[:, i].mean()),
            "std": float(X[:, i].std()),
        }
    with open(FEATURE_STATS_PATH, "w") as f:
        json.dump({"features": feature_cols, "stats": stats, "crops": list(le.classes_)}, f, indent=2)

    print(f"\n✅ Model saved to {MODEL_PATH}")
    print(f"✅ LabelEncoder saved to {ENCODER_PATH}")
    print(f"✅ Feature stats saved to {FEATURE_STATS_PATH}")
    print(f"📋 {len(le.classes_)} crop classes: {list(le.classes_)}")
    return clf, le


if __name__ == "__main__":
    train()
