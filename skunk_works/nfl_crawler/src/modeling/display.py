import pandas as pd


def display_analysis(
    analysis: dict[str, pd.DataFrame],
    sort: None | str = None,
    head: None | int = None,
):
    for label, df in analysis.items():
        print(label)

        if sort is not None:
            df = df.sort_values(by=[sort], ascending=False)

        if head is not None:
            df = df.head(head)

        print(df.to_markdown())
