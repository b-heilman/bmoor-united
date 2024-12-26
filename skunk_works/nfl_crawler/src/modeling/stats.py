import os
import json
import torch
import pandas as pd
import pathlib

from sklearn.preprocessing import StandardScaler, Normalizer
from torch.utils.data import Dataset, DataLoader

base_dir = str(pathlib.Path(__file__).parent.resolve())
normalized_parquet_path = os.path.abspath(
    base_dir + "/../../cache/parquet/normalized.parquet"
)
training_info_path = os.path.abspath(base_dir + "/../../cache/parquet/training.json")
training_parquet_path = os.path.abspath(
    base_dir + "/../../cache/parquet/training.parquet"
)


# Custom Dataset
class LoaderSource(Dataset):
    def __init__(self, settings: dict = {"mode": ""}):
        """
        Args:
            dataframe (pd.DataFrame): The DataFrame containing data.
            feature_columns (list): List of column names for features.
            label_column (str): The column name for labels.
        """
        self.mask = None

        with open(training_info_path, "r") as f:
            self.info = json.load(f)

        dataframe = pd.read_parquet(training_parquet_path)
        feature_columns = dataframe.columns[len(self.info["headers"]) :]

        # mean = []
        # std = []
        # for feature in feature_columns:
        #    column = dataframe[feature]
        #    dataframe[feature] = (
        #        (column-column.mean())/column.std()
        #    ).fillna(0)
        # dataframe[feature] = (
        #    (column-column.min())/(column.max()-column.min())
        # ).fillna(0)
        # mean.append(dataframe[feature].mean())
        # std.append(dataframe[feature].std())

        scaler = StandardScaler()
        normalized = pd.concat(
            [
                dataframe[self.info["headers"]],
                pd.DataFrame(
                    scaler.fit_transform(dataframe[feature_columns]),
                    columns=feature_columns,
                ),
            ],
            axis=1,
        )
        normalized.to_parquet(normalized_parquet_path)

        print(
            normalized["qb1_passCmp"].min(),
            normalized["qb1_passCmp"].max(),
            normalized["qb1_passCmp"].mean(),
            normalized["qb1_passCmp"].std(),
        )

        home = normalized[normalized["home"] == True].reset_index()
        away = normalized[normalized["home"] == False].reset_index()

        label_column = "diff_norm"

        self.home = home
        self.away = away
        self.feature_columns = feature_columns
        self.label_column = label_column

    def set_mask(self, mask):
        self.mask = mask

    def __len__(self):
        return len(self.home)

    def __getitem__(self, idx):
        if torch.is_tensor(idx):
            idx = idx.tolist()

        # Extract features and label
        home = self.home.loc[idx, self.feature_columns].values.astype("float32")
        away = self.away.loc[idx, self.feature_columns].values.astype("float32")

        if self.mask is not None:
            if isinstance(idx, list):
                label = [
                    self.mask[str(value)] if value in self.mask else value
                    for value in self.home.loc[idx, self.label_column]
                ]
            else:
                value = self.home.loc[idx, self.label_column].astype("float32")
                dex = str(value)
                label = float(self.mask[dex] if dex in self.mask else value)
        else:
            label = self.home.loc[idx, self.label_column].astype("float32")

        return torch.tensor(home), torch.tensor(away), torch.tensor(label)


# Create Dataset and DataLoader
dataset = LoaderSource()
# dataloader = DataLoader(source, batch_size=2, shuffle=True)

# Example usage
# for batch in dataloader:
#    home, away, labels = batch
#    print(f"home: {home}, away: {away}, labels: {labels}")
