import json

from xgboost import XGBClassifier 
from sklearn.preprocessing import LabelEncoder

from lib.common import load_training_data, create_training_info, calc_statistics
le = LabelEncoder()

# https://www.datatechnotes.com/2019/07/classification-example-with.html
def create_model(info):
    # ---- Model
    model = XGBClassifier(objective="reg:logistic", silent=True, verbosity=0)

    model.fit(
        info["inputs"]["training"],
        le.fit_transform(info["outputs"]["training"]),
        eval_set=[(info["inputs"]["validation"], info["outputs"]["validation"])],
    )

    print("-- model created --")
    return model

def run():
    info = create_training_info(load_training_data())

    model = create_model(info)

    stats = calc_statistics(info, model)

    print(json.dumps(stats, ensure_ascii=False, indent="\t", skipkeys=True))

if __name__ == "__main__":
    run()