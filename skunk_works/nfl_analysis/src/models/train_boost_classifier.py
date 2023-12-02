import json

from xgboost import XGBClassifier 
from sklearn.preprocessing import LabelEncoder

from lib.common import (
    load_training_data, 
    create_training_info, 
    calc_statistics,
    train_model,
    FeatureSet,
    TrainingPair,
    TrainingStats,
    ModelAbstract
)
le = LabelEncoder()

def format_features(features: FeatureSet):
    rtn = []
    for feature in features:
        rtnRow = []
        for i, value1 in enumerate(feature['compare']):
            value2 = feature['against'][i]

            rtnRow.append(value1 - value2)

        rtn.append(rtnRow)

    return rtn

class XgboostClassifier(ModelAbstract):
    model: XGBClassifier

    # https://www.datatechnotes.com/2019/07/classification-example-with.html
    def create(self, stats: TrainingStats):
        self.model = XGBClassifier(objective="reg:logistic", silent=True, verbosity=0)

    def fit(self, training: TrainingPair, validation: TrainingPair):
        self.model.fit(
            format_features(training["features"]),
            le.fit_transform(training["labels"]),
            eval_set=[(
                format_features(validation["features"]), 
                validation["labels"]
            )],
        )

    def get_feature_importances(self):
        return self.model.feature_importances_
        
    def predict(self, features: FeatureSet):
        features = format_features(features)

        return self.model.predict(features)

if __name__ == "__main__":
    train_model(XgboostClassifier)