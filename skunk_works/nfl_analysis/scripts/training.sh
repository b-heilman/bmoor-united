set -e

cd ../src

# export NODE_OPTIONS=--max-old-space-size=8192
npx ts-node compute_training.ts

python3 models/train_siamese_classifier.py
