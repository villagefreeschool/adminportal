// ES Module for updating MUI v7 Typography variants
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

// Typography variant mappings
const variantMappings = {
  'body1': 'body-md',
  'body2': 'body-sm',
};

async function findFiles(pattern) {
  try {
    const { stdout } = await execPromise(`grep -l "${pattern}" ./src/**/**.tsx`);
    return stdout.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error(`Error finding files: ${error.message}`);
    return [];
  }
}

async function updateFile(filePath, oldVariant, newVariant) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const regex = new RegExp(`variant=["']${oldVariant}["']`, 'g');
    const newContent = content.replace(regex, `variant="${newVariant}"`);
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated ${filePath}: ${oldVariant} → ${newVariant}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error updating ${filePath}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('Starting Typography variant migration for MUI v7...');
  
  let totalUpdates = 0;
  
  for (const [oldVariant, newVariant] of Object.entries(variantMappings)) {
    console.log(`\nLooking for variant="${oldVariant}" to replace with variant="${newVariant}"...`);
    const files = await findFiles(`variant=["']${oldVariant}["']`);
    
    if (files.length === 0) {
      console.log(`No files found using variant="${oldVariant}"`);
      continue;
    }
    
    console.log(`Found ${files.length} files using variant="${oldVariant}"`);
    
    for (const file of files) {
      const updated = await updateFile(file, oldVariant, newVariant);
      if (updated) totalUpdates++;
    }
  }
  
  console.log(`\nMigration completed! Updated ${totalUpdates} files.`);
}

main().catch(console.error);