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

from typing import List, Tuple

Features = List[float]
Labels = List[bool]

IncomingFeatures = Tuple[Features, Features]
IncomingSet = Tuple[IncomingFeatures, Labels]

# FeaturePair = Tuple[Features, Features]
# FeatureSet = Tuple[FeaturePair, Labels]

# content[[pairing][pair][offense, defense, team], [labels]]


class ProcessingStats(TypedDict):
    offense: List[str]
    defense: List[str]
    team: List[str]
    label: int  # TODO: need to add how many labels are there...


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
    stats: ProcessingStats


def reduce_incoming(content: List[IncomingSet]) -> ProcessingPair:
    rtn_labels: List[Labels] = []
    rtn_features: List[IncomingFeatures] = []

    for row in content:
        rtn_features.append(row[0])
        rtn_labels.append(row[1])

    return np.array(rtn_features), np.array(rtn_labels)


class ModelAbstract:
    scaler: Normalizer

    def create(self):
        """Need tp write this"""

    def fit_scaler(self, content: List[IncomingSet]):
        scaler = Normalizer(copy=False)
        features: List[Features] = []

        for row in content:
            row_features = row[0]

            features.append(row_features[0])
            features.append(row_features[1])

        scaler.fit(features)

        self.scaler = scaler

    def scale(self, content: ProcessingPair):
        features = content[0]
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

    def predict(self, content: ProcessingPair, stats: ProcessingStats):
        """Need to write this"""


def load_training_data() -> ProcessingContent:
    incoming = json.load(
        open(os.path.join(os.path.dirname(__file__), f"../../../data/training.json"))
    )

    processed = reduce_incoming(incoming["training"])

    return (processed[0], processed[1], incoming["stats"])


def get_keys_from_stats(stats: ProcessingStats) -> List[str]:
    return stats["offense"] + stats["defense"] + stats["team"]


def create_training_info(training_set: ProcessingContent) -> TrainingInfo:
    # Split the
    training_inputs = training_set[0]
    training_labels = training_set[1]
    training_stats = training_set[2]

    # _inputs => training sets
    # _outputs => training values
    train_inputs, val_inputs, train_labels, val_labels = train_test_split(
        training_inputs, training_labels, test_size=0.3, random_state=42, shuffle=True
    )
    val_inputs, analysis_inputs, val_labels, analysis_labels = train_test_split(
        val_inputs, val_labels, test_size=0.2, random_state=42, shuffle=True
    )

    return {
        "training": (train_inputs, train_labels),
        "validation": (val_inputs, val_labels),
        "analysis": (analysis_inputs, analysis_labels),
        "stats": training_stats,
    }


def calc_statistics(info: TrainingInfo, model: ModelAbstract):
    content = info["analysis"]
    predictions = model.predict(content, info["stats"])
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
        "prediction": buckets,
        "dimensions": {
            "features": get_keys_from_stats(info["stats"]),
            "training": len(info["training"][1]),
            "validation": len(info["validation"][1]),
            "analysis": len(info["analysis"][1]),
        },
        "score": score,
        "confusion": {
            "tp": tp,
            "fp": fp,
            "fn": fn,
            "tn": tn,
        },
    }


def train_model(Model_Class) -> ModelAbstract:
    content = load_training_data()

    model = Model_Class()
    model.create(content[2])
    model.fit_scaler(content[0])

    info = create_training_info(content)

    model.fit(info["training"], info["analysis"])

    stats = calc_statistics(info, model)

    print(json.dumps(stats, ensure_ascii=False, indent="\t", skipkeys=True))

    return model


def analyze_model(model: ModelAbstract):
    incoming = json.load(
        open(os.path.join(os.path.dirname(__file__), f"../../../data/analysis.json"))
    )

    processed = reduce_incoming(incoming["content"])

    predictions = model.predict(processed, incoming["stats"])

    for i, label in enumerate(processed[1]):
        print(">>", label, predictions[i])
