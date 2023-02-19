import os
import json
import numpy as np
import pandas as pd
import torch 
import matplotlib.pyplot as plt

from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler

le = LabelEncoder()

# Defining S3 bucket names
seasons = ['2019', '2020', '2021', '2022']

def load_training_data(season):
    incoming = json.load(open(os.path.join(
        os.path.dirname(__file__),
        f'../../data/frames/{season}.json'
    )))

    return pd.DataFrame(
        np.array(incoming['values']), 
        columns=incoming['columns']
    )

def create_training_info(training_df):
    # Split the
    training_sets = training_df.drop(columns=["label"])
    training_values = (training_df["label"] > 0)

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

    # transform these into something useful
    train_output = list(map(
        lambda v: [v],
        train_output.values
    ))

    val_output = list(map(
        lambda v: [v],
        val_output.values
    ))

    scoring_output = list(map(
        lambda v: [v],
        scoring_output.values
    ))

    input_transformer = MinMaxScaler()
    input_transformer.fit(train_input.values)

    output_transformer = MinMaxScaler()
    output_transformer.fit(train_output)

    return {
        "columns": train_input.columns,
        "inputs": {
            "training": input_transformer.transform(train_input.values), 
            "validation": input_transformer.transform(val_input.values), 
            "scoring": input_transformer.transform(scoring_input.values)
        },
        "outputs": {
            "training": output_transformer.transform(train_output), 
            "validation": output_transformer.transform(val_output), 
            "scoring": output_transformer.transform(scoring_output)
        },
        "transformer": {
            "input": input_transformer,
            "output": output_transformer 
        }
    }

def plotcharts(losses, test_output, pred):
    losses = np.array(losses)    
    plt.figure(figsize=(12, 5))

    errorGraph = plt.subplot(1, 2, 1) # nrows, ncols, index
    errorGraph.set_title('Loss')
    plt.plot(losses, '-')
    plt.xlabel('Epoch')    
    
    tests = plt.subplot(1, 2, 2)
    tests.set_title('Tests')

    test_line = plt.plot(test_output, 'yo', label='Real')
    plt.setp(test_line, markersize=2)

    pred_line = plt.plot(pred, 'b+', label='Predicted')
    plt.setp(pred_line, markersize=2)
    
    plt.legend(loc=7)
    plt.show()

# https://pytorch.org/tutorials/beginner/introyt/modelsyt_tutorial.html
def create_model(info):
    features = len(info["columns"])

    n_input = features 
    n_hidden = features * features
    n_out = 1
    learning_rate = 0.01
    epochs = 5000

    # ---- Model
    # TODO: convert to classification problem
    model = torch.nn.Sequential(
        #torch.nn.BatchNorm1d(n_input),
        torch.nn.Linear(n_input, n_hidden),
        torch.nn.ReLU(),
        torch.nn.Linear(n_hidden, n_out),
        torch.nn.SELU()
    )

    print(model)

    training_input = torch.FloatTensor(info["inputs"]["training"])
    training_output = torch.FloatTensor(info["outputs"]["training"])

    validation_input = torch.FloatTensor(info["inputs"]["validation"])
    validation_output = torch.FloatTensor(info["outputs"]["validation"])

    loss_fn = torch.nn.MSELoss()
    optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate)

    print("-- model created --")
    model.eval()
    predictions = model(validation_input)
    train = loss_fn(predictions, validation_output)
    print('Test loss before training' , train.item())
    print('--training data--')
    print(training_input.size())
    print(training_output.size())

    model.train()
    losses = []
    for epoch in range(epochs):
        predictions = model(training_input)
        loss = loss_fn(predictions, training_output)
        loss_value = loss.item()
        losses.append(loss.item())

        if epoch % 500 == 0:
            #print(list(model.parameters())[0])
            print(f'Epoch {epoch}: train loss: {loss_value}')

        model.zero_grad()
        loss.backward()

        optimizer.step()
    
    model.eval()
    predictions = model(validation_input)
    train = loss_fn(predictions, validation_output)
    print('Test loss after training' , train.item())

    transformer = info['transformer']['output']
    predictions = transformer.inverse_transform(predictions.detach().numpy())
    validation_output = transformer.inverse_transform(validation_output.detach().numpy())
    for dex, [pred_value] in enumerate(predictions):
        [output_value] = validation_output[dex]

        diff = abs(output_value - pred_value)
        perc = diff / abs(output_value)
        print(f'{diff} @{perc}: {output_value} predicted as {pred_value}')
       
    plotcharts(losses, validation_output, predictions)

    return model, losses

def calc_statistics(info, model):
    accuracy = 0.0
    # TODO: replace this...
    #predictions = model.predict(info["inputs"]["testing"])
    #
    #accuracy = cross_val_score(model, info["inputs"]["testing"], info["outputs"]["testing"],cv=10).mean()
    #score = mean_squared_error(info["outputs"]["testing"], predictions)
    criterion = torch.nn.MSELoss()

    model.eval()
    score_input = torch.FloatTensor(info["inputs"]["validation"])
    score_output = torch.FloatTensor(info["outputs"]["validation"])
    pred = model(score_input)
    after_train = criterion(pred, score_output)
    score = after_train.item()

    return {
        "accuracy": accuracy,
        "score": score,
        "dimensions": {
            "features": len(info["columns"]),
            "training": len(info["inputs"]["training"]),
            "validation": len(info["inputs"]["validation"]),
            "scoring": len(info["inputs"]["scoring"]),
        }
    }

def run():
    for season in seasons[-1:]:
        info = create_training_info(load_training_data(season))

        model, losses = create_model(info)

        stats = calc_statistics(info, model)

        print(json.dumps(stats, ensure_ascii=False, indent="\t", skipkeys=True))

if __name__ == "__main__":
    run()