import os
import sys
import json
import pandas as pd

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import f1_score, accuracy_score, confusion_matrix

if sys.version_info >= (3,8):
    from typing import TypedDict
else:
    from typing_extensions import TypedDict

from typing import List

Features = List[float]
class FeaturePair(TypedDict):
    compare: Features
    against: Features

FeatureSet = List[FeaturePair]
LabelSet = List[bool]

class TrainingPair(TypedDict):
    features: FeatureSet
    labels: LabelSet

class TrainingData(TrainingPair):
    keys: List[str]

class TrainingStats(TypedDict):
    features: int

class TrainingInfo(TypedDict):
    keys: List[str]
    stats: TrainingStats
    training: TrainingPair
    validation: TrainingPair
    analysis: TrainingPair
    

class ModelAbstract():
    def create(self):
        """Need tp write this"""

    def fit(self, training: TrainingPair, validation: TrainingPair):
        """Need to write this"""

    def get_feature_importances():
        """Need to write this"""

    def predict(self, features: FeatureSet):
        """Need to write this"""

def load_training_data() -> TrainingData:
    incoming = json.load(open(os.path.join(
        os.path.dirname(__file__),
        f'../../../data/training.json'
    )))

    keys = incoming[0]['metadata']['keys']
    labels: LabelSet = []
    features: FeatureSet = []
    for row in incoming:
        features.append({
            'compare': row['compare'][0],
            'against': row['compare'][1]
        })
        labels.append(1 if row['label'] else 0)

        #----- reverse it
        features.append({
            'compare': row['compare'][1],
            'against': row['compare'][0]
        })
        labels.append(0 if row['label'] else 1)

    return {
        'keys': keys,
        'features': features,
        'labels': labels
    }

def create_training_info(training_dict: TrainingData) -> TrainingInfo:
    # Split the
    training_inputs = training_dict['features']
    training_labels = training_dict['labels']

    # _inputs => training sets
    # _outputs => training values
    train_inputs, val_inputs, train_labels, val_labels = train_test_split(
        training_inputs,
        training_labels,
        test_size=0.3,
        random_state=42,
        shuffle=True
    )
    val_inputs, analysis_inputs, val_labels, analysis_labels = train_test_split(
        val_inputs,
        val_labels,
        test_size=0.2,
        random_state=42,
        shuffle=True
    )

    return {
        "keys": training_dict['keys'],
        "stats": {
            "features": len(training_dict['keys'])
        },
        "training": {
            "features": train_inputs,
            "labels": train_labels
        },
        "validation": {
            "features": val_inputs,
            "labels": val_labels
        },
        "analysis": {
            "features": analysis_inputs,
            "labels": analysis_labels
        }
    }

def calc_statistics(info: TrainingInfo, model: ModelAbstract):
    predictions = model.predict(info["analysis"]["features"])
    correct = 0
    correctness = []
    tp = 0
    fp = 0
    fn = 0
    tn = 0
    for i, pred in enumerate(predictions):
        is_true = info["analysis"]["labels"][i] == 1
        if pred > 0.5 and is_true:
            tp += 1
            correct = correct + 1
            correctness.append({
                'prediction': pred,
                'correct': True,
                'label': True
            })
        elif pred < 0.5 and not is_true:
            tn += 1
            correct = correct + 1
            correctness.append({
                'prediction': pred,
                'correct': True,
                'label': False
            })
        else:
            if is_true:
                fn += 1
            else:
                fp += 1

            correctness.append({
                'prediction': pred,
                'correct': False,
                'label': is_true
            })

    correctness.sort(key=lambda x: x['prediction'])

    score = correct / len(predictions)

    buckets = []
    step = .1
    cur_prediction_limit = 0
    cur_positive_label = 0
    cur_negative_label = 0
    
    for analysis in correctness:
        if analysis['prediction'] > cur_prediction_limit:
            if cur_prediction_limit != 0:
                buckets.append({
                    'limit': cur_prediction_limit,
                    'positive': cur_positive_label,
                    'negative': cur_negative_label
                })

            cur_positive_label = 0
            cur_negative_label = 0
            while analysis['prediction'] > cur_prediction_limit:
                cur_prediction_limit += step

        if analysis['label']:
            cur_positive_label += 1
        else:
            cur_negative_label += 1

    buckets.append({
        'limit': cur_prediction_limit,
        'positive': cur_positive_label,
        'negative': cur_negative_label
    })

    return {
        "score": score,
        'confusion': {
            'tp': tp,
            'fp': fp,
            'fn': fn,
            'tn': tn,
        },
        'prediction': buckets,
        "dimensions": {
            "features": info['stats']['features'],
            "training": len(info["training"]['labels']),
            "validation": len(info["validation"]['labels']),
            "analysis": len(info["analysis"]['labels']),
        }
    }

def train_model(Model_Class) -> ModelAbstract:
    info = create_training_info(load_training_data())

    model = Model_Class()
    model.create(info['stats'])
    model.fit(info['training'], info['analysis'])

    stats = calc_statistics(info, model)

    print(json.dumps(stats, ensure_ascii=False, indent="\t", skipkeys=True))

    return model