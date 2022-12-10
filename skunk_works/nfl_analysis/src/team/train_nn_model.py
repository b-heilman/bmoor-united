import os
import json
import numpy as np
import pandas as pd
import torch 

from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.model_selection import cross_val_score
from sklearn.metrics import mean_squared_error

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
    training_values = training_df["label"]

    # _x => training sets
    # _y => training values
    train_input, val_input, train_output, val_output = train_test_split(
        training_sets,
        training_values,
        test_size=0.3,
        random_state=42,
        shuffle=True
    )
    val_input, scoring_input, val_output, scoring_output = train_test_split(
        val_input,
        val_output,
        test_size=0.3,
        random_state=42,
        shuffle=True
    )

    return {
        "inputs": {"training": train_input, "validation": val_input, "scoring": scoring_input},
        "outputs": {"training": train_output, "validation": val_output, "scoring": scoring_output},
    }

# https://pytorch.org/tutorials/beginner/introyt/modelsyt_tutorial.html
def create_model(info):
    features = len(info["inputs"]["training"].columns)

    class MyModel(torch.nn.Module):
        def __init__(self):
            super(MyModel, self).__init__()

            self.fc1 = torch.nn.Linear(features, 10)
            self.relu = torch.nn.ReLU()
            self.fc2 = torch.nn.Linear(10, 1)
            self.sigmoid = torch.nn.Sigmoid()

        def forward(self, x):
            hidden = self.fc1(x)
            relu = self.relu(hidden)
            output = self.fc2(relu)
            output = self.sigmoid(output)
            return output

    # ---- Model
    model = MyModel()

    training_input = torch.FloatTensor(info["inputs"]["training"].values)
    training_output = torch.FloatTensor(info["outputs"]["training"].values)
    test_input = torch.FloatTensor(info["inputs"]["validation"].values)
    test_output = torch.FloatTensor(info["outputs"]["validation"].values)

    criterion = torch.nn.BCELoss() # works for binary classification# without momentum parameter
    optimizer = torch.optim.SGD(model.parameters(), lr = 0.9, momentum=0.2)

    print("-- model created --")
    model.eval()
    y_pred = model(test_input)
    before_train = criterion(y_pred.squeeze(), test_output)
    print('Test loss before training' , before_train.item())

    model.train()
    epochs = 50
    errors = []
    for epoch in range(epochs):
        optimizer.zero_grad()
        # Forward pass
        y_pred = model(training_input)
        # Compute Loss
        loss = criterion(y_pred.squeeze(), training_output)
        errors.append(loss.item())    
        print('Epoch {}: train loss: {}'.format(epoch, loss.item()))

        # Backward pass
        loss.backward()
        optimizer.step()

    return model, errors

def calc_statistics(info, model):
    accuracy = 0.0
    # TODO: replace this...
    #predictions = model.predict(info["inputs"]["testing"])
    #
    #accuracy = cross_val_score(model, info["inputs"]["testing"], info["outputs"]["testing"],cv=10).mean()
    #score = mean_squared_error(info["outputs"]["testing"], predictions)
    criterion = torch.nn.BCELoss()

    model.eval()
    score_input = torch.FloatTensor(info["inputs"]["validation"].values)
    score_output = torch.FloatTensor(info["outputs"]["validation"].values)
    pred = model(score_input)
    after_train = criterion(pred.squeeze(), score_output)
    score = after_train.item()

    return {
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

        model, errors = create_model(info)

        stats = calc_statistics(info, model)

        print(json.dumps(stats, ensure_ascii=False, indent="\t", skipkeys=True))
        """
        import matplotlib.pyplot as plt
        import numpy as npdef plotcharts(errors):
            errors = np.array(errors)    plt.figure(figsize=(12, 5))    graf02 = plt.subplot(1, 2, 1) # nrows, ncols, index
            graf02.set_title('Errors')
            plt.plot(errors, '-')
            plt.xlabel('Epochs')    graf03 = plt.subplot(1, 2, 2)
            graf03.set_title('Tests')
            a = plt.plot(test_output.numpy(), 'yo', label='Real')
            plt.setp(a, markersize=10)
            a = plt.plot(y_pred.detach().numpy(), 'b+', label='Predicted')
            plt.setp(a, markersize=10)
            plt.legend(loc=7)
            plt.show()plotcharts(errors)
        """

if __name__ == "__main__":
    run()