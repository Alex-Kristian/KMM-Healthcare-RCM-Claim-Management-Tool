# Model trained on dataset from https://www.kaggle.com/datasets/nudratabbas/denialiq-120k-medical-claims-x12-denial-codes

from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, classification_report
import pandas as pd
import numpy as np
import pickle


def normalize_payer_type(payer_type: str) -> str:
    payer = str(payer_type).lower()

    if "medicare" in payer:
        return "Medicare"

    elif "medicaid" in payer:
        return "Medicaid"

    else:
        return "Commercial"

# ADD LOCAL DATASET PATH 
df = pd.read_csv("")

# Feature Engineering
df["denied"] = (df["outcome"] == "denied").astype(int)


df["payer_type"] = df["payer_type"].apply(normalize_payer_type)

print(df.columns)
print(df.head())

features =[
    "payer_type",
    "provider_specialty",
    "claim_amount_usd",
    "cpt_code",
    "modifier",
    "primary_icd10_dx",
    "secondary_dx_count",
    "prior_auth_required",
    "prior_auth_obtained"
]

category_columns = [
    "payer_type",
    "provider_specialty",
    "cpt_code",
    "modifier",
    "primary_icd10_dx",
    "prior_auth_required",
    "prior_auth_obtained"
]

X = df.drop(columns=["denied"])
y = df["denied"]


# Train and test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)



X_train = X_train[features]
X_test = X_test[features]

# Assign category features as type category
for column in category_columns:
    X_train[column] = X_train[column].astype("category")
    X_test[column] = X_test[column].astype("category")

# Train model
model = XGBClassifier(
    n_estimators=300,
    learning_rate=0.03,
    max_depth=5,
    enable_categorical=True,
    scale_pos_weight= len(y_train[y_train == 0]) / len(y_train[y_train == 1]),
    eval_metric="auc"
)

model.fit(X_train, y_train)


# Model Evaluation
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

print(classification_report(y_test, y_pred))
print("ROC AUC:", roc_auc_score(y_test, y_prob))

print(y_prob[0:20])


importance = pd.DataFrame({
    "feature": X_train.columns,
    "importance": model.feature_importances_
}).sort_values(by="importance", ascending=False)

print(importance.head(20))



with open("claim_denial_model.pkl", "wb") as f:
    pickle.dump(model, f)