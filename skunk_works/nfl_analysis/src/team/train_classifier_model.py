import os
import json
import numpy as np
import pandas as pd

from xgboost import XGBClassifier 
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import f1_score, accuracy_score, confusion_matrix

le = LabelEncoder()

# Defining S3 bucket names
seasons = ['2019', '2020', '2021', '2022']

def load_training_data(season):
    incoming = json.load(open(os.path.join(
        os.path.dirname(__file__),
        f'../data/frames/{season}.json'
    )))

    return pd.DataFrame(incoming)

def create_training_info(training_df):
    # Split the
    training_sets = training_df.drop(columns=["label"])
    training_values = (training_df["label"] > 0)

    # _inputs => training sets
    # _outputs => training values
    train_inputs, val_inputs, train_outputs, val_outputs = train_test_split(
        training_sets,
        training_values,
        test_size=0.3,
        random_state=42,
        shuffle=True
    )
    val_inputs, scoring_inputs, val_outputs, scoring_outputs = train_test_split(
        val_inputs,
        val_outputs,
        test_size=0.2,
        random_state=42,
        shuffle=True
    )

    return {
        "inputs": {"training": train_inputs, "validation": val_inputs, "scoring": scoring_inputs},
        "outputs": {"training": train_outputs, "validation": val_outputs, "scoring": scoring_outputs},
    }

# https://www.datatechnotes.com/2019/07/classification-example-with.html
def create_model(info):
    # ---- Model
    model = XGBClassifier(objective="reg:logistic", silent=True, verbosity=0)

    model.fit(
        info["inputs"]["training"].values,
        le.fit_transform(info["outputs"]["training"]),
        eval_set=[(info["inputs"]["validation"].values, info["outputs"]["validation"])],
    )

    print("-- model created --")
    return model

def calc_statistics(info, model):
    predictions = model.predict(info["inputs"]["scoring"].values)

    accuracy = cross_val_score(model, info["inputs"]["scoring"], info["outputs"]["scoring"],cv=10).mean()
    score = accuracy_score(info["outputs"]["scoring"], predictions)

    df_featimp = pd.DataFrame(
        {
            "feature": info["inputs"]["training"].columns,
            "importance": model.feature_importances_,
        }
    )

    # Sorting by importance
    df_featimp = df_featimp.sort_values(by="importance", ascending=False)

    return {
        "importance": {
            "top": df_featimp.head(20).to_dict(orient="records"),
            "bottom": df_featimp.tail(20)[::-1].to_dict(orient="records"),
        },
        "accuracy": accuracy,
        "score": score,
        "dimensions": {
            "features": len(info["inputs"]["training"].columns),
            "training": len(info["inputs"]["training"].values),
            "validation": len(info["inputs"]["validation"].values),
            "scoring": len(info["inputs"]["scoring"].values),
        }
    }

def run():
    for season in seasons:
        info = create_training_info(load_training_data(season))

        model = create_model(info)

        stats = calc_statistics(info, model)

        print(json.dumps(stats, ensure_ascii=False, indent="\t", skipkeys=True))

if __name__ == "__main__":
    run()