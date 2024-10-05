python3 -m black -- src/modeling
python3 -m black -- src/notebooks

python3 -m mypy --ignore-missing-imports src/modeling
python3 -m nbqa mypy --ignore-missing-imports src/notebooks
