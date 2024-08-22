#!/bin/bash
set +e
# NOTE: This needs to be called > . ci/install.sh
# This is to link everything
CI_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ROOT_DIR=$( dirname $CI_DIR ) # Need to go up one directory
PYTHON_DIR=$ROOT_DIR/packages/python
# js code
npm install

# python code
if [[ $PYTHONPATH =~ $ROOT_DIR ]]; then
  echo "Python lib already linked..."
else
  echo 'Linking Python Lib...'
  PYTHON_LINK=$ROOT_DIR/build/python_link
  if [[ ! -e $PYTHON_LINK ]]; then
    echo ">> creating python link"
    mkdir -p $PYTHON_LINK
    ln -s $PYTHON_DIR $PYTHON_LINK/bmoor
  fi

  if [[ $PYTHONPATH == '' ]]; then
    export PYTHONPATH=$PYTHON_LINK
  else
    export PYTHONPATH=$PYTHON_LINK:$PYTHONPATH
  fi
fi

echo "PYTHONPATH > $PYTHONPATH"

exit(0)

python3 -m pip install -r $ROOT_DIR/requirements.txt
shopt -s nullglob
for dir in $PYTHON_DIR/*
do
  echo ">>> $dir"
  if [[ -f $dir/requirements.txt ]]; then
    python3 -m pip install -r $dir/requirements.txt
  fi
done