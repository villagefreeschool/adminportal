#!/bin/bash

# Update import statements for Grid2 to Grid
echo "Updating import statements from Grid2 to Grid..."
find ./src -name "*.tsx" -type f -exec sed -i '' 's/import { \([^}]*\)Grid2\([^}]*\) } from/import { \1Grid\2 } from/g' {} \;
find ./src -name "*.tsx" -type f -exec sed -i '' 's/import Grid2 from/import Grid from/g' {} \;

# Update Grid2 component usage to Grid
echo "Updating Grid2 component usage to Grid..."
find ./src -name "*.tsx" -type f -exec sed -i '' 's/<Grid2/<Grid/g' {} \;
find ./src -name "*.tsx" -type f -exec sed -i '' 's/<\/Grid2>/<\/Grid>/g' {} \;

echo "Grid updates completed!"