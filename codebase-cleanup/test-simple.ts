import { FileScannerImpl } from './src/scanner/file-scanner.js';
import * as fs from 'fs/promises';
import * as path from 'path';

async function test() {
  console.log('Starting simple test...');
  const scanner = new FileScannerImpl();
  const testDir = path.join(process.cwd(), 'test-temp-simple');
  
  try {
    // Create test structure
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(path.join(testDir, 'test.ts'), 'content');
    
    console.log('Scanning directory...');
    const files = await scanner.scanDirectory(testDir, {
      includePatterns: [],
      excludePatterns: [],
    });
    
    console.log('Files found:', files.length);
    console.log('Test passed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Cleanup
    try {
      await fs.rm(testDir, { recursive: true, force: true });
      console.log('Cleanup done');
    } catch (e) {
      console.error('Cleanup error:', e);
    }
  }
}

test().then(() => {
  console.log('Done');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
