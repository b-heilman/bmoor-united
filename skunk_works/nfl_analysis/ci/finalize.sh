
set -e 

python3 -m black -- src/

python3 -m mypy --ignore-missing-imports src/

python3 -m unittest discover -s src/ -t src -p '*_spec.py'

npx prettier --write ./src

npx eslint ./src

npx NODE_OPTIONS=\"--import=@bmoor/bootstrap/src/node-typescript.js\" mocha -r ts-node/register --recursive \"./src/*.spec.ts\"
