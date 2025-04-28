#!/bin/bash

# Typography variant replacement
echo "Updating Typography variants for MUI v7..."

# Update body1 to body-md
echo "Replacing variant=\"body1\" with variant=\"body-md\"..."
find ./src -name "*.tsx" -type f -exec sed -i '' 's/variant="body1"/variant="body-md"/g' {} \;

# Update body2 to body-sm
echo "Replacing variant=\"body2\" with variant=\"body-sm\"..."
find ./src -name "*.tsx" -type f -exec sed -i '' 's/variant="body2"/variant="body-sm"/g' {} \;

echo "Typography variants updated!"

echo "All MUI v7 updates completed!"