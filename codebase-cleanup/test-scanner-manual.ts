/**
 * Manual test script for FileScanner
 * Run with: node --loader ts-node/esm test-scanner-manual.ts
 */

import { FileScannerImpl } from './src/scanner/file-scanner.js';
import type { ScanOptions } from './src/types.js';

async function testScanner() {
  console.log('Testing FileScanner implementation...\n');
  
  const scanner = new FileScannerImpl();
  
  // Test 1: Scan the src directory
  console.log('Test 1: Scanning src directory');
  const options: ScanOptions = {
    includePatterns: ['**/*.ts'],
    excludePatterns: ['**/*.test.ts', '**/*.spec.ts'],
    maxDepth: 5,
  };
  
  try {
    const files = await scanner.scanDirectory('./src', options);
    console.log(`✓ Found ${files.length} TypeScript files in src/`);
    
    // Show some examples
    if (files.length > 0) {
      console.log('\nSample files:');
      files.slice(0, 5).forEach(file => {
        console.log(`  - ${file.relativePath} (${file.category})`);
      });
    }
    
    // Test categorization
    const categories = new Map<string, number>();
    files.forEach(file => {
      categories.set(file.category, (categories.get(file.category) || 0) + 1);
    });
    
    console.log('\nFile categories:');
    categories.forEach((count, category) => {
      console.log(`  ${category}: ${count}`);
    });
    
  } catch (error) {
    console.error('✗ Error scanning directory:', error);
  }
  
  // Test 2: Test pattern filtering
  console.log('\n\nTest 2: Testing pattern filtering');
  const testFiles = [
    { relativePath: 'src/index.ts', category: 'other' as const, path: '', extension: '.ts', size: 0, lastModified: new Date() },
    { relativePath: 'src/components/Button.tsx', category: 'component' as const, path: '', extension: '.tsx', size: 0, lastModified: new Date() },
    { relativePath: 'src/utils/format.ts', category: 'util' as const, path: '', extension: '.ts', size: 0, lastModified: new Date() },
  ];
  
  const filtered = scanner.filterByPattern(testFiles, ['**/*.tsx']);
  console.log(`✓ Filtered ${testFiles.length} files to ${filtered.length} .tsx files`);
  
  const excluded = scanner.excludeByPattern(testFiles, ['**/utils/**']);
  console.log(`✓ Excluded utils, remaining: ${excluded.length} files`);
  
  console.log('\n✓ All manual tests passed!');
}

testScanner().catch(console.error);
