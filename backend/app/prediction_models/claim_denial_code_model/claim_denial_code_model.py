from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import pandas as pd
import numpy as np
import pickle
from sklearn.preprocessing import LabelEncoder


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

print(df.columns)


# Only use denied claims
df = df[df["outcome"] == "denied"]


df["payer_type"] = df["payer_type"].apply(normalize_payer_type)


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

label_encoder = LabelEncoder()

df["encoded_denial_category"] = label_encoder.fit_transform(df["denial_category"])


X = df.copy()
y = df["encoded_denial_category"]


# Train and test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.15, random_state=42
)


X_train = X_train[features]
X_test = X_test[features]

# Assign category features as type category
for column in category_columns:
    X_train[column] = X_train[column].astype("category")
    X_test[column] = X_test[column].astype("category")

# Train model
model = XGBClassifier(
    objective="multi:softprob",
    n_estimators=300,
    learning_rate=0.05,
    max_depth=5,
    enable_categorical=True,
    eval_metric="mlogloss"
)

model.fit(X_train, y_train)


# Model Evaluation
y_pred = model.predict(X_test)

print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))


sample_probs = model.predict_proba(X_test.iloc[:1])[0]

top_3_idx = np.argsort(sample_probs)[-3:][::-1]

print("\nTop 3 Predicted Denial Codes:")

for idx in top_3_idx:
    code = label_encoder.inverse_transform([idx])[0]
    prob = sample_probs[idx]

    print(f"{code}: {prob:.2%}")



importance = pd.DataFrame({
    "feature": X_train.columns,
    "importance": model.feature_importances_
}).sort_values(by="importance", ascending=False)

print(importance.head(20))



with open("claim_denial_code_model.pkl", "wb") as f:
    pickle.dump(model, f)


with open("claim_denial_code_encoder.pkl", "wb") as f:
    pickle.dump(label_encoder, f)