
set -e 

python -m black -- src/

python -m mypy --ignore-missing-imports src/

python -m unittest discover -s src/ -t src -p '*_spec.py'

npx prettier --write ./src

eslint ./src

mocha -r ts-node/register --recursive \"./src/*.spec.ts\"
