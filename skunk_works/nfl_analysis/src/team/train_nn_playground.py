import os
import json
import numpy as np
import pandas as pd
import random as rd
import torch 
import matplotlib.pyplot as plt

def plotcharts(losses, test_output, pred):
    losses = np.array(losses)    
    plt.figure(figsize=(12, 5))

    errorGraph = plt.subplot(1, 2, 1) # nrows, ncols, index
    errorGraph.set_title('Loss')
    plt.plot(losses, '-')
    plt.xlabel('Epoch')    
    
    tests = plt.subplot(1, 2, 2)
    tests.set_title('Tests')

    test_line = plt.plot(test_output.numpy(), 'yo', label='Real')
    plt.setp(test_line, markersize=2)

    pred_line = plt.plot(pred.detach().numpy(), 'b+', label='Predicted')
    plt.setp(pred_line, markersize=2)
    
    plt.legend(loc=7)
    plt.show()

def run():
    n_input = 4 
    n_hidden = 15
    n_out = 1
    batch_size = 100
    learning_rate = 0.01
    epochs = 50000

    values = []#torch.randn(batch_size, n_input)
    knowns = []#(torch.rand(size=(batch_size, 1)) < 0.5).float()

    for epoch in range(batch_size):
        junk1 = rd.uniform(-1, 1)
        junk2 = rd.uniform(-1, 1)
        junk3 = rd.uniform(-1, 1)
        value = rd.uniform(-40, 40)

        values.append([junk1, junk2, junk3, value])
        knowns.append([value])
    
    values = torch.FloatTensor(values)
    knowns = torch.FloatTensor(knowns)
    print('--training data--')
    print(values)
    print(knowns)
    print('--sizes--')
    print(len(values))
    print(len(knowns))

    # https://pytorch.org/docs/stable/nn.html
    model = torch.nn.Sequential(
        torch.nn.Linear(n_input, n_hidden),
        torch.nn.ReLU(),
        torch.nn.Linear(n_hidden, n_out),
        torch.nn.SELU()
    )

    print(model)

    loss_function = torch.nn.MSELoss()
    optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate)

    losses = []
    for epoch in range(epochs):
        predictions = model(values)
        loss = loss_function(predictions, knowns)
        loss_value = loss.item()
        losses.append(loss.item())

        if epoch % 500 == 0:
            print(f'Epoch {epoch}: train loss: {loss_value}')

        model.zero_grad()
        loss.backward()

        optimizer.step()

    plotcharts(losses, knowns, predictions)

    return model, losses

if __name__ == "__main__":
    run()