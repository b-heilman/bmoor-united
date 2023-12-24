import os
import sys
import json
import pandas as pd
import numpy as np
import numpy.typing as npt

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import f1_score, accuracy_score, confusion_matrix
from sklearn.preprocessing import Normalizer

if sys.version_info >= (3,8):
    from typing import TypedDict
else:
    from typing_extensions import TypedDict

from typing import List, Tuple

FEATURES_POS = 0
LABEL_POS = 1
STATS_POS = 2
KEYS_POS = 3
OFFENSE_FEATURES_POS = 0
DEFENSE_FEATURES_POS = 1
TEAM_FEATURES_POS = 2

Features = List[float]
FeaturePair = Tuple[Features, Features]
FeatureSet = List[FeaturePair]

LabelSet = List[bool]

# content[[pairing][pair][offense, defense, team], [labels]]
IncomingFeatures = Tuple[Features, Features, Features]
IncomingPair = Tuple[IncomingFeatures, IncomingFeatures]
IncomingSet = Tuple[List[IncomingPair], LabelSet]

TrainingKeys = List[str]

class TrainingStats(TypedDict):
    offense: int
    defense: int
    team: int
    label: int

ProcessingPair = Tuple[npt.NDArray, npt.NDArray, TrainingStats, TrainingKeys]

class TrainingInfo(TypedDict):
    training: ProcessingPair
    validation: ProcessingPair
    analysis: ProcessingPair
    
def get_incoming_stats(incoming: IncomingSet) -> TrainingStats:
    first_row = incoming[0][FEATURES_POS][0]
    
    return {
        'offense': len(first_row[OFFENSE_FEATURES_POS]), 
        'defense': len(first_row[DEFENSE_FEATURES_POS]), 
        'team': len(first_row[TEAM_FEATURES_POS]),
        'label': len(incoming[0][LABEL_POS])
    }

def reduce_incoming(content: IncomingSet) -> ProcessingPair:
    rtn_labels = []
    rtn_features = []
    stats = get_incoming_stats(content)

    for row in content:
        rtn_labels.append(row[LABEL_POS])
        rtn_features.append(tuple(row[FEATURES_POS]))

    return np.array(rtn_features), np.array(rtn_labels), stats, None

def train_scaler(content: ProcessingPair) -> Normalizer:
    scaler = Normalizer(copy=False)
    arr = content[FEATURES_POS]
    base_features = arr.reshape(-1, arr.shape[-1])

    scaler.fit(base_features)

    return scaler

def scale_processing(features: FeatureSet, scaler: Normalizer):
    for pairing in features:
        scaler.transform(pairing)

class ModelAbstract():
    def create(self):
        """Need tp write this"""

    def fit(self, training: ProcessingPair, validation: ProcessingPair):
        """Need to write this"""

    def get_feature_importances():
        """Need to write this"""

    def predict(self, features: FeatureSet):
        """Need to write this"""

def load_training_data() -> ProcessingPair:
    incoming = json.load(open(os.path.join(
        os.path.dirname(__file__),
        f'../../../data/training.json'
    )))

    processed = reduce_incoming(incoming['training'])

    return (
        processed[FEATURES_POS], 
        processed[LABEL_POS], 
        processed[STATS_POS], 
        incoming['keys']
    )

def create_training_info(training_set: ProcessingPair) -> TrainingInfo:
    # Split the
    training_inputs = training_set[FEATURES_POS]
    training_labels = training_set[LABEL_POS]
    training_stats = training_set[STATS_POS]
    training_keys = training_set[KEYS_POS]

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
        "training": (train_inputs, train_labels, training_stats, training_keys),
        "validation": (val_inputs, val_labels, training_stats, training_keys),
        "analysis": (analysis_inputs, analysis_labels, training_stats, training_keys)
    }

def calc_statistics(info: TrainingInfo, model: ModelAbstract):
    predictions = model.predict(info["analysis"][FEATURES_POS])
    correct = 0
    correctness = []
    tp = 0
    fp = 0
    fn = 0
    tn = 0
    for i, pred in enumerate(predictions):
        is_true = info["analysis"][LABEL_POS][i][0] == 1
        pred_value = pred[0]
        pred_true = pred_value > 0.5
        if pred_true and is_true:
            tp += 1
            correct = correct + 1
            correctness.append({
                'prediction': pred_value,
                'correct': True,
                'label': True
            })
        elif not (pred_true or is_true):
            tn += 1
            correct = correct + 1
            correctness.append({
                'prediction': pred_value,
                'correct': True,
                'label': False
            })
        else:
            if is_true:
                fn += 1
            else:
                fp += 1

            correctness.append({
                'prediction': pred_value,
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
        'prediction': buckets,
        "dimensions": {
            "features": info['analysis'][STATS_POS],
            "training": len(info["training"][LABEL_POS]),
            "validation": len(info["validation"][LABEL_POS]),
            "analysis": len(info["analysis"][LABEL_POS]),
        },
        "score": score,
        'confusion': {
            'tp': tp,
            'fp': fp,
            'fn': fn,
            'tn': tn,
        }
    }

def train_model(Model_Class) -> ModelAbstract:
    info = create_training_info(load_training_data())

    model = Model_Class()
    model.create(info['training'][STATS_POS])
    model.fit(info['training'], info['analysis'])

    stats = calc_statistics(info, model)

    print(json.dumps(stats, ensure_ascii=False, indent="\t", skipkeys=True))

    return model

def analyze_model(model: ModelAbstract):
    incoming = json.load(open(os.path.join(
        os.path.dirname(__file__),
        f'../../../data/analysis.json'
    )))

    processed = reduce_incoming(incoming['analysis'])

    predictions = model.predict(processed[FEATURES_POS])

    for i, label in enumerate(processed[LABEL_POS]):
        print('>>', label, predictions[i])