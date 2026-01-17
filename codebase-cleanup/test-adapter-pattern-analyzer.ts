/**
 * Manual test for AdapterPatternAnalyzer
 * Tests the detection of unnecessary adapter patterns
 */

import { Project } from 'ts-morph';
import { AdapterPatternAnalyzer } from './src/analyzers/adapter-pattern-analyzer';
import type { FileInfo } from './src/types';

// Helper to create FileInfo
function createFileInfo(path: string): FileInfo {
  return {
    path: `/test/${path}`,
    relativePath: path,
    extension: '.ts',
    size: 1000,
    category: 'util',
  };
}

async function testAdapterDetection() {
  console.log('Testing AdapterPatternAnalyzer...\n');

  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      target: 99, // ESNext
      module: 99, // ESNext
    },
  });

  // Test 1: Simple pass-through wrapper (should be flagged)
  console.log('Test 1: Simple pass-through wrapper');
  const code1 = `
    function getUserById(id: string) {
      return database.getUser(id);
    }

    const fetchUser = (userId: string) => database.getUser(userId);

    async function loadUserData(id: string) {
      return await userService.fetchUser(id);
    }
  `;

  const sourceFile1 = project.createSourceFile('test1.ts', code1);
  const analyzer = new AdapterPatternAnalyzer();
  const issues1 = await analyzer.analyze(createFileInfo('test1.ts'), sourceFile1);
  
  console.log(`Found ${issues1.length} issues:`);
  issues1.forEach(issue => {
    console.log(`  - ${issue.description}`);
    console.log(`    Severity: ${issue.severity}`);
    console.log(`    Recommendation: ${issue.recommendation.substring(0, 100)}...`);
  });
  console.log();

  // Test 2: Wrapper with error handling (should NOT be flagged)
  console.log('Test 2: Wrapper with error handling (adds value)');
  const code2 = `
    async function getUserById(id: string) {
      try {
        return await database.getUser(id);
      } catch (error) {
        console.error('Failed to get user:', error);
        throw new Error('User not found');
      }
    }
  `;

  const sourceFile2 = project.createSourceFile('test2.ts', code2);
  const issues2 = await analyzer.analyze(createFileInfo('test2.ts'), sourceFile2);
  
  console.log(`Found ${issues2.length} issues (should be 0):`);
  issues2.forEach(issue => {
    console.log(`  - ${issue.description}`);
  });
  console.log();

  // Test 3: Wrapper with validation (should NOT be flagged)
  console.log('Test 3: Wrapper with validation (adds value)');
  const code3 = `
    function getUserById(id: string) {
      if (!id) {
        throw new Error('ID is required');
      }
      return database.getUser(id);
    }
  `;

  const sourceFile3 = project.createSourceFile('test3.ts', code3);
  const issues3 = await analyzer.analyze(createFileInfo('test3.ts'), sourceFile3);
  
  console.log(`Found ${issues3.length} issues (should be 0):`);
  issues3.forEach(issue => {
    console.log(`  - ${issue.description}`);
  });
  console.log();

  // Test 4: Wrapper with data transformation (should NOT be flagged)
  console.log('Test 4: Wrapper with data transformation (adds value)');
  const code4 = `
    async function getUserById(id: string) {
      const user = await database.getUser(id);
      return {
        ...user,
        fullName: user.firstName + ' ' + user.lastName
      };
    }
  `;

  const sourceFile4 = project.createSourceFile('test4.ts', code4);
  const issues4 = await analyzer.analyze(createFileInfo('test4.ts'), sourceFile4);
  
  console.log(`Found ${issues4.length} issues (should be 0):`);
  issues4.forEach(issue => {
    console.log(`  - ${issue.description}`);
  });
  console.log();

  // Test 5: Wrapper with logging (should NOT be flagged)
  console.log('Test 5: Wrapper with logging (adds value)');
  const code5 = `
    async function getUserById(id: string) {
      console.log('Fetching user:', id);
      const result = await database.getUser(id);
      console.log('User fetched:', result);
      return result;
    }
  `;

  const sourceFile5 = project.createSourceFile('test5.ts', code5);
  const issues5 = await analyzer.analyze(createFileInfo('test5.ts'), sourceFile5);
  
  console.log(`Found ${issues5.length} issues (should be 0):`);
  issues5.forEach(issue => {
    console.log(`  - ${issue.description}`);
  });
  console.log();

  // Test 6: Multiple simple wrappers (should all be flagged)
  console.log('Test 6: Multiple simple wrappers');
  const code6 = `
    function createUser(data: any) {
      return userService.create(data);
    }

    function updateUser(id: string, data: any) {
      return userService.update(id, data);
    }

    function deleteUser(id: string) {
      return userService.delete(id);
    }
  `;

  const sourceFile6 = project.createSourceFile('test6.ts', code6);
  const issues6 = await analyzer.analyze(createFileInfo('test6.ts'), sourceFile6);
  
  console.log(`Found ${issues6.length} issues (should be 3):`);
  issues6.forEach(issue => {
    console.log(`  - ${issue.description}`);
  });
  console.log();

  // Test 7: Auth-related wrapper (should be flagged)
  console.log('Test 7: Auth-related simple wrapper');
  const code7 = `
    function checkAuth(userId: string) {
      return supabase.auth.getUser(userId);
    }

    const verifyUser = (id: string) => authService.verify(id);
  `;

  const sourceFile7 = project.createSourceFile('test7.ts', code7);
  const issues7 = await analyzer.analyze(createFileInfo('test7.ts'), sourceFile7);
  
  console.log(`Found ${issues7.length} issues:`);
  issues7.forEach(issue => {
    console.log(`  - ${issue.description}`);
    console.log(`    Type: ${issue.type}`);
  });
  console.log();

  // Summary
  console.log('='.repeat(60));
  console.log('SUMMARY:');
  console.log(`Test 1 (simple wrappers): ${issues1.length} issues (expected: 3)`);
  console.log(`Test 2 (with error handling): ${issues2.length} issues (expected: 0)`);
  console.log(`Test 3 (with validation): ${issues3.length} issues (expected: 0)`);
  console.log(`Test 4 (with transformation): ${issues4.length} issues (expected: 0)`);
  console.log(`Test 5 (with logging): ${issues5.length} issues (expected: 0)`);
  console.log(`Test 6 (multiple wrappers): ${issues6.length} issues (expected: 3)`);
  console.log(`Test 7 (auth wrappers): ${issues7.length} issues (expected: 2)`);
  console.log('='.repeat(60));
}

// Run the test
testAdapterDetection().catch(console.error);
