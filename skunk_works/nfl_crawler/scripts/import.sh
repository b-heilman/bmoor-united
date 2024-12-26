# Expected to be run from root directory
cd src

echo "---importing data---"
npx tsx import.ts

echo "---converting data---"
npx tsx convert.ts