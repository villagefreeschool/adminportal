// MUI v7 Migration Script
// This script uses a simple search and replace approach to update files
// according to the Material UI v7 migration guidelines

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Typography variant changes
const typographyChanges = [
  {
    from: 'variant="body1"',
    to: 'variant="body-md"',
  },
  {
    from: 'variant="body2"',
    to: 'variant="body-sm"',
  },
];

// Find the files that need to be updated
console.log('Finding files with Typography components using body1/body2 variants...');
const typographyFiles = execSync(
  'grep -l "Typography[^>]*variant=\\"body[12]\\"" "$(find ./src -name "*.tsx")"',
  { encoding: 'utf8' },
)
  .split('\n')
  .filter(Boolean);

console.log(`Found ${typographyFiles.length} files to update`);

// Update each file
typographyFiles.forEach((file) => {
  console.log(`Updating ${file}...`);
  let content = fs.readFileSync(file, 'utf8');

  typographyChanges.forEach((change) => {
    content = content.replace(new RegExp(change.from, 'g'), change.to);
  });

  fs.writeFileSync(file, content);
});

console.log('Updates completed!');
