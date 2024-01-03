import os
import sys
import json
import pandas as pd
import numpy as np
import numpy.typing as npt

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import f1_score, accuracy_score, confusion_matrix
from sklearn.preprocessing import Normalizer

if sys.version_info >= (3, 8):
    from typing import TypedDict
else:
    from typing_extensions import TypedDict

from typing import List, Tuple, Dict

Features = List[float]
Labels = List[bool]

IncomingFeatures = Tuple[Features, Features]
IncomingIndex = Dict[str, Dict[str, Features]]
IncomingReference = Tuple[Tuple[str, str], Labels, str]
IncomingSet = Tuple[IncomingFeatures, Labels, str]

# FeaturePair = Tuple[Features, Features]
# FeatureSet = Tuple[FeaturePair, Labels]

# content[[pairing][pair][offense, defense, team], [labels]]


class ProcessingStats(TypedDict):
    offense: List[str]
    defense: List[str]
    team: List[str]
    labels: List[str]


class IncomingContent(TypedDict):
    content: List[IncomingSet]
    stats: ProcessingStats


# (features, labels)
ProcessingPair = Tuple[npt.NDArray, npt.NDArray]
ProcessingContent = Tuple[npt.NDArray, npt.NDArray, ProcessingStats]


class TrainingInfo(TypedDict):
    training: ProcessingPair
    validation: ProcessingPair
    analysis: ProcessingPair


class ModelAbstract:
    scaler: Normalizer

    def create(self):
        """Need tp write this"""

    def fit_scaler(self, content: npt.NDArray):
        scaler = Normalizer(copy=False)

        features = content[0] + content[1]

        scaler.fit(features)

        self.scaler = scaler

    def scale(self, features: npt.NDArray):
        self.scaler.transform(features[0])
        self.scaler.transform(features[1])

    def fit(
        self,
        training: ProcessingPair,
        validation: ProcessingPair,
        stats: ProcessingStats,
    ):
        """Need to write this"""

    def get_feature_importances(self):
        """Need to write this"""

    def predict(self, content: npt.NDArray, stats: ProcessingStats):
        """Need to write this"""


def get_keys_from_stats(stats: ProcessingStats) -> List[str]:
    return stats["offense"] + stats["defense"] + stats["team"]


def processing_pair(
    features: List[IncomingFeatures], labels: List[Labels]
) -> ProcessingPair:
    base_features: List[Features] = []
    compare_features: List[Features] = []

    for feature_row in features:
        base_features.append(feature_row[0])
        compare_features.append(feature_row[1])

    return np.array([base_features, compare_features]), np.array(labels)

def read_from_index(index: IncomingIndex, path: str):
    pieces = path.split('.')

    return index[pieces[0]][pieces[1]]

def reduce_for_training(index: IncomingIndex, content: List[IncomingReference]) -> TrainingInfo:
    features = []
    labels = []

    for row in content:
        features.append((read_from_index(index, row[0][0]), read_from_index(index, row[0][1])))
        labels.append(row[1])

    # _inputs => training sets
    # _outputs => training values
    train_inputs, val_inputs, train_labels, val_labels = train_test_split(
        features, labels, test_size=0.3, random_state=42, shuffle=True
    )
    val_inputs, analysis_inputs, val_labels, analysis_labels = train_test_split(
        val_inputs, val_labels, test_size=0.5, random_state=42, shuffle=True
    )

    return {
        "training": processing_pair(train_inputs, train_labels),
        "validation": processing_pair(val_inputs, val_labels),
        "analysis": processing_pair(analysis_inputs, analysis_labels),
    }


def reduce_for_processing(content: List[IncomingSet]) -> ProcessingPair:
    rtn_labels: List[Labels] = []
    base_features: List[Features] = []
    compare_features: List[Features] = []

    for row in content:
        base_features.append(row[0][0])
        compare_features.append(row[0][1])

        if len(row) > 2:
            rtn_labels.append(row[2])
        else:
            rtn_labels.append([])

    return np.array([base_features, compare_features]), np.array(rtn_labels)


def calc_statistics(info: TrainingInfo, model: ModelAbstract, stats: ProcessingStats):
    content = info["analysis"]
    predictions = model.predict(content[0], stats)
    correct = 0
    correctness = []
    tp = 0
    fp = 0
    fn = 0
    tn = 0
    for i, pred in enumerate(predictions):
        is_true = info["analysis"][1][i][0] == 1
        pred_value = pred[0]
        pred_true = pred_value > 0.5
        if pred_true and is_true:
            tp += 1
            correct = correct + 1
            correctness.append(
                {"prediction": pred_value, "correct": True, "label": True}
            )
        elif not (pred_true or is_true):
            tn += 1
            correct = correct + 1
            correctness.append(
                {"prediction": pred_value, "correct": True, "label": False}
            )
        else:
            if is_true:
                fn += 1
            else:
                fp += 1

            correctness.append(
                {"prediction": pred_value, "correct": False, "label": is_true}
            )

    correctness.sort(key=lambda x: x["prediction"])

    score = correct / len(predictions)

    buckets = []
    step = 0.1
    cur_prediction_limit = 0.0
    cur_positive_label = 0.0
    cur_negative_label = 0.0

    for analysis in correctness:
        if analysis["prediction"] > cur_prediction_limit:
            if cur_prediction_limit != 0:
                buckets.append(
                    {
                        "limit": cur_prediction_limit,
                        "positive": cur_positive_label,
                        "negative": cur_negative_label,
                    }
                )

            cur_positive_label = 0
            cur_negative_label = 0
            while analysis["prediction"] > cur_prediction_limit:
                cur_prediction_limit += step

        if analysis["label"]:
            cur_positive_label += 1
        else:
            cur_negative_label += 1

    buckets.append(
        {
            "limit": cur_prediction_limit,
            "positive": cur_positive_label,
            "negative": cur_negative_label,
        }
    )

    return {
        "dimensions": {
            "features": get_keys_from_stats(stats),
            "training": len(info["training"][1]),
            "validation": len(info["validation"][1]),
            "analysis": len(info["analysis"][1]),
        },
        "prediction": buckets,
        "score": score,
        "confusion": {
            "tp": tp,
            "fp": fp,
            "fn": fn,
            "tn": tn,
        },
    }


def train_model(Model_Class) -> ModelAbstract:
    incoming: IncomingContent = json.load(
        open(os.path.join(os.path.dirname(__file__), f"../../../data/training.json"))
    )

    model = Model_Class()
    stats = incoming["stats"]
    model.create(stats)

    lookup = incoming['features']
    info = reduce_for_training(lookup, incoming["pairings"])
    model.fit_scaler(info["training"][0])

    model.fit(info["training"], info["analysis"], stats)

    stats = calc_statistics(info, model, stats)

    print(json.dumps(stats, ensure_ascii=False, indent="\t", skipkeys=True))

    return model


def analyze_model(model: ModelAbstract):
    incoming: IncomingContent = json.load(
        open(os.path.join(os.path.dirname(__file__), f"../../../data/analysis.json"))
    )

    content = incoming["content"]
    processed = reduce_for_processing(content)

    predictions = model.predict(processed[0], incoming["stats"])

    for i, label in enumerate(processed[1]):
        print(">>", label, predictions[i])

    print('>> distribution')
    print(json.dumps(model.show_distribution(processed[0]), indent=2))
