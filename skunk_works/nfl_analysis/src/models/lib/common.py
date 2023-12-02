import os
import json
import pandas as pd

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import f1_score, accuracy_score, confusion_matrix

def load_training_data():
    incoming = json.load(open(os.path.join(
        os.path.dirname(__file__),
        f'../../../data/training.json'
    )))

    keys = incoming[0]['metadata']['keys']
    rows = []
    labels = []
    for row in incoming:
        rows.append(row['compare'])
        labels.append(row['label'])
        #----- reverse it
        rows.append(row['compare'][::-1])
        labels.append(not row['label'])

    #--------
    rtn = []
    for row in rows:
        rtnRow = []
        for i, value1 in enumerate(row[0]):
            value2 = row[1][i]

            rtnRow.append(value1 - value2)

        rtn.append(rtnRow)

    return {
        'keys': keys,
        'rows': rtn,
        'labels': labels
    }

def create_training_info(training_dict):
    # Split the
    training_sets = training_dict['rows']
    training_values = training_dict['labels']

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
        "keys": training_dict['keys'],
        "inputs": {"training": train_inputs, "validation": val_inputs, "scoring": scoring_inputs},
        "outputs": {"training": train_outputs, "validation": val_outputs, "scoring": scoring_outputs},
    }

def calc_statistics(info, model):
    predictions = model.predict(info["inputs"]["scoring"])

    accuracy = cross_val_score(model, info["inputs"]["scoring"], info["outputs"]["scoring"],cv=10).mean()
    score = accuracy_score(info["outputs"]["scoring"], predictions)

    df_featimp = pd.DataFrame(
        {
            "feature": info['keys'],
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
            "features": len(info['keys']),
            "training": len(info["inputs"]["training"]),
            "validation": len(info["inputs"]["validation"]),
            "scoring": len(info["inputs"]["scoring"]),
        }
    }